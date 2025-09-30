document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario")); 
  const sidebarContainer = document.getElementById("sidebar");

  if (!usuario) {
    window.location.href = "login.html"; 
    return;
  }

  // Sidebar dinámico
  let sidebarHTML = `
    <div class="sidebar" id="sidebarContent">
      <div class="sidebar-header" id="toggleSidebarBtn">
        <ion-icon name="menu-outline" class="cloud"></ion-icon>
        <span class="title">Arqos</span>
      </div>
      <ul class="menu">
        <li><ion-icon name="home-outline"></ion-icon><span class="text"><a href="menu_casa.html">Menu</a></span></li>
  `;

  if (usuario.rol === "Usuario") {
    sidebarHTML += `
      <li><ion-icon name="star-outline"></ion-icon><span class="text"><a href="Favoritos.html">Favoritos</a></span></li>
      <li><ion-icon name="map-outline"></ion-icon><span class="text"><a href="VerVisitas.html">Ver Visita</a></span></li>
      <li><ion-icon name="notifications-outline"></ion-icon><span class="text"><a href="Notificaciones.html">Notificaciones</a></span></li>
      <li><ion-icon name="archive-outline"></ion-icon><span class="text"><a href="Historial.html">Historial</a></span></li>
    `;
  } else if (usuario.rol === "Vendedor") {
    sidebarHTML += `
      <li><ion-icon name="add-circle-outline"></ion-icon><span class="text"><a href="Publicar.html">Publicar Casa</a></span></li>
      <li><ion-icon name="map-outline"></ion-icon><span class="text"><a href="VerVisitas.html">Organizar Visitas</a></span></li>
      <li><ion-icon name="notifications-outline"></ion-icon><span class="text"><a href="Notificaciones.html">Notificaciones</a></span></li>
      <li><ion-icon name="archive-outline"></ion-icon><span class="text"><a href="Historial.html">Historial</a></span></li>
    `;
  }

  sidebarHTML += `
      <li><ion-icon name="person-circle-outline"></ion-icon><span class="text"><a href="perfil.html">Perfil</a></span></li>
    </ul>
  </div>
  `;

  sidebarContainer.innerHTML = sidebarHTML;

  const sidebar = document.getElementById("sidebarContent");
  const toggleBtnDesktop = document.getElementById("toggleSidebarBtn");
  const toggleBtnMobile = document.getElementById("toggleButton");

  // Toggle desktop (>1024px)
  toggleBtnDesktop.addEventListener("click", () => {
    if (window.innerWidth > 1024) {
      sidebar.classList.toggle("closed");
    }
  });

  // Toggle tablet/móvil (<=1024px)
  toggleBtnMobile.addEventListener("click", () => {
    if (window.innerWidth <= 1024) {
      sidebar.classList.add("open");
      toggleBtnMobile.style.display = "none"; // ocultar botón flotante
    }
  });

  // Cerrar sidebar al hacer click fuera en tablet/móvil
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024 && sidebar.classList.contains("open")) {
      const clickDentro = sidebar.contains(e.target) || toggleBtnMobile.contains(e.target);
      if (!clickDentro) {
        sidebar.classList.remove("open");
        toggleBtnMobile.style.display = "block"; // volver a mostrar botón
      }
    }
  });
});
