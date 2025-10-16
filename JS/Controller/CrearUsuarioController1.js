import { guardarUsuario, checkUsuario } from "../Service/CrearUsuarioService1.js";
import { guardarHistorial } from "../Service/HistorialService.js";

/* Validar que no se repitan */
async function validarCampos(usuario) {
  const [UsuarioExiste] = await Promise.all([
    checkUsuario(usuario)
  ]);
  if (UsuarioExiste) throw new Error("Ese nombre ya está en uso, prueba con otro");
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("registroForm");

  // Obtener el iddescripcion guardado en localStorage
  const iddescripcion = Number(localStorage.getItem("iddescripcion"));
  if (!iddescripcion) {
    mostrarNotificacion("No se encontró información de descripción. Vuelve a la página anterior.", "error");
    form.querySelector("button").disabled = true;
    return;
  }

  //  Control del ojo de contraseña (SVG)
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

  // --- Envío del formulario ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const contrasenia = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // Validaciones usuario
    if (!usuario) return mostrarNotificacion("El usuario no puede ser nulo", "error");
    if (usuario.length < 4 || usuario.length > 50) return mostrarNotificacion("El usuario debe tener entre 4 y 50 caracteres", "error");

    // Validaciones contraseña
    if (!contrasenia) return mostrarNotificacion("La contraseña es obligatoria", "error");
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(contrasenia)) return mostrarNotificacion("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial", "error");
    if (contrasenia !== confirmar) return mostrarNotificacion("Las contraseñas no coinciden", "error");

    // Fecha actual  día
    let hoy = new Date();
    hoy.setDate(hoy.getDate() +1);
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechadecreacion = `${yyyy}-${mm}-${dd}`;

    // Crear objeto
    const usuarioData = {
      usuario,
      contrasenia,
      estado: true,
      fechadecreacion,
      iddescripcion
    };

    try {
      await validarCampos(usuario);

      const usuarioCreado = await guardarUsuario(usuarioData);

      if (usuarioCreado && usuarioCreado.data) {
        const historialData = {
          descripcion: `Usuario creado: ${usuario}`,
          fecha: hoy,
          idUsuario: usuarioCreado.data.idusuario
        };
        await guardarHistorial(historialData);
        console.log("Historial de creación guardado exitosamente");
      }

      mostrarNotificacion("Usuario registrado con éxito.", "exito");
      form.reset();
      localStorage.removeItem("iddescripcion");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);
    } catch (error) {
      mostrarNotificacion(error.message || "Error al registrar usuario", "error");
      console.error(error);
    }
  });

  function mostrarNotificacion(mensaje, tipo = "exito") {
    const notificacion = document.getElementById("notificacion");
    const notificacionMensaje = document.getElementById("notificacionMensaje");

    notificacionMensaje.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;
    notificacion.style.display = "block";

    setTimeout(() => {
      notificacion.style.display = "none";
    }, 2000);
  }
});
