const BASE_URL = "http://127.0.0.1:8000";

const app = document.getElementById("app");
const linkLogin = document.getElementById("linkLogin");
const linkRegister = document.getElementById("linkRegister");
const linkEventos = document.getElementById("linkEventos");
const linkLogout = document.getElementById("linkLogout");
const userNameSpan = document.getElementById("currentUserName");

// Estado de sesión en el front
let isLoggedIn = false;
// Guarda el nombre de usuario
let currentUser = null;
// Lista de asientos seleccionados para la reserva
let asientosSeleccionados = [];

// Listeners de navbar
linkLogin.addEventListener("click", (e) => {
  e.preventDefault();
  renderLoginForm();
});
linkRegister.addEventListener("click", (e) => {
  e.preventDefault();
  renderRegisterForm();
});
linkEventos.addEventListener("click", (e) => {
  e.preventDefault();
  renderEventosList();
});
linkLogout.addEventListener("click", (e) => {
  e.preventDefault();
  logoutUser();
});

// Función: Mostrar Mensajes de:
// Éxito
function showSuccessMessage(msg) {
  const div = document.createElement("div");
  div.className = "success-message";
  div.textContent = msg;
  app.prepend(div);
  setTimeout(() => div.remove(), 3000);
}

// Error
function showErrorMessage(msg) {
  const div = document.createElement("div");
  div.className = "error-message";
  div.textContent = msg;
  app.prepend(div);
  setTimeout(() => div.remove(), 3000);
}

