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

      if (input.type === "password") {
        input.type = "text";
        svg.setAttribute("fill", "black"); // activo
      } else {
        input.type = "password";
        svg.setAttribute("fill", "gray"); // inactivo
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
