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
//Manejar Submmit
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
        mostrarNotificacion("Contraseña cambiada con exito", "exito");
        setTimeout(() => window.location.href = "index.html", 2000);
    } else {
        mostrarNotificacion(resultado.mensaje || "Error al cambiar la contraseña", "error");
    }
});