// Formulario de Registro
function renderRegisterForm() {
  asientosSeleccionados = [];

  const html = `
    <div class="auth-container">
      <!-- Panel Izquierdo: Formulario -->
      <div class="auth-left">
        <div class="auth-form">
          <h2>Registrarse</h2>
          <form id="register-form">
            <div class="form-group">
              <label for="username">Nombre de usuario</label>
              <input type="text" id="username" required />
            </div>
            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input type="email" id="email" required />
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" required />
            </div>
            <button type="submit" class="btn-primary">Crear Cuenta</button>
            <div id="register-error" class="error-text"></div>
          </form>
        </div>
      </div>

      <!-- Panel Derecho: Imagen y Texto Promocional -->
      <div class="auth-right">
        <div class="hero-content">
          <h2>¡Únete a nuestra experiencia!</h2>
          <p>Regístrate y reserva entradas para los mejores eventos.</p>
        </div>
      </div>
    </div>
  `;
  app.innerHTML = html;

  const registerForm = document.getElementById("register-form");
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          title: "Registro exitoso",
          text: data.message,
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        renderLoginForm(); // Renderiza el login al momento de registrarse
      } else {
        const errorData = await response.json();
        document.getElementById("register-error").textContent =
          errorData.error || "Error al registrarse.";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// Formulario de Login
function renderLoginForm() {
  asientosSeleccionados = [];

  const html = `
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-form">
          <h2>Iniciar Sesión</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input type="email" id="email" required />
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" required />
            </div>
            <button type="submit" class="btn-primary">Ingresar</button>
            <div id="login-error" class="error-text"></div>
          </form>
        </div>
      </div>
      <div class="auth-right">
        <div class="hero-content">
          <h2>Bienvenido de nuevo</h2>
          <p>Inicia sesión y reserva tus asientos para los próximos eventos.</p>
        </div>
      </div>
    </div>
  `;
  app.innerHTML = html;

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${BASE_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Para que se incluyan cookies y Django reconozca la sesión
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        isLoggedIn = true;
        currentUser = data.username || "";

        // Mostrar Logout, ocultar Login y Register
        linkLogout.style.display = "inline";
        linkLogin.style.display = "none";
        linkRegister.style.display = "none";
        userNameSpan.textContent = currentUser;

        Swal.fire({
          title: "Inicio de sesión exitoso",
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        renderEventosList(); // Ir a la lista de eventos
      } else {
        const errorData = await response.json();
        document.getElementById("login-error").textContent =
          errorData.error || "Credenciales inválidas.";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// Lista de eventos
function renderEventosList() {
  // Al entrar a la pantalla de eventos, limpiamos asientos
  asientosSeleccionados = [];

  if (!isLoggedIn) {
    showErrorMessage("Debes iniciar sesión para ver los eventos");
    return renderLoginForm();
  }

  fetch(`${BASE_URL}/api/eventos/`, { credentials: "include" })
    .then((resp) => resp.json())
    .then((data) => {
      // Se guarda la lista completa en una variable global
      window.allEvents = data;

      // HTML incluyendo inputs para filtrar por fecha/hora
      let html = `
        <h2>Eventos Disponibles</h2>
        <br/>
        <h3>Filtrar</h3>
        <br/>
        <!-- Filtros -->
        <div class="filter-box">          
          <br/>
          <label for="filter-date">Fecha:</label>
          <input type="date" id="filter-date" />
          <button id="btnFilterDate">Filtrar Fecha</button>
          <br/>
          <label for="filter-hour">Hora:</label>
          <select id="filter-hour" disabled>
            <option value="">-- Selecciona hora --</option>
          </select>
          <button id="btnFilterHour" disabled>Filtrar Hora</button>
        </div>

        <!-- Búsqueda -->
        <div class="search-box">
          <input type="text" id="busqueda" placeholder="Buscar por nombre..." />
          <button id="btnBuscar">Buscar</button>
        </div>

        <!-- Listado de eventos -->
        <div id="eventos-list" class="eventos-grid">
      `;

      data.forEach((evento) => {
        html += `
          <div class="evento-card">
            <img src="${
              evento.image_url || "https://via.placeholder.com/300"
            }" alt="Imagen Evento" />
            <h3>${evento.nombre}</h3>
            <p><strong>Fecha:</strong> ${
              evento.fecha
            } | <strong>Hora:</strong> ${evento.hora}</p>
            <p><strong>Lugar:</strong> ${evento.lugar}</p>
            <button onclick="renderReservaAsientos(${
              evento.id
            })">Reservar Asientos</button>
          </div>
        `;
      });

      html += `</div>`;

      app.innerHTML = html;

      // Referencias a los controles de filtro
      const btnBuscar = document.getElementById("btnBuscar");
      const inputBusqueda = document.getElementById("busqueda");
      const btnFilterDate = document.getElementById("btnFilterDate");
      const filterDate = document.getElementById("filter-date");
      const filterHourSelect = document.getElementById("filter-hour");
      const btnFilterHour = document.getElementById("btnFilterHour");

      // 1) FILTRAR POR NOMBRE (texto)
      btnBuscar.addEventListener("click", () => {
        const texto = inputBusqueda.value.toLowerCase();
        // Filtrado en cliente: coincidencia en nombre
        const eventosFiltrados = window.allEvents.filter((evt) =>
          evt.nombre.toLowerCase().includes(texto)
        );
        renderEventosFiltrados(eventosFiltrados);
      });

      // 2) FILTRAR POR FECHA
      btnFilterDate.addEventListener("click", () => {
        const selectedDate = filterDate.value; // YYYY-MM-DD
        if (!selectedDate) {
          showErrorMessage("Por favor, selecciona una fecha.");
          return;
        }
        // Filtrar
        const filtradosPorFecha = window.allEvents.filter(
          (evt) => evt.fecha === selectedDate
        );
        // Render
        renderEventosFiltrados(filtradosPorFecha);

        // Generar lista única de horas para esa fecha
        const horasUnicas = [...new Set(filtradosPorFecha.map((e) => e.hora))];
        // Rellenar el select de horas
        filterHourSelect.innerHTML = `<option value="">-- Selecciona hora --</option>`;
        horasUnicas.forEach((hr) => {
          filterHourSelect.innerHTML += `<option value="${hr}">${hr}</option>`;
        });
        // Habilitar el select y el botón
        filterHourSelect.disabled = false;
        btnFilterHour.disabled = false;
      });

      // 3) FILTRAR POR HORA (sobre la fecha ya filtrada)
      btnFilterHour.addEventListener("click", () => {
        const selectedDate = filterDate.value;
        const selectedHour = filterHourSelect.value;
        if (!selectedDate) {
          showErrorMessage("Primero debes seleccionar una fecha.");
          return;
        }
        if (!selectedHour) {
          showErrorMessage("Por favor, selecciona una hora.");
          return;
        }

        // Se filtra la lista global por la fecha y hora
        const filtradosDateHour = window.allEvents.filter(
          (evt) => evt.fecha === selectedDate && evt.hora === selectedHour
        );
        renderEventosFiltrados(filtradosDateHour);
      });
    })
    .catch((err) => {
      console.error(err);
      showErrorMessage("Error al cargar los eventos");
    });
}

function renderEventosFiltrados(eventos) {
  const eventosListDiv = document.getElementById("eventos-list");
  let newHtml = "";

  eventos.forEach((evento) => {
    newHtml += `
      <div class="evento-card">
        <img src="${
          evento.image_url || "https://via.placeholder.com/300"
        }" alt="Imagen Evento" />
        <h3>${evento.nombre}</h3>
        <p><strong>Fecha:</strong> ${evento.fecha} | <strong>Hora:</strong> ${
      evento.hora
    }</p>
        <p><strong>Lugar:</strong> ${evento.lugar}</p>
        <button class="btn-reservar" onclick="renderReservaAsientos(${
          evento.id
        })">Reservar Asientos</button>
      </div>
    `;
  });

  if (eventos.length === 0) {
    newHtml = "<p>No hay eventos que coincidan con el filtro.</p>";
  }

  eventosListDiv.innerHTML = newHtml;
}

// Renderizar asientos
function renderReservaAsientos(eventoId) {
  asientosSeleccionados = [];

  fetch(`${BASE_URL}/api/eventos/${eventoId}/asientos/`, {
    credentials: "include",
  })
    .then((resp) => resp.json())
    .then((data) => {
      let html = `
      <button class="back-button" onclick="renderEventosList()">Regresar</button>
        <h2>Reservar Asientos para Evento: ${eventoId}</h2>
        <div class="asientos-container" id="asientos-container">
      `;

      const totalAsientos = 50;
      let asientosOcupados = data.asientosOcupados || [];

      for (let i = 1; i <= totalAsientos; i++) {
        const aName = `A${i}`;
        // Verifica si está ocupado
        const isOcupado = asientosOcupados.includes(aName);
        html += `
          <div class="asiento ${isOcupado ? "ocupado" : ""}"
               onclick="seleccionarAsiento('${aName}', ${isOcupado})">
            ${aName}
          </div>
        `;
      }

      html += `</div>
        <div>
          <h3>Asientos Seleccionados:</h3>
          <p id="asientos-seleccionados"></p>
          <button id="btnConfirmar">Confirmar Reserva</button>
        </div>
      `;

      app.innerHTML = html;

      // Botón para confirmar
      const btnConfirmar = document.getElementById("btnConfirmar");
      btnConfirmar.addEventListener("click", () => confirmarReserva(eventoId));
    })
    .catch((err) => {
      console.error(err);
      showErrorMessage("Error al cargar asientos.");
    });
}

// Seleccionar Asiento
function seleccionarAsiento(asiento, isOcupado) {
  if (isOcupado) {
    // No hacemos nada, está ocupado
    return;
  }
  // Toggle en la interfaz
  const asientoDivs = document.querySelectorAll(".asiento");
  asientoDivs.forEach((div) => {
    if (div.textContent === asiento && !div.classList.contains("ocupado")) {
      div.classList.toggle("seleccionado");
    }
  });

  // Añadir o remover del array
  if (!asientosSeleccionados.includes(asiento)) {
    asientosSeleccionados.push(asiento);
  } else {
    asientosSeleccionados = asientosSeleccionados.filter((a) => a !== asiento);
  }

  // Mostrar lista
  document.getElementById("asientos-seleccionados").textContent =
    asientosSeleccionados.join(", ");
}

// Confirmar Reserva
function confirmarReserva(eventoId) {
  if (asientosSeleccionados.length === 0) {
    Swal.fire({
      title: "No has seleccionado ningún asiento.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  fetch(`${BASE_URL}/api/reservar/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ eventoId, asientos: asientosSeleccionados }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "Reserva confirmada",
          text: "Revisa tu correo electrónico para más detalles.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        // Limpiar
        asientosSeleccionados = [];
        renderEventosList();
      } else {
        Swal.fire({
          title: "Hubo un problema al reservar: ",
          text: data.error,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    })
    .catch((err) => console.error(err));
}

// Cerrar Sesión
function logoutUser() {
  // fetch(`${BASE_URL}/api/logout/`, { method: "POST", credentials: "include" });

  fetch(`${BASE_URL}/api/logout/`, {
    method: "POST",
    credentials: "include",
  }).catch((err) => console.error(err));

  isLoggedIn = false;
  currentUser = null;
  linkLogout.style.display = "none";
  linkLogin.style.display = "inline";
  linkRegister.style.display = "inline";
  userNameSpan.textContent = "";

  asientosSeleccionados = [];

  Swal.fire({
    title: "Sesión cerrada",
    icon: "success",
    confirmButtonText: "Aceptar",
  });
  renderLoginForm();
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // Al inicio, se asume que no se está logeado
  isLoggedIn = false;
  currentUser = null;
  linkLogout.style.display = "none";
  linkLogin.style.display = "inline";
  linkRegister.style.display = "inline";
  userNameSpan.textContent = "";

  // Renderiza el login por defecto
  renderLoginForm();
});

let carouselIndex = 0;
let carouselData = []; // almacenará las imágenes de los eventos
let carouselInterval;

function renderCarousel() {
  const track = document.getElementById("carousel-track");
  if (!track) return; // si no existe el contenedor, salimos

  // Limpiar contenido
  track.innerHTML = "";

  // Crear slides según los eventos
  carouselData.forEach((evt, i) => {
    const slide = document.createElement("div");
    slide.classList.add("carousel-slide");
    // Establecemos la imagen como fondo
    slide.style.backgroundImage = `url(${
      evt.image_url || "https://via.placeholder.com/1200x300"
    })`;
    track.appendChild(slide);
  });

  // Iniciar el carrusel automático cada 5s
  clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % carouselData.length;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  }, 5000);
}

document.querySelector(".cta-button").addEventListener("click", () => {
  const eventosSection = document.getElementById("app");
  eventosSection.scrollIntoView({ behavior: "smooth" });
});
