import { restablecerContrasena } from "../Service/CambiarContraseniaService.js";
import { guardarHistorial } from "../Service/HistorialService.js"; // Importar el servicio de historial

// Capturamos elementos del DOM
const form = document.getElementById("registroForm");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const confirmarInput = document.getElementById("confirmar");

// Notificación
const notificacion = document.getElementById("notificacion");
const notificacionMensaje = document.getElementById("notificacionMensaje");

// Cargar el usuario desde sessionStorage y hacerlo solo lectura
const usuario = sessionStorage.getItem("usuarioRecuperacion");
if (usuario) {
    usuarioInput.value = usuario;
    usuarioInput.readOnly = true;
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje, tipo = "exito") {
    notificacionMensaje.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;
    notificacion.style.display = "block";

    setTimeout(() => {
        notificacion.style.display = "none";
    }, 2000);
}

// Función para el ojo de contraseña
function inicializarTogglePassword() {
   // Control del ojo de contraseña (SVG) - CORREGIDO Y MEJORADO
document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
        const inputId = icon.getAttribute("data-target");
        const input = document.getElementById(inputId);
        const svg = icon.querySelector("svg");
        const path = svg.querySelector("path");

        if (!input) {
            console.error("No se encontró el input con id:", inputId);
            return;
        }

        if (input.type === "password") {
            input.type = "text";
            svg.setAttribute("fill", "#1E3A8A"); // activo - color primario
            
            // Opcional: Cambiar el icono a "ojo tachado" para indicar que está visible
            path.setAttribute("d", "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-3.89-6-7-11-7-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 3.89 6 7 11 7 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z");
        } else {
            input.type = "password";
            svg.setAttribute("fill", "gray"); // inactivo
            
            // Restaurar el icono original
            path.setAttribute("d", "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 10Z");
        }
    });
});
}

// Función para guardar en el historial
async function guardarCambioContraseniaHistorial(usuario) {
    try {
        const fechaManana = new Date();
        fechaManana.setDate(fechaManana.getDate() + 1);
        const datosHistorial = {
            descripcion: `Has cambiado la contraseña`,
            fecha: fechaManana.toISOString(),
            idUsuario: usuario.idusuario // ← Esto existe según tu JSON (idusuario: 162)
        };
        
        await guardarHistorial(datosHistorial);
        console.log("Historial de cambio de contraseña guardado exitosamente");
    } catch (error) {
        console.error("Error al guardar en historial:", error);
    }
}

// Manejar Submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirmar = confirmarInput.value.trim();

    if (!password || !confirmar) {
        mostrarNotificacion("Debes llenar todos los campos", "error");
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        mostrarNotificacion(
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial", 
            "error"
        );
        return;
    }

    if (password !== confirmar) {
        mostrarNotificacion("Las contraseñas no coinciden", "error");
        return;
    }

    const resultado = await restablecerContrasena(usuarioInput.value, password);

    if (resultado.status) {
        mostrarNotificacion("Contraseña cambiada correctamente", "exito");
        
        // Guardar en el historial - usuario viene en resultado.usuario
        if (resultado.usuario && resultado.usuario.idusuario) {
            await guardarCambioContraseniaHistorial(resultado.usuario);
        } else {
            console.warn("No se recibieron datos completos del usuario para el historial");
        }
        
        setTimeout(() => window.location.href = "index.html", 2000);
    } else {
        mostrarNotificacion(resultado.mensaje || "Error al cambiar la contraseña", "error");
    }
});

// Inicializar la funcionalidad del ojo cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    inicializarTogglePassword();
});