document.addEventListener("DOMContentLoaded", () => {
  // Recuperar usuario guardado en localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "login.html"; // redirigir si no hay usuario
    return;
  }

  const sidebar = document.getElementById("sidebar");

  // Botones comunes a todos
  let sidebarHTML = `
    <div class="sidebar-header" onclick="toggleSidebar()">
      <ion-icon name="menu-outline" class="cloud"></ion-icon>
      <span class="title">Arqos</span>
    </div>
    <ul class="menu">
      <li><ion-icon name="home-outline"></ion-icon><span class="text"><a href="menu_casa.html">Menu</a></span></li>
      <li><ion-icon name="time-outline"></ion-icon><span class="text"><a href="Vistacasa.html">Visitas</a></span></li>
      <li><ion-icon name="archive-outline"></ion-icon><span class="text"><a href="Historial.html">Historial</a></span></li>
      <li><ion-icon name="person-circle-outline"></ion-icon><span class="text"><a href="perfil.html">Perfil</a></span></li>
      <li><ion-icon name="notifications-outline"></ion-icon><span class="text"><a href="Notificaciones.html">Notificaciones</a></span></li>
    </ul>
  `;

  // Botones según rol
  if (usuario.rol === "Vendedor") {
    sidebarHTML += `
      <button class="create-btn"><a href="Publicar.html" style="text-decoration:none;color:white;">+ Publicar Casa</a></button>
    `;
  } else if (usuario.rol === "Usuario") {
    sidebarHTML += `
      <ul class="menu">
        <li><ion-icon name="star-outline"></ion-icon><span class="text"><a href="Favoritos.html">Favoritos</a></span></li>
        <li><ion-icon name="map-outline"></ion-icon><span class="text"><a href="Propiedades.html">Buscar Propiedades</a></span></li>
      </ul>
    `;
  }

  // Insertamos todo en el sidebar
  sidebar.innerHTML = sidebarHTML;
});
