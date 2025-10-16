// Controller/SessionController.js
import { me, logout as logoutService } from "../Service/AuthService.js";

// Estado global de sesión
export const auth = {
  ok: false,
  user: null,
};

// -------------------- SIDEBAR MANAGER --------------------
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleButton = document.getElementById('toggleButton');
        this.overlay = this.createOverlay();
        this.isMobile = window.innerWidth <= 768;
        this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleResize();
        this.applyCollapsedState();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    bindEvents() {
        // Toggle button
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        // Overlay click
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });

        // Cerrar sidebar al hacer clic en un link (en móvil)
        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && this.isMobile) {
                    this.closeSidebar();
                }
            });
        }
    }

    toggleSidebar() {
        if (this.isMobile) {
            // En móvil: abrir/cerrar completo
            if (this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        } else {
            // En desktop: colapsar/expandir
            this.toggleCollapse();
        }
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
        
        if (this.isCollapsed) {
            this.sidebar.classList.add('collapsed');
        } else {
            this.sidebar.classList.remove('collapsed');
        }
        
        // Actualizar el estado del botón si existe
        if (this.toggleButton) {
            if (this.isCollapsed) {
                this.toggleButton.classList.add('collapsed');
            } else {
                this.toggleButton.classList.remove('collapsed');
            }
        }
    }

    applyCollapsedState() {
        if (this.isCollapsed && !this.isMobile) {
            this.sidebar.classList.add('collapsed');
            if (this.toggleButton) {
                this.toggleButton.classList.add('collapsed');
            }
        }
    }

    openSidebar() {
        this.sidebar.classList.add('open');
        this.overlay.classList.add('active');
        this.toggleButton?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('active');
        this.toggleButton?.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            if (!this.isMobile) {
                // Al cambiar a desktop, cerrar overlay y aplicar estado colapsado
                this.closeSidebar();
                this.applyCollapsedState();
            } else {
                // Al cambiar a móvil, quitar estado colapsado
                this.sidebar.classList.remove('collapsed');
                if (this.toggleButton) {
                    this.toggleButton.classList.remove('collapsed');
                }
            }
        }
    }

    // Para el toggle desde HTML (compatibilidad con tu código existente)
    static toggleSidebar() {
        const manager = window.sidebarManager;
        if (manager) {
            manager.toggleSidebar();
        }
    }
}

// -------------------- MENU DINÁMICO --------------------
export function ensureMenuLinks(shouldShow) {
  const sidebar = document.getElementById("sidebar");
  if (shouldShow) {
     // Botones comunes a todos
  let sidebarHTML = `
    <div class="sidebar-header" onclick="SidebarManager.toggleSidebar()">
      <ion-icon name="menu-outline" class="cloud"></ion-icon>
      <span class="title">Arqos</span>
    </div>
    <ul class="menu">
      <li><a href="menu.html"><ion-icon name="home-outline"></ion-icon><span class="text">Menu</span></a></li>
      <li><a href="VerVisitas.html"><ion-icon name="time-outline"></ion-icon><span class="text">Visitas</span></a></li>
      <li><a href="Historial.html"><ion-icon name="archive-outline"></ion-icon><span class="text">Historial</span></a></li>
      <li><a href="perfil.html"><ion-icon name="person-circle-outline"></ion-icon><span class="text">Perfil</span></a></li>
    </ul>
  `;

  // Botones según rol
  if (auth.user?.rol === "Vendedor") {
    sidebarHTML += `
      <button class="create-btn">
        <a href="Publicar.html"><ion-icon name="add-circle-outline"></ion-icon><span class="text">Publicar Casa</span></a>
      </button>
    `;
  } else if (auth.user?.rol === "Usuario") {
    sidebarHTML += `
      <ul class="menu">
        <li><a href="Favoritos.html"><ion-icon name="star-outline"></ion-icon><span class="text">Favoritos</span></a></li>
      </ul>
    `;
  }

  // Insertamos todo en el sidebar
  sidebar.innerHTML = sidebarHTML;

  // Inicializar el SidebarManager después de cargar el contenido
  setTimeout(() => {
    if (!window.sidebarManager) {
      window.sidebarManager = new SidebarManager();
      window.toggleSidebar = SidebarManager.toggleSidebar;
    }
  }, 100);

  } else {
    if (sidebar) sidebar.innerHTML = "";
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

// -------------------- EVENT LISTENERS --------------------
window.addEventListener("pageshow", async () => {
  await renderUser();
});

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // El SidebarManager se inicializará después de ensureMenuLinks
});

// También inicializar cuando se cargue dinámicamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // El SidebarManager se inicializará después de ensureMenuLinks
  });
}

// -------------------- REDIRECCIÓN SI YA ESTÁ AUTENTICADO --------------------
export async function estaadentro() {
  try {
    const info = await me();
    const ok = !!info?.authenticated;
    const user = info?.user ?? null;

    if (ok && user) {
      // Si hay sesión activa, lo devolvemos al menu asi evitamos problema
      window.location.replace("menu.html");
    }
    // Si no hay sesión, se queda en la página actual (normalmente index.html)
  } catch {
    // Si hay error en la verificación, también se queda en la página actual
  }
}

// Hacer SidebarManager disponible globalmente
window.SidebarManager = SidebarManager;