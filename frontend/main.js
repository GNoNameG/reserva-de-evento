const app = document.getElementById("app");
const linkLogin = document.getElementById("linkLogin");
const linkRegister = document.getElementById("linkRegister");
const linkEventos = document.getElementById("linkEventos");
const linkLogout = document.getElementById("linkLogout");

// Almacena el token del login
let isLoggedIn = false;

// Los Listeners de los enlaces
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

// Renderiza el formulario de register
function renderRegisterForm() {
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

    // Acá es donde se llama a la API de Django
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        // Registro exitoso
        const data = await response.json();
        alert("Registro exitoso: " + data.message);
        renderLoginForm(); // redirigir al login
      } else {
        // Error en el register
        const errorData = await response.json();
        document.getElementById("register-error").textContent =
          errorData.error || "Error al registrarse.";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// Renderiza el formulario de login
function renderLoginForm() {
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

    // Se llama a la API de Django para el login
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Acá se almacena el token
        isLoggedIn = true;
        linkLogout.style.display = "inline";
        alert("Inicio de sesión exitoso");
        renderEventosList();
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

// Renderiza la lista de eventos
function renderEventosList() {
  // Acá se verifica si el usuario está loggeado
  if (!isLoggedIn) {
    alert("Debe iniciar sesión para ver los eventos");
    return renderLoginForm();
  }
  // Petición a la API para obtener la lista de eventos
  fetch("http://127.0.0.1:8000/api/eventos/")
    .then((response) => response.json())
    .then((data) => {
      let html = "<h2>Eventos Disponibles</h2>";
      html +=
        '<input type="text" id="busqueda" placeholder="Buscar por nombre...">';
      html += '<button id="btnBuscar">Buscar</button>';
      html += '<div id="eventos-list">';

      data.forEach((evento) => {
        html += `
          <div>
            <h3>${evento.nombre}</h3>
            <p>Fecha: ${evento.fecha} | Hora: ${evento.hora} | Lugar: ${evento.lugar}</p>
            <button onclick="renderReservaAsientos(${evento.id})">Reservar Asientos</button>
          </div>
          <hr>
        `;
      });
      html += "</div>";

      app.innerHTML = html;

      // Acá es donde empieza la acción de apartar
      const btnBuscar = document.getElementById("btnBuscar");
      btnBuscar.addEventListener("click", () => {
        const texto = document.getElementById("busqueda").value.toLowerCase();
        // Podríamos filtrar la lista en el frontend o hacer otra petición
        // Por simplicidad, hagamos un simple filtrado en el frontend:
        const eventosFiltrados = data.filter((evt) =>
          evt.nombre.toLowerCase().includes(texto)
        );
        // Se actualiza la lista
        const eventosListDiv = document.getElementById("eventos-list");
        let newHtml = "";
        eventosFiltrados.forEach((evento) => {
          newHtml += `
            <div>
              <h3>${evento.nombre}</h3>
              <p>Fecha: ${evento.fecha} | Hora: ${evento.hora} | Lugar: ${evento.lugar}</p>
              <button onclick="renderReservaAsientos(${evento.id})">Reservar Asientos</button>
            </div>
            <hr>
          `;
        });
        eventosListDiv.innerHTML = newHtml;
      });
    })
    .catch((err) => console.error(err));
}

// Función para renderizar la selección de asientos
function renderReservaAsientos(eventoId) {
  // Petición a la API para obtener información de asientos disponibles
  fetch(`http://127.0.0.1:8000/api/eventos/${eventoId}/asientos/`)
    .then((response) => response.json())
    .then((data) => {
      let html = `<h2>Reservar Asientos para Evento #${eventoId}</h2>`;
      html += `<div id="asientos-container" style="display: flex; flex-wrap: wrap; width: 200px;">`;

      data.asientosDisponibles.forEach((asiento) => {
        html += `
          <div
            style="border: 1px solid #000; width: 40px; height: 40px; margin: 5px; text-align: center; line-height: 40px; cursor: pointer;"
            onclick="seleccionarAsiento('${asiento}')"
          >
            ${asiento}
          </div>
        `;
      });
      html += `</div>`;

      html += `
        <div>
          <h3>Asientos Seleccionados:</h3>
          <p id="asientos-seleccionados"></p>
          <button onclick="confirmarReserva(${eventoId})">Confirmar Reserva</button>
        </div>
      `;

      app.innerHTML = html;
    })
    .catch((err) => console.error(err));
}

// Se almacenan los asientos seleccionados
let asientosSeleccionados = [];

// Función para seleccionar un asiento
function seleccionarAsiento(asiento) {
  if (!asientosSeleccionados.includes(asiento)) {
    asientosSeleccionados.push(asiento);
  } else {
    // Si ya está seleccionado, se quita
    asientosSeleccionados = asientosSeleccionados.filter((a) => a !== asiento);
  }

  document.getElementById("asientos-seleccionados").textContent =
    asientosSeleccionados.join(", ");
}

// Función para confirmar la reserva
function confirmarReserva(eventoId) {
  if (asientosSeleccionados.length === 0) {
    alert("No has seleccionado ningún asiento.");
    return;
  }

  fetch(`http://127.0.0.1:8000/api/reservar/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventoId, asientos: asientosSeleccionados }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(
          "Reserva confirmada. Revisa tu correo electrónico (si implementamos el envío de email)."
        );
        // Limpiar seleccion
        asientosSeleccionados = [];
        renderEventosList();
      } else {
        alert("Hubo un problema al reservar: " + data.error);
      }
    })
    .catch((err) => console.error(err));
}

// Función para cerrar sesión
function logoutUser() {
  isLoggedIn = false;
  linkLogout.style.display = "none";
  alert("Sesión cerrada");
  renderLoginForm();
}

// Al cargar la página por primera vez, se mostrará el formulario de login
document.addEventListener("DOMContentLoaded", () => {
  renderLoginForm();
});
