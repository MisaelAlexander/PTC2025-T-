// Controller/ComentariosUsuarioController.js
import {
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  obtenerComentariosPorVendedor,
  obtenerIdUsuarioInmueble
} from "../Service/ComentarioUsuarioService.js";

import { requireAuth, auth, role } from "./SessionController.js";

// =================== ELEMENTOS ===================
const form = document.querySelector(".comment-form");
const comentarioInput = document.getElementById("comment");
const comentariosContainer = document.getElementById("comentariosContainer");
const selectSize = document.getElementById("selectSize");
const pagContainer = document.getElementById("paginacion");

const notificacion = document.getElementById("notificacion");
const notificacionMensaje = document.getElementById("notificacionMensaje");

const confirmEliminar = document.getElementById("confirmEliminar");
const btnCancelar = document.getElementById("btnCancelar");
const btnConfirmar = document.getElementById("btnConfirmar");

let eliminarId = null;
let editarId = null;
let currentPage = 0;
let currentSize = parseInt(selectSize.value);
let totalPages = 0;
let idVendedor = null;

// ======= UTILS =======
function mostrarNotificacion(msg, tipo = "exito") {
  notificacionMensaje.textContent = msg;
  notificacion.className = `notificacion ${tipo}`;
  notificacion.style.display = "block";
  setTimeout(() => (notificacion.style.display = "none"), 2500);
}
function mostrarError(msg) { mostrarNotificacion(msg, "error"); }
function mostrarExito(msg) { mostrarNotificacion(msg, "exito"); }

function renderStars(p) {
  return Array.from({ length: 5 }, (_, i) => i < p ? "★" : "☆").join("");
}

function obtenerFechaManana() {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const yyyy = manana.getFullYear();
  const mm = String(manana.getMonth() + 1).padStart(2, "0");
  const dd = String(manana.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ======= CARGAR COMENTARIOS DEL VENDEDOR =======
async function cargarComentarios(page = 0, size = currentSize) {
  if (!auth.ok) return; // ✅ solo carga si el usuario está autenticado

  const idUsuarioActual = auth.user.id;

  try {
    const params = new URLSearchParams(window.location.search);
    idVendedor = params.get("id") || idVendedor;

    if (!idVendedor) {
      console.warn("No se encontró id del vendedor en la URL.");
      return;
    }

    const data = await obtenerComentariosPorVendedor(idVendedor, page, size);

    comentariosContainer.innerHTML = "";
    if (!data.data?.content || data.data.content.length === 0) {
      comentariosContainer.innerHTML = "<p>No hay comentarios aún.</p>";
      pagContainer.innerHTML = "";
      return;
    }

    totalPages = data.data.totalPages;
    currentPage = data.data.pageNumber;

    data.data.content.forEach((c) => {
      let buttonsHTML = "";
      if (c.idCliente === idUsuarioActual) {
        buttonsHTML = `
          <button class="editar-btn" data-id="${c.idComentario}" data-comentario="${c.comentario}" data-puntuacion="${c.puntuacion}">Editar</button>
          <button class="borrar-btn" data-id="${c.idComentario}">Borrar</button>
        `;
      }

      comentariosContainer.insertAdjacentHTML(
        "beforeend",
        `
        <article class="comment-card">
          <div class="comment-head">
            <span class="rating">${renderStars(c.puntuacion)}</span>
            <span class="name">${c.nombre}</span>
            <time datetime="${c.fecha}">${new Date(c.fecha).toLocaleDateString("es-ES",{ day: "numeric", month: "long", year: "numeric" })}</time>
          </div>
          <p class="comment-body">${c.comentario}</p>
          <div class="comment-actions">${buttonsHTML}</div>
        </article>
      `
      );
    });

    document.querySelectorAll(".borrar-btn").forEach((btn) =>
      btn.addEventListener("click", () => abrirConfirmEliminar(btn.dataset.id))
    );
    document.querySelectorAll(".editar-btn").forEach((btn) =>
      btn.addEventListener("click", () =>
        manejarEditar(btn.dataset.id, btn.dataset.comentario, btn.dataset.puntuacion)
      )
    );

    actualizarPaginacion();
  } catch (e) {
    console.error(e);
    comentariosContainer.innerHTML = "<p>No se pudieron cargar los comentarios.</p>";
    pagContainer.innerHTML = "";
  }
}

// ======= FORMULARIO PARA COMENTARIOS =======
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!auth.ok) return mostrarError("Debes iniciar sesión para comentar.");
    if (!auth.user?.id || !idVendedor) return mostrarError("No se encontró usuario o vendedor.");

    const idUsuarioActual = auth.user.id;
    const comentario = comentarioInput.value.trim();
    const puntuacion = parseInt(document.querySelector(".star-rating input:checked")?.value || 0);
    const fecha = obtenerFechaManana();

    if (!comentario || puntuacion === 0) {
      mostrarError("Debes escribir un comentario y seleccionar estrellas.");
      return;
    }

    const data = {
      comentario,
      puntuacion,
      fecha,
      idCliente: idUsuarioActual,
      idVendedor: idVendedor
    };

    try {
      if (editarId) {
        await actualizarComentario(editarId, data);
        mostrarExito("Comentario actualizado.");
        editarId = null;
      } else {
        await crearComentario(data);
        mostrarExito("Comentario enviado con éxito.");
      }
      form.reset();
      cargarComentarios(currentPage, currentSize);
    } catch (e) {
      mostrarError("No se pudo enviar el comentario.");
      console.error(e);
    }
  });
}

