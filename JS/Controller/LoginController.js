import {  eliminarDescripcionService } from "../Service/LoginService.js";
import { guardarHistorial } from "../Service/HistorialService.js";
import { login, me  } from "../Service/AuthService.js";
import {estaadentro} from "../Controller/SessionController.js";

document.addEventListener("DOMContentLoaded", () => {
    // Si ya hay cookie activa, te manda al menú
    estaadentro();

    // Control del ojo de contraseña (SVG) - CORREGIDO
    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {
            const inputId = icon.getAttribute("data-target");
            const input = document.getElementById(inputId);
            const svg = icon.querySelector("svg");

            if (!input) {
                console.error("No se encontró el input con id:", inputId);
                return;
            }

            if (input.type === "password") {
                input.type = "text";
                svg.setAttribute("fill", "#1E3A8A"); // activo - color primario
            } else {
                input.type = "password";
                svg.setAttribute("fill", "gray"); // inactivo
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