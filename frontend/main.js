const BASE_URL = "http://127.0.0.1:8000";

const app = document.getElementById("app");
const linkLogin = document.getElementById("linkLogin");
const linkRegister = document.getElementById("linkRegister");
const linkEventos = document.getElementById("linkEventos");
const linkLogout = document.getElementById("linkLogout");

// Estado de sesión en el front
let isLoggedIn = false;
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

  app.innerHTML = `
    <h2>Registro de Usuario</h2>
    <form id="register-form">
      <label for="username">Nombre de usuario:</label><br>
      <input type="text" id="username" required><br><br>
      
      <label for="email">Correo electrónico:</label><br>
      <input type="email" id="email" required><br><br>
      
      <label for="password">Contraseña:</label><br>
      <input type="password" id="password" required><br><br>
      
      <button type="submit">Registrarse</button>
    </form>
    <div id="register-error" style="color:red;"></div>
  `;

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
        alert("Registro exitoso: " + data.message);
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

  app.innerHTML = `
    <h2>Iniciar Sesión</h2>
    <form id="login-form">
      <label for="email">Correo electrónico:</label><br>
      <input type="email" id="email" required><br><br>
      
      <label for="password">Contraseña:</label><br>
      <input type="password" id="password" required><br><br>
      
      <button type="submit">Iniciar Sesión</button>
    </form>
    <div id="login-error" style="color:red;"></div>
  `;

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
        alert("Inicio de sesión exitoso");

        // Mostrar Logout, ocultar Login y Register
        linkLogout.style.display = "inline";
        linkLogin.style.display = "none";
        linkRegister.style.display = "none";

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

  fetch(`${BASE_URL}/api/eventos/`, {
    credentials: "include", // Enviamos cookies
  })
    .then((resp) => resp.json())
    .then((data) => {
      let html = `
        <h2>Eventos Disponibles</h2>
        <div class="search-box">
          <input type="text" id="busqueda" placeholder="Buscar por nombre..." />
          <button id="btnBuscar">Buscar</button>
        </div>
        <div id="eventos-list" class="eventos-grid">
      `;

      data.forEach((evento) => {
        html += `
          <div class="evento-card">
            <h3>${evento.nombre}</h3>
            <p><strong>Fecha:</strong> ${evento.fecha} | <strong>Hora:</strong> ${evento.hora}</p>
            <p><strong>Lugar:</strong> ${evento.lugar}</p>
            <button onclick="renderReservaAsientos(${evento.id})">Reservar Asientos</button>
          </div>
        `;
      });

      html += `</div>`;
      app.innerHTML = html;

      // Manejo de la búsqueda
      const btnBuscar = document.getElementById("btnBuscar");
      btnBuscar.addEventListener("click", () => {
        const texto = document.getElementById("busqueda").value.toLowerCase();
        // Filtrado en cliente
        const eventosFiltrados = data.filter((evt) =>
          evt.nombre.toLowerCase().includes(texto)
        );
        renderEventosFiltrados(eventosFiltrados);
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
        <h3>${evento.nombre}</h3>
        <p><strong>Fecha:</strong> ${evento.fecha} | <strong>Hora:</strong> ${evento.hora}</p>
        <p><strong>Lugar:</strong> ${evento.lugar}</p>
        <button onclick="renderReservaAsientos(${evento.id})">Reservar Asientos</button>
      </div>
    `;
  });

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
        <h2>Reservar Asientos para Evento #${eventoId}</h2>
        <div class="asientos-container" id="asientos-container">
      `;

      data.asientosDisponibles.forEach((asiento) => {
        html += `
          <div class="asiento" onclick="seleccionarAsiento('${asiento}')">
            ${asiento}
          </div>
        `;
      });

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
function seleccionarAsiento(asiento) {
  const asientoDivs = document.querySelectorAll(".asiento");
  // Toggle visual
  asientoDivs.forEach((div) => {
    if (div.textContent === asiento) {
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
    alert("No has seleccionado ningún asiento.");
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
        alert(
          "Reserva confirmada. Revisa tu correo electrónico (si se implementó)."
        );
        // Limpiar
        asientosSeleccionados = [];
        renderEventosList();
      } else {
        alert("Hubo un problema al reservar: " + data.error);
      }
    })
    .catch((err) => console.error(err));
}

// Cerrar Sesión
function logoutUser() {
  // fetch(`${BASE_URL}/api/logout/`, { method: "POST", credentials: "include" });

  isLoggedIn = false;
  linkLogout.style.display = "none";
  linkLogin.style.display = "inline";
  linkRegister.style.display = "inline";

  asientosSeleccionados = [];

  alert("Sesión cerrada");
  renderLoginForm();
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // Al inicio, se asume que no se está logeado
  isLoggedIn = false;
  linkLogout.style.display = "none";
  linkLogin.style.display = "inline";
  linkRegister.style.display = "inline";

  // Renderiza el login por defecto
  renderLoginForm();
});
