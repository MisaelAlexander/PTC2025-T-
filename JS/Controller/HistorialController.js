import { obtenerHistorial } from "../Service/HistorialService.js";
import { requireAuth, auth, role } from "./SessionController.js";

document.addEventListener("DOMContentLoaded", async () => {
  const ok = await requireAuth();
  if (!ok) {
    window.location.href = "index.html";
    return;
  }
    const usuario = auth.user;
    const historial = document.getElementById("historyList");
    const paginacionDiv = document.getElementById("paginacion");

    const selectSize = document.getElementById("selectSize");

    let currentPage = 0;
    let currentSize = parseInt(selectSize.value);
    let totalPages = 0;




    // Función para mostrar estado vacío
    function mostrarEstadoVacio() {
        historial.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><img src="IMG/Lista.png" alt="Informacion" style="object-fit:contain;"></div>
                <h3>Aún no tienes historial</h3>
                <p>Tu actividad aparecerá aquí cuando comiences a usar la aplicación.</p>
            </div>
        `;
        paginacionDiv.innerHTML = "";
    }

    if (!usuario.id) {
        mostrarEstadoVacio();
        return;
    }

    // Función para cargar historial
    async function cargarHistorial(page = 0, size = currentSize) {
        try {
            const data = await obtenerHistorial(usuario.id, page, size);
            console.log("Historial recibido:", data);

            if (!data || !data.status || !data.data || !data.data.content || !data.data.content.length) {
                mostrarEstadoVacio();
                return;
            }

            // Limpiar lista antes de renderizar
            historial.innerHTML = "";

            // Pintar historial
            data.data.content.forEach(item => {
                const li = document.createElement("li");
                li.classList.add("history-item");
                
                // Formatear fecha si existe
                let fechaFormateada = "Sin fecha";
                if (item.fecha) {
                    const fecha = new Date(item.fecha);
                    /*Esto es par adaptar la fecha a la hora del el salvador
                    ya que la internacional se ve extraña */
                    fechaFormateada = fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }
                
                li.innerHTML = `
                    <div class="text">
                        <strong>${fechaFormateada}</strong>
                        <p>${item.descripcion || "Sin datos"}</p>
                    </div>
                `;
                historial.appendChild(li);
            });

            // Actualizar información de paginación
            totalPages = data.data.totalPages;
            currentPage = data.data.pageNumber;

            // Renderizar paginación
            renderPaginacion();

        } catch (error) {
            console.error("HistorialController error:", error);
            mostrarEstadoVacio();
        }
    }

    // Función para paginación 
    function renderPaginacion() {
        paginacionDiv.innerHTML = "";
        
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

        // Botón anterior
        const btnPrev = document.createElement("button");
        btnPrev.textContent = "Anterior";
        btnPrev.classList.add("pagination-btn");
        btnPrev.disabled = currentPage === 0;
        btnPrev.addEventListener("click", () => {
            if(currentPage > 0) cargarHistorial(currentPage - 1, currentSize);
        });
        paginacionDiv.appendChild(btnPrev);

        // Botones de páginas
        for (let i = start; i <= end; i++) {
            const btn = document.createElement("button");
            btn.textContent = i + 1;
            btn.classList.add("pagination-btn");
            if(i === currentPage) btn.classList.add("activo");
            btn.addEventListener("click", () => {
                currentPage = i;
                cargarHistorial(currentPage, currentSize);
            });
            paginacionDiv.appendChild(btn);
        }

        // Botón siguiente
        const btnNext = document.createElement("button");
        btnNext.textContent = "Siguiente";
        btnNext.classList.add("pagination-btn");
        btnNext.disabled = currentPage === totalPages - 1;
        btnNext.addEventListener("click", () => {
            if(currentPage < totalPages - 1) cargarHistorial(currentPage + 1, currentSize);
        });
        paginacionDiv.appendChild(btnNext);
    }

    // Cambiar tamaño de página
    selectSize.addEventListener("change", () => {
        currentSize = parseInt(selectSize.value);
        currentPage = 0;
        cargarHistorial(currentPage, currentSize);
    });

    // Cargar historial inicial
    cargarHistorial();
});