// ======= PAGINACION =======
selectSize.addEventListener("change", () => {
  currentSize = parseInt(selectSize.value);
  cargarComentarios(0, currentSize);
});

function actualizarPaginacion() {
  pagContainer.innerHTML = "";
  const maxButtons = 5;
  let start = Math.max(0, currentPage - 2);
  let end = Math.min(totalPages - 1, currentPage + 2);
  if (currentPage <= 2) {
    start = 0;
    end = Math.min(totalPages - 1, maxButtons - 1);
  }
  if (currentPage + 2 >= totalPages) {
    start = Math.max(0, totalPages - maxButtons);
    end = totalPages - 1;
  }

  const btnPrev = document.createElement("button");
  btnPrev.textContent = "Anterior";
  btnPrev.disabled = currentPage === 0;
  btnPrev.addEventListener("click", () => {
    if (currentPage > 0) cargarComentarios(currentPage - 1, currentSize);
  });
  pagContainer.appendChild(btnPrev);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    if (i === currentPage) btn.classList.add("activo");
    btn.addEventListener("click", () => cargarComentarios(i, currentSize));
    pagContainer.appendChild(btn);
  }

  const btnNext = document.createElement("button");
  btnNext.textContent = "Siguiente";
  btnNext.disabled = currentPage === totalPages - 1;
  btnNext.addEventListener("click", () => {
    if (currentPage < totalPages - 1) cargarComentarios(currentPage + 1, currentSize);
  });
  pagContainer.appendChild(btnNext);
}

// ======= EDITAR / ELIMINAR =======
function manejarEditar(id, comentario, puntuacion) {
  comentarioInput.value = comentario;
  document.querySelectorAll(".star-rating input").forEach(
    (i) => (i.checked = i.value == puntuacion)
  );
  editarId = id;
  comentarioInput.focus();
}

function abrirConfirmEliminar(id) {
  eliminarId = id;
  confirmEliminar.style.display = "block";
}
btnCancelar.addEventListener("click", () => {
  confirmEliminar.style.display = "none";
  eliminarId = null;
});
btnConfirmar.addEventListener("click", async () => {
  try {
    if (eliminarId) {
      await eliminarComentario(eliminarId);
      mostrarExito("Comentario eliminado.");
      cargarComentarios(currentPage, currentSize);
    }
  } catch (e) {
    mostrarError("No se pudo eliminar.");
    console.error(e);
  }
  confirmEliminar.style.display = "none";
  eliminarId = null;
});

// ======= INICIAL =======
document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth(); // protege igual que el ejemplo
  cargarComentarios();
});
