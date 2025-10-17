import { 
  obtenerVisitasPorCliente,
  obtenerVisitasPorVendedor, 
  obtenerVisitasPorTitulo, 
  obtenerVisitasPorTituloV,
  obtenerTiposVisita,
  obtenerVisitasPorEstadoYCliente,
  obtenerVisitasPorEstadoYVendedor,
  actualizarVisita,
  obtenerVisitasPorInmueble
} from "../Service/VisitaService.js";

import { requireAuth, auth, role } from "./SessionController.js";

// ---------- FUNCIONES DE NOTIFICACIÓN ----------
function mostrarNotificacion(mensaje, tipo = "info") {
  const noti = document.getElementById("notificacion");
  const notiMsg = document.getElementById("notificacionMensaje");

  notiMsg.textContent = mensaje;
  noti.className = `notificacion show ${tipo}`;

  setTimeout(() => {
    noti.className = "notificacion"; // ocultar
  }, 3000);
}

// ---------- FUNCIONES DE CONFIRMACIÓN ----------
function confirmarAccion(mensaje) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirm");
    const modalMsg = document.getElementById("modalMensaje");
    const btnSi = document.getElementById("modalSi");
    const btnNo = document.getElementById("modalNo");

    modalMsg.textContent = mensaje;
    modal.style.display = "flex";

    const cerrar = () => {
      modal.style.display = "none";
      btnSi.removeEventListener("click", onSi);
      btnNo.removeEventListener("click", onNo);
    };

    const onSi = () => {
      resolve(true);
      cerrar();
    };

    const onNo = () => {
      resolve(false);
      cerrar();
    };

    btnSi.addEventListener("click", onSi);
    btnNo.addEventListener("click", onNo);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // ------------------ SEGURIDAD ------------------
  const acceso = await requireAuth();
  if (!acceso) return;

  const usuario = auth.user;

  // ------------------ ELEMENTOS ------------------
  const lista = document.querySelector(".request-list");
  const pageSizeSelector = document.getElementById("pageSize");
  const pageNumbersContainer = document.getElementById("page-numbers");
  const searchInput = document.getElementById("searchTitle");
  const tiposContainer = document.getElementById("tipos-visita");

  let currentPage = 0;
  let totalPages = 1;
  let pageSize = parseInt(pageSizeSelector.value, 10);
  let currentSearch = "";
  let currentTipo = null;

  // Revisar si viene id de inmueble en URL
  const urlParams = new URLSearchParams(window.location.search);
  const inmuebleId = urlParams.get("id");


  if (inmuebleId && !role.isVendedor()) {
    lista.innerHTML = "<p style='color:red;'>No tienes permiso para ver estas visitas.</p>";
    return; // bloquear acceso si no es vendedor
  }

  // ==================== CARGAR VISITAS ====================
  async function cargarVisitas(page = 0) {
    try {
      let response;

      // Si viene id de inmueble, cargar solo ese inmueble
      if (inmuebleId) {
        response = await obtenerVisitasPorInmueble(inmuebleId, page, pageSize);
      } else if (currentSearch.trim() !== "") {
        if (role.isVendedor()) {
          response = await obtenerVisitasPorTituloV(currentSearch, usuario.id, page, pageSize);
        } else if (role.isUsuario()) {
          response = await obtenerVisitasPorTitulo(currentSearch, usuario.id, page, pageSize);
        }
      } else if (currentTipo) {
        if (role.isVendedor()) {
          response = await obtenerVisitasPorEstadoYVendedor(currentTipo, usuario.id, page, pageSize);
        } else if (role.isUsuario()) {
          response = await obtenerVisitasPorEstadoYCliente(currentTipo, usuario.id, page, pageSize);
        }
      } else {
        if (role.isVendedor()) {
          response = await obtenerVisitasPorVendedor(usuario.id, page, pageSize);
        } else if (role.isUsuario()) {
          response = await obtenerVisitasPorCliente(usuario.id, page, pageSize);
        }
      }

      const { content = [], totalPages: tp = 1, pageNumber: number = 0 } = response.data;

      totalPages = tp;
      currentPage = number;
      lista.innerHTML = "";
  
      if (content.length === 0) {
        lista.innerHTML = `<p>No se encontraron visitas.</p>`;
        return;
      }

      content.forEach(v => {
        const card = document.createElement("div");
        card.classList.add("request-card");


        // ------------------ ESTADOS ------------------
        if (v.estado === "Aceptado") card.classList.add("estado-aceptado");
        else if (v.estado === "Rechazado") card.classList.add("estado-rechazado");
        else if (v.estado === "En espera") card.classList.add("estado-espera");

        card.innerHTML = `
        <div class="request-info">
  <p class="client-name">${v.inmuebletitulo}</p>
  <p><strong>Precio:</strong> $${v.inmuebleprecio}</p>
  <p><strong>Fecha:</strong> ${v.fecha} - ${v.hora}</p>
  <p><strong>Estado:</strong> ${v.estado}</p>
  <p><strong>Tipo:</strong> ${v.tipovisita}</p>
  ${v.descripcion ? `<p><strong>Nota:</strong> ${v.descripcion}</p>` : ''}
</div>
        `;

        // ------------------ BOTONES SOLO PARA VENDEDOR ------------------
        if (role.isVendedor() && v.idestado === 3) {
          const btnContainer = document.createElement("div");
          btnContainer.classList.add("acciones");

          const btnAceptar = document.createElement("button");
          btnAceptar.textContent = "Aceptar";
          btnAceptar.classList.add("btn-aceptar");
          btnAceptar.addEventListener("click", async () => {
            const confirmar = await confirmarAccion("¿Estás seguro de aceptar esta visita?");
            if (!confirmar) return;

            try {
              await actualizarVisita(v.idvisita, { ...v, idestado: 1 });
              mostrarNotificacion("Visita aceptada correctamente", "exito");
              cargarVisitas(currentPage);
            } catch {
              mostrarNotificacion("Error al aceptar la visita", "error");
            }
          });

          const btnRechazar = document.createElement("button");
          btnRechazar.textContent = "Rechazar";
          btnRechazar.classList.add("btn-rechazar");
          btnRechazar.addEventListener("click", async () => {
            const confirmar = await confirmarAccion("¿Estás seguro de rechazar esta visita?");
            if (!confirmar) return;

            try {
              await actualizarVisita(v.idvisita, { ...v, idestado: 2 });
              mostrarNotificacion("Visita rechazada", "info");
              cargarVisitas(currentPage);
            } catch {
              mostrarNotificacion("Error al rechazar la visita", "error");
            }
          });

          btnContainer.appendChild(btnAceptar);
          btnContainer.appendChild(btnRechazar);
          card.appendChild(btnContainer);
        }

        lista.appendChild(card);
      });

      renderizarNumeros();
    } catch (err) {

      lista.innerHTML = `<p style="color:red;">Error al cargar visitas</p>`;
    }
  }

  // ==================== PAGINACIÓN ====================
  function renderizarNumeros() {
    pageNumbersContainer.innerHTML = "";
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half) {
      start = 0;
      end = Math.min(totalPages - 1, maxButtons - 1);
    }
    if (currentPage + half >= totalPages) {
      start = Math.max(0, totalPages - maxButtons);
      end = totalPages - 1;
    }

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "Anterior";
    btnPrev.disabled = currentPage === 0;
    btnPrev.addEventListener("click", () => {
      if (currentPage > 0) cargarVisitas(currentPage - 1);
    });
    pageNumbersContainer.appendChild(btnPrev);

    for (let i = start; i <= end; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      btn.classList.add("page-btn");
      if (i === currentPage) btn.classList.add("activo");
      btn.addEventListener("click", () => cargarVisitas(i));
      pageNumbersContainer.appendChild(btn);
    }

    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente";
    btnNext.disabled = currentPage === totalPages - 1;
    btnNext.addEventListener("click", () => {
      if (currentPage < totalPages - 1) cargarVisitas(currentPage + 1);
    });
    pageNumbersContainer.appendChild(btnNext);
  }

  // ==================== TIPOS DE VISITA ====================
  async function cargarTipos() {
    try {
      const tipos = await obtenerTiposVisita();
      tiposContainer.innerHTML = "";

      const btnTodos = document.createElement("button");
      btnTodos.textContent = "Todos";
      btnTodos.classList.add("tipo-btn");
      btnTodos.addEventListener("click", () => {
        currentTipo = null;
        currentPage = 0;
        cargarVisitas(0);
      });
      tiposContainer.appendChild(btnTodos);

      tipos.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = t.estado; 
        btn.classList.add("tipo-btn");

        btn.addEventListener("click", () => {
          currentTipo = t.idEstado;
          currentPage = 0;
          cargarVisitas(0);
        });

        tiposContainer.appendChild(btn);
      });
    } catch (err) {
      tiposContainer.innerHTML = "<p>Error al cargar tipos de visita</p>";
    }
  }

  // ==================== EVENTOS ====================
  pageSizeSelector.addEventListener("change", () => {
    pageSize = parseInt(pageSizeSelector.value, 10);
    currentPage = 0;
    cargarVisitas(currentPage);
  });

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value;
    currentPage = 0;
    cargarVisitas(currentPage);
  });

  // ==================== INICIO ====================
  await cargarTipos();
  await cargarVisitas(0);
});
