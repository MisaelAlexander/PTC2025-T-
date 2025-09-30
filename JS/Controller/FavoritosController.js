import { renderUser, auth,role } from "../Controller/SessionController.js";
import { obtenerFavoritos, eliminarFavorito, obtenerFotoInmueble } from "../Service/FavoritosService.js";
import { guardarHistorial } from "../Service/HistorialService.js";

document.addEventListener("DOMContentLoaded", async () => {
    const main = document.querySelector(".content-scroll");
    const pagContainer = document.getElementById("paginacion");
    const notificacion = document.getElementById("notificacion");
    const notificacionMensaje = document.getElementById("notificacionMensaje");
    const selectSize = document.getElementById("selectSize");

    // ======= RENDERIZAR USUARIO Y BOTTOM MENU =======
    await renderUser();

    if (!auth.ok || !role.isUsuario) 
        {
    window.location.href = "index.html";
        return;
    }

    const usuario = auth.user; // usamos la info cargada desde /me

    let currentPage = 0;
    let pageSize = parseInt(selectSize.value);
    let totalPages = 0;

    selectSize.addEventListener("change", () => {
        pageSize = parseInt(selectSize.value);
        cargarFavoritos(0);
    });

    function mostrarNotificacion(mensaje, tipo = "error") {
        notificacionMensaje.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = "block";

        setTimeout(() => {
            notificacion.style.display = "none";
        }, 4000);
    }

    async function guardarVistaEnHistorial(casa) {
        if (!usuario) return;
        try {
            const fechaManana = new Date();
            fechaManana.setDate(fechaManana.getDate() + 1);

            await guardarHistorial({
                descripcion: `Has visto la casa "${casa.titulo}"`,
                fecha: fechaManana.toISOString(),
                idUsuario: usuario.id
            });
        } catch (error) {
            console.error("Error al guardar en historial:", error);
        }
    }

    async function guardarEliminacion(casa) {
        if (!usuario) return;
        try {
            const fechaManana = new Date();
            fechaManana.setDate(fechaManana.getDate() + 1);

            await guardarHistorial({
                descripcion: `Has eliminado de favoritos la casa "${casa.titulo}"`,
                fecha: fechaManana.toISOString(),
                idUsuario: usuario.id
            });
        } catch (error) {
            console.error("Error al guardar en historial:", error);
        }
    }

    async function cargarFavoritos(page = 0) {
        main.innerHTML = "";
        try {
            const response = await obtenerFavoritos(usuario.id, page, pageSize);
            const favoritos = response.content;
            totalPages = response.totalPages;
            currentPage = response.pageNumber;

            if (!favoritos || favoritos.length === 0) {
                main.innerHTML = `
                    <div class="empty-state">
                        <h3>Aún no tienes favoritos</h3>
                        <p>Cuando marques propiedades como favoritas, aparecerán aquí.</p>
                    </div>
                `;
                pagContainer.innerHTML = "";
                return;
            }

            for (let fav of favoritos) {
                const idInmueble = fav.idInmueble;
                const foto = await obtenerFotoInmueble(idInmueble);

                const card = document.createElement("section");
                card.classList.add("card", "carta");
                card.innerHTML = `
                    <img src="${foto}" alt="${fav.titulo}" />
                    <div class="info">
                        <div class="star-favorite">
                            <input type="checkbox" id="fav${idInmueble}" checked />
                            <label for="fav${idInmueble}">&#9733;</label>
                        </div>
                        <h3>${fav.titulo}</h3>
                        <p>Ubicación: ${fav.ubicacion}</p>
                        <p>Precio: $${fav.precio.toLocaleString()}</p>
                        <p>${fav.habitaciones} habitaciones, ${fav.banios} baños</p>
                    </div>
                `;
                main.appendChild(card);

                card.addEventListener("click", () => {
                    guardarVistaEnHistorial(fav);
                    window.location.href = `VistaCasa.html?id=${fav.idInmueble}`;
                });

                const checkbox = card.querySelector(`#fav${idInmueble}`);
                checkbox.dataset.idFavorito = fav.idFavorito;
                checkbox.addEventListener("click", e => e.stopPropagation());
                card.querySelector(`label[for="fav${idInmueble}"]`).addEventListener("click", e => e.stopPropagation());

                checkbox.addEventListener("change", async (e) => {
                    const eliminado = await eliminarFavorito(checkbox.dataset.idFavorito);
                    if (eliminado) {
                        mostrarNotificacion("Favorito eliminado correctamente", "exito");
                        guardarEliminacion(fav);
                    } else {
                        mostrarNotificacion("Error al eliminar el favorito", "error");
                        e.target.checked = true;
                    }
                    cargarFavoritos(currentPage);
                });
            }

            actualizarPaginacion();
        } catch (err) {
            console.error(err);
            mostrarNotificacion("Error al cargar favoritos, intenta nuevamente", "error");
        }
    }

    function actualizarPaginacion() {
        pagContainer.innerHTML = "";
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
        btnPrev.addEventListener("click", () => { if (currentPage > 0) cargarFavoritos(currentPage - 1); });
        pagContainer.appendChild(btnPrev);

        for (let i = start; i <= end; i++) {
            const btn = document.createElement("button");
            btn.textContent = i + 1;
            if (i === currentPage) btn.classList.add("activo");
            btn.addEventListener("click", () => cargarFavoritos(i));
            pagContainer.appendChild(btn);
        }

        const btnNext = document.createElement("button");
        btnNext.textContent = "Siguiente";
        btnNext.disabled = currentPage === totalPages - 1;
        btnNext.addEventListener("click", () => { if (currentPage < totalPages - 1) cargarFavoritos(currentPage + 1); });
        pagContainer.appendChild(btnNext);
    }

    // Cargar favoritos inicial
    cargarFavoritos();
});
