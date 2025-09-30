import { enviarPin, buscarPorUsuario, buscarPorCorreo } from "../Service/RecuperarContraseniaService.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const notificacion = document.getElementById("notificacion");
    const notificacionMensaje = document.getElementById("notificacionMensaje");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const valor = emailInput.value.trim();
        if (!valor) return mostrarNotificacion("El campo no puede estar vacío", "error");

        try {
            // Verificar si existe usuario o correo 
            let usuarioDTO;
            let correoParaEnvio;
            //Si lelva @ es un correo, si no es un usuario
            //Si ven usamos una varaible de correo apra envio, por que 
            //simple si busca por usuario no es correo y pues para estandizar usamos a correo envio para llevarse el correoe n los dos casos
            if (valor.includes("@")) {
                usuarioDTO = await buscarPorCorreo(valor);
                if (usuarioDTO.status) {
             correoParaEnvio = usuarioDTO.data.correo; // tomar el correo directamente
                }
            } 
            //Si no bscamos por uusario
            else {
                usuarioDTO = await buscarPorUsuario(valor);
                //para evitar problemas si da exito con nombre le decimos que agarre y busque al correo
                if (usuarioDTO.status) {
                correoParaEnvio = usuarioDTO.data.correo; // tomar el correo del DTO
            }
            }

            if (usuarioDTO.status) {
                // Enviar PIN para recuperación
                const respuesta = await enviarPin(correoParaEnvio);
                if (respuesta.status) {
                    mostrarNotificacion("Se ha enviado el PIN de recuperación a tu correo", "exito");
                    form.reset();

                    // Guardar el correo en sessionStorage
                  sessionStorage.setItem("correoRecuperacion", usuarioDTO.data.correo);

                   // Guardar el usuario en sessionStorage
                  sessionStorage.setItem("usuarioRecuperacion", usuarioDTO.data.usuario);
                  mostrarNotificacion("Pin enviado al correo", "exito");
                    setTimeout(() => {
                window.location.href = "RecuperarContraseña2.html";
            }, 1500);
                } else {
                    mostrarNotificacion(respuesta.mensaje, "error");
                }
            } else {
                mostrarNotificacion("Usuario no encontrado", "error");
            }

        } catch (error) {
            mostrarNotificacion(error.message || "Error de conexión con el servidor", "error");
            console.error(error);
        }
    });

    function mostrarNotificacion(mensaje, tipo = "exito") {
        clearTimeout(notificacion.timeout);
        notificacionMensaje.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = "block";

        notificacion.timeout = setTimeout(() => {
            notificacion.style.display = "none";
        }, 3000);
    }
});
