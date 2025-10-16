import { me, logout as logoutService } from "../Service/AuthService.js";

// Estado global de sesión
export const auth = {
  ok: false,
  user: null,
};

// Variable para evitar bucles
let isCheckingAuth = false;

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

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    init() {
        this.bindEvents();
        this.handleResize();
        this.applyCollapsedState();
    }

    bindEvents() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        this.overlay.addEventListener('click', () => this.closeSidebar());

        window.addEventListener('resize', () => this.handleResize());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });

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
            if (this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        } else {
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
                this.closeSidebar();
                this.applyCollapsedState();
            } else {
                this.sidebar.classList.remove('collapsed');
                if (this.toggleButton) {
                    this.toggleButton.classList.remove('collapsed');
                }
            }
        }
    }

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
  if (!sidebar) return;

  if (shouldShow) {

    
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
    `;

    if (auth.user?.rol === "Vendedor") {
      sidebarHTML += `
        </ul>
        <button class="create-btn">
          <a href="Publicar.html"><ion-icon name="add-circle-outline"></ion-icon><span class="text">Publicar Casa</span></a>
        </button>
      `;
    } else if (auth.user?.rol === "Usuario") {
      sidebarHTML += `
        <li><a href="Favoritos.html"><ion-icon name="star-outline"></ion-icon><span class="text">Favoritos</span></a></li>
        </ul>
      `;
    } else {
      sidebarHTML += `</ul>`;
    }

    sidebar.innerHTML = sidebarHTML;

    setTimeout(() => {
      if (!window.sidebarManager) {
        window.sidebarManager = new SidebarManager();
        window.toggleSidebar = SidebarManager.toggleSidebar;
      }
    }, 100);

  } else {

    if (sidebar) sidebar.innerHTML = "";
    
    const currentPage = window.location.pathname;
    const protectedPages = ['menu.html', 'vervisitas.html', 'historial.html', 'perfil.html', 'publicar.html', 'favoritos.html'];
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    if (isProtectedPage) {

      window.location.replace("index.html");
    }
  }
}

// -------------------- RENDER USER --------------------
export async function renderUser() {
  if (isCheckingAuth) {

    return;
  }
  
  isCheckingAuth = true;
  console.log("Iniciando renderUser...");

  try {
    const info = await me();
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;



    const shouldShowMenu = auth.ok && (role.isUsuario() || role.isVendedor());
    ensureMenuLinks(shouldShowMenu);

  } catch (error) {
    console.error("Error en renderUser:", error);
    auth.ok = false;
    auth.user = null;
    
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('index.html') || currentPage === '/';
    
    if (!isLoginPage) {
      ensureMenuLinks(false);
    }
  } finally {
    isCheckingAuth = false;
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
  console.log("Iniciando cierre de sesión...");
  
  // Limpiar estado local inmediatamente
  auth.ok = false;
  auth.user = null;
  
  try {
    const ok = await logoutService();

  } catch (error) {
    console.error("Error en logout service:", error);
  }
  
  // Limpiar localStorage
  localStorage.removeItem("usuario");
  localStorage.removeItem("sidebarCollapsed");
  
  console.log("Redirigiendo a login...");
  // Usar replace para evitar que el usuario vuelva atrás a la página protegida
  window.location.replace("index.html?logout=success");
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
window.addEventListener("pageshow", async (event) => {
  if (event.persisted) {
    return;
  }
  
  // Pequeño delay para evitar conflictos con otras inicializaciones
  setTimeout(() => {
    renderUser();
  }, 100);
});

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado - SessionController listo");
});

// -------------------- REDIRECCIÓN SI YA ESTÁ AUTENTICADO --------------------
export async function estaadentro() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('index.html') || currentPage === '/';
  
  if (!isLoginPage) return;

  try {

    const info = await me();
    if (info?.authenticated && info.user) {
      setTimeout(() => {
        window.location.href = "menu.html";
      }, 100);
    }
  } catch (error) {
  }
}

// Hacer SidebarManager disponible globalmente
window.SidebarManager = SidebarManager;