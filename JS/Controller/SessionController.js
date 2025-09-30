// Controller/SessionController.js
import { me, logout as logoutService } from "../Service/AuthService.js";

// Estado global de sesión
export const auth = {
  ok: false,
  user: null,
};

// -------------------- MENU DINÁMICO --------------------
export function ensureMenuLinks(shouldShow) {

  const sidebar = document.getElementById("sidebar");
  if (shouldShow) {
     // Botones comunes a todos
  let sidebarHTML = `
    <div class="sidebar-header" onclick="toggleSidebar()">
      <ion-icon name="menu-outline" class="cloud"></ion-icon>
      <span class="title">Arqos</span>
    </div>
    <ul class="menu">
      <li><ion-icon name="home-outline"></ion-icon><span class="text"><a href="Index.html">Menu</a></span></li>
      <li><ion-icon name="time-outline"></ion-icon><span class="text"><a href="VerVisitas.html">Visitas</a></span></li>
      <li><ion-icon name="archive-outline"></ion-icon><span class="text"><a href="Historial.html">Historial</a></span></li>
      <li><ion-icon name="person-circle-outline"></ion-icon><span class="text"><a href="perfil.html">Perfil</a></span></li>
      <li><ion-icon name="notifications-outline"></ion-icon><span class="text"><a href="Notificaciones.html">Notificaciones</a></span></li>
    </ul>
  `;

  // Botones según rol
if (auth.user?.rol === "Vendedor") {
  sidebarHTML += `
    <button class="create-btn">
      <a href="Publicar.html" style="text-decoration:none;color:white;">+ Publicar Casa</a>
    </button>
  `;
} else if (auth.user?.rol === "Usuario") {
  sidebarHTML += `
    <ul class="menu">
      <li><ion-icon name="star-outline"></ion-icon><span class="text"><a href="Favoritos.html">Favoritos</a></span></li>
    </ul>
  `;
}


  // Insertamos todo en el sidebar
  sidebar.innerHTML = sidebarHTML;
  } else {
    sidebar.innerHTML = "";
    window.location.replace("index.html");
  }
}

// -------------------- RENDER USER --------------------
export async function renderUser() {
  try {
    const info = await me();
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;

    if (auth.ok && (role.isUsuario() || role.isVendedor())) {
      ensureMenuLinks(true);
    } else {
      auth.ok = false;
      auth.user = null;
      ensureMenuLinks(false);
    }
  } catch {
    auth.ok = false;
    auth.user = null;
    ensureMenuLinks(false);
  }
}

// -------------------- REQUIRE AUTH --------------------
export async function requireAuth({ redirect = true } = {}) {
  try {
    const info = await me();
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;
  } catch {
    auth.ok = false;
    auth.user = null;
  }

  if (!auth.ok && redirect) {
    window.location.replace("index.html");
  }
  return auth.ok;
}

// -------------------- LOGOUT CENTRAL --------------------
export async function cerrarSesion() {
  const ok = await logoutService();
  localStorage.removeItem("usuario");
  if (ok) {
    window.location.href = "index.html";
  } else {  
    alert("Error al cerrar sesión. Intenta de nuevo.");
  }
}

// -------------------- HELPERS --------------------
export function getUserRole() {
  return auth.user?.rol || "";
}

export function getUserID() {
  return auth.user?.idusuario || "";
}

export function getUserIDUBI() {
  return auth.user?.idubicacion || "";
}

export function hasAuthority(authority) {
  return Array.isArray(auth.user?.authorities)
    ? auth.user.authorities.includes(authority)
    : false;
}

export const role = {
  isVendedor: () =>
    getUserRole() === "Vendedor" || hasAuthority("ROLE_Vendedor"),
  isUsuario: () =>
    getUserRole() === "Usuario" || hasAuthority("ROLE_Usuario"),
};

window.addEventListener("pageshow", async () => {
  await renderUser();
});
