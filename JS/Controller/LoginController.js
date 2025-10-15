import {  eliminarDescripcionService } from "../Service/LoginService.js";
import { guardarHistorial } from "../Service/HistorialService.js";
import { login, me  } from "../Service/AuthService.js";
import {estaadentro} from "../Controller/SessionController.js";

document.addEventListener("DOMContentLoaded", () => {
    // Si ya hay cookie activa, te manda al menú
    estaadentro();

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
  
    function mostrarNotificacion(mensaje, tipo = "exito") {
        const notificacion = document.getElementById("notificacion");
        const notificacionMensaje = document.getElementById("notificacionMensaje");

        notificacionMensaje.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = "block";

        // Aplicar la animación de entrada
        setTimeout(() => {
            notificacion.style.transform = "translateX(0)";
            notificacion.style.opacity = "1";
        }, 10);

        setTimeout(() => {
            // Animación de salida
            notificacion.style.transform = "translateX(400px)";
            notificacion.style.opacity = "0";
            
            setTimeout(() => {
                notificacion.style.display = "none";
            }, 300);
        }, 2000);
    }

    function mostrarModal(mensaje) {
        return new Promise((resolve) => {
            const modal = document.getElementById("modalConfirm");
            const modalMensaje = document.getElementById("modalMensaje");
            const btnSi = document.getElementById("modalSi");
            const btnNo = document.getElementById("modalNo");

            modalMensaje.textContent = mensaje;
            modal.style.display = "flex";

            const limpiar = () => {
                btnSi.removeEventListener("click", onSi);
                btnNo.removeEventListener("click", onNo);
                modal.style.display = "none";
            };

            const onSi = () => { limpiar(); resolve(true); };
            const onNo = () => { limpiar(); resolve(false); };

            btnSi.addEventListener("click", onSi);
            btnNo.addEventListener("click", onNo);
        });
    }

    async function guardarInicioSesionHistorial(userData) {
        try {
            const ahora = new Date();
            const fechaHora = ahora.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const fechaManana = new Date();
            fechaManana.setDate(fechaManana.getDate() + 1);

            const datosHistorial = {
                descripcion: `Inicio de sesión - ${fechaHora}`,
                fecha: fechaManana.toISOString(),
                idUsuario: userData.user.id
            };

            await guardarHistorial(datosHistorial);
            console.log("Historial guardado");
        } catch (error) {
            console.error("Error al guardar historial:", error);
        }
    }

    const form = document.querySelector("form");
    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("password");
    const registerDiv = document.getElementById("register");

    // Login
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usuario = usuarioInput.value.trim();
        const contrasena = contrasenaInput.value.trim();

        if (!usuario || !contrasena) {
            mostrarNotificacion("Por favor ingrese usuario y contraseña.", "error");
            return;
        }

        try {
            // 1. Hacer login con AuthService
            const loginResult = await login(usuario, contrasena);

            if (!loginResult) {
                mostrarNotificacion(loginResult?.message || "Error en login", "error");
                return;
            }

            // 2. Obtener datos del usuario con /me
            const userData = await me();
            console.log("Usuario autenticado:", userData);

            if (!userData.authenticated) {
                mostrarNotificacion("Error de autenticación", "error");
                return;
            }

            if (userData.user.estado !== true) {
                mostrarNotificacion("El usuario no está activo.", "error");
                return;
            }

            // 3. Guardar historial
            await guardarInicioSesionHistorial(userData);

            mostrarNotificacion(`¡Bienvenido ${userData.user.nombre}!`, "exito");

            setTimeout(() => {
                window.location.href = "menu.html";
            }, 1500);

        } catch (error) {
            console.error('Error en login:', error);
            mostrarNotificacion("Usuario o Contraseña incorrectos.", "error");
        }
    });

    // Registro
    if (registerDiv) {
        registerDiv.addEventListener("click", async (e) => {
            e.preventDefault();

            // Eliminado uso de localStorage para autenticación
            const existeId = localStorage.getItem("iddescripcion");

            if (existeId) {
                const continuar = await mostrarModal(
                    "Ya hay un registro de datos personales. ¿Desea continuar con la creación de usuario?"
                );

                if (continuar) {
                    mostrarNotificacion("Datos Cargados", "exito");
                    setTimeout(() => {
                        window.location.href = "CrearUsuario1.html";
                    }, 3000);
                } else {
                    await eliminarDescripcion(existeId, "CrearUsuario.html");
                }
            } else {
                window.location.href = "CrearUsuario.html";
            }
        });
    }

    async function eliminarDescripcion(id, redirectUrl) {
        const confirmar = await mostrarModal("¿Desea eliminar este registro de datos personales?");
        if (!confirmar) return;

        try {
            const result = await eliminarDescripcionService(id);
            localStorage.removeItem("iddescripcion");
            mostrarNotificacion(result.message || "Registro eliminado correctamente", "exito");

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        } catch (error) {
            mostrarNotificacion(error.message || "Error al eliminar el registro", "error");
        }
    }
});