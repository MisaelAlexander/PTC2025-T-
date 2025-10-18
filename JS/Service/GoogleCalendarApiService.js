const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    // Inicializar Google APIs - VERSIÓN SIMPLIFICADA
    async initializeGoogleApis() {
        if (this.gapiInited && this.gisInited) {
            return;
        }

        // Cargar Google API Client
        await this.loadScript('https://apis.google.com/js/api.js');
        await new Promise((resolve) => gapi.load('client', resolve));
        await gapi.client.init({});
        
        // Cargar Google Identity Services
        await this.loadScript('https://accounts.google.com/gsi/client');
        
        // Configurar token client SIN redirect_uri problemático
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                this.handleTokenResponse(response);
            },
            error_callback: (error) => {
                console.error('Error en OAuth:', error);
                if (this.pendingReject) {
                    this.pendingReject(new Error('Error de autenticación: ' + error.message));
                }
            }
        });

        this.gapiInited = true;
        this.gisInited = true;
    }

    // Cargar script genérico
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Manejar respuesta del token
    handleTokenResponse(response) {
        console.log('Respuesta de token recibida');
        
        if (response.error) {
            console.error('Error de token:', response.error);
            if (this.pendingReject) {
                this.pendingReject(new Error(`Error de autenticación: ${response.error}`));
            }
        } else {
            console.log('Token obtenido exitosamente');
            gapi.client.setToken(response);
            if (this.pendingResolve) {
                this.pendingResolve(response);
            }
        }
        this.cleanupPending();
    }

    // Limpiar pendientes
    cleanupPending() {
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    // Obtener token de acceso - VERSIÓN MEJORADA
    async getAccessToken() {
        return new Promise((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;

            const token = gapi.client.getToken();
            
            // Verificar si tenemos token válido
            if (token && !this.isTokenExpired(token)) {
                console.log(' Usando token existente');
                resolve(token);
                this.cleanupPending();
                return;
            }

            console.log(' Solicitando nuevo token...');
            try {
                // SOLUCIÓN: Usar over-the-air flow sin redirect_uri
                this.tokenClient.requestAccessToken({
                    prompt: 'consent'
                });
            } catch (error) {
                this.cleanupPending();
                reject(new Error('Error solicitando token: ' + error.message));
            }
        });
    }

    // Verificar si el token expiró
    isTokenExpired(token) {
        if (!token.expires_in) return true;
        // Calcular tiempo de expiración
        const expiryTime = token.issued_at + (token.expires_in * 1000);
        return Date.now() >= expiryTime;
    }

    // Crear evento automáticamente - VERSIÓN ROBUSTA
    async crearEventoAutomatico(visita) {
        try {
            console.log(' Iniciando creación automática de evento...');
            
            // 1. Inicializar APIs
            await this.initializeGoogleApis();
            console.log('APIs inicializadas');
            
            // 2. Obtener token
            const token = await this.getAccessToken();
            console.log(' Token obtenido');
            
            // 3. Cargar Calendar API
            await gapi.client.load('calendar', 'v3');
            console.log(' Calendar API cargada');
            
            // 4. Crear evento
            const evento = this.crearObjetoEvento(visita);
            console.log(' Creando evento...');
            
            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: evento,
            });

            console.log('Evento creado exitosamente:', response.result.htmlLink);
            return {
                success: true,
                eventLink: response.result.htmlLink,
                eventId: response.result.id
            };

        } catch (error) {
            console.error(' Error en crearEventoAutomatico:', error);
            throw this.manejarErrorGoogle(error);
        }
    }

    // Crear objeto evento
    crearObjetoEvento(visita) {
        const fechaInicio = new Date(`${visita.fecha}T${visita.hora}`);
        const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora

        return {
            summary: ` Visita: ${visita.inmuebletitulo}`,
            location: visita.ubicacion || 'Ubicación por confirmar',
            description: this.generarDescripcion(visita),
            start: {
                dateTime: fechaInicio.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: fechaFin.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            reminders: {
                useDefault: true,
            },
        };
    }

    // Manejar errores de Google
    manejarErrorGoogle(error) {
        console.error('Error detallado de Google:', error);
    
        if (error.result && error.result.error) {
            const googleError = error.result.error;
            switch (googleError.code) {
                case 401:
                    return new Error(' Sesión expirada. Por favor inicia sesión nuevamente.');
                case 403:
                    return new Error(' Sin permisos para acceder a Google Calendar.');
                case 409:
                    return new Error(' El evento ya existe en el calendario.');
                default:
                    return new Error(` Error de Google: ${googleError.message}`);
            }
        } else if (error.message && error.message.includes('popup')) {
            return new Error('Ventana bloqueada. Permite popups para autorizar.');
        } else {
            return error;
        }
    }

    generarDescripcion(visita) {
        return ` VISITA PROGRAMADA - ARQOS

INFORMACIÓN:
• Propiedad: ${visita.inmuebletitulo}
• Precio: $${visita.inmuebleprecio || 'No especificado'}
• Tipo: ${visita.tipovisita}

 DETALLES:
• Fecha: ${visita.fecha}
• Hora: ${visita.hora}
• Ubicación: ${visita.ubicacion || 'Por confirmar'}

 NOTAS:
${visita.descripcion || 'Sin notas adicionales'}

---
Creado automáticamente por ARQOS
`.trim();
    }

    // Verificar autenticación
    isAuthenticated() {
        const token = gapi.client.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    // Cerrar sesión
    logout() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
        }
    }
}

export const googleCalendarService = new GoogleCalendarService();