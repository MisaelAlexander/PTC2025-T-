const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.pendingVisita = null;
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    // Inicializar Google APIs
    async initializeGoogleApis() {
        return new Promise((resolve, reject) => {
            // Verificar si ya están inicializadas
            if (this.gapiInited && this.gisInited) {
                resolve();
                return;
            }

            let gapiLoaded = false;
            let gisLoaded = false;

            const checkInitialized = () => {
                if (gapiLoaded && gisLoaded) {
                    this.gapiInited = true;
                    this.gisInited = true;
                    resolve();
                }
            };

            // Cargar Google API Client
            if (!window.gapi) {
                const gapiScript = document.createElement('script');
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.onload = () => {
                    gapi.load('client', async () => {
                        try {
                            await gapi.client.init({});
                            gapiLoaded = true;
                            checkInitialized();
                        } catch (error) {
                            reject(error);
                        }
                    });
                };
                gapiScript.onerror = () => reject(new Error('Error cargando Google API'));
                document.head.appendChild(gapiScript);
            } else {
                gapiLoaded = true;
                checkInitialized();
            }

            // Cargar Google Identity Services
            if (!window.google) {
                const gisScript = document.createElement('script');
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.onload = () => {
                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        callback: (response) => {
                            this.handleTokenResponse(response);
                        },
                    });
                    gisLoaded = true;
                    checkInitialized();
                };
                gisScript.onerror = () => reject(new Error('Error cargando Google Identity Services'));
                document.head.appendChild(gisScript);
            } else {
                gisLoaded = true;
                checkInitialized();
            }
        });
    }

    // Manejar respuesta del token
    handleTokenResponse(response) {
        if (response.error) {
            if (this.pendingReject) {
                this.pendingReject(response);
            }
        } else {
            gapi.client.setToken(response);
            if (this.pendingResolve && this.pendingVisita) {
                this.crearEventoConToken(this.pendingVisita)
                    .then(this.pendingResolve)
                    .catch(this.pendingReject);
            }
        }
        
        // Limpiar pendientes
        this.pendingVisita = null;
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    // Obtener token de acceso
    async getAccessToken() {
        return new Promise((resolve, reject) => {
            // Verificar si ya tenemos token válido
            const token = gapi.client.getToken();
            if (token && !this.isTokenExpired(token)) {
                resolve(token);
                return;
            }

            // Solicitar nuevo token
            this.pendingResolve = resolve;
            this.pendingReject = reject;
            
            if (token === null) {
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                this.tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    }

    // Verificar si el token expiró
    isTokenExpired(token) {
        if (!token.expires_in) return true;
        const now = Date.now();
        return now >= token.expires_in;
    }

    // Crear evento con token
    async crearEventoConToken(visita) {
        try {
            await gapi.client.load('calendar', 'v3');

            const evento = {
                summary: `Visita: ${visita.inmuebletitulo}`,
                location: visita.ubicacion || 'Ubicación por confirmar',
                description: this.generarDescripcion(visita),
                start: {
                    dateTime: new Date(`${visita.fecha}T${visita.hora}:00`).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: new Date(new Date(`${visita.fecha}T${visita.hora}:00`).getTime() + 60 * 60 * 1000).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                reminders: {
                    useDefault: true,
                },
                guestsCanInviteOthers: false,
                guestsCanSeeOtherGuests: false,
            };

            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: evento,
            });

            console.log(' Evento creado automáticamente:', response.result.htmlLink);
            return {
                success: true,
                eventLink: response.result.htmlLink,
                eventId: response.result.id
            };

        } catch (error) {
            console.error(' Error creando evento automático:', error);
            throw error;
        }
    }

    // Crear evento automáticamente (método principal)
    async crearEventoAutomatico(visita) {
        try {
            console.log('Iniciando creación automática de evento...');
            
            // 1. Inicializar APIs
            await this.initializeGoogleApis();
            
            // 2. Obtener token de acceso
            await this.getAccessToken();
            
            // 3. Crear evento
            const resultado = await this.crearEventoConToken(visita);
            
            return resultado;

        } catch (error) {
            console.error(' Error en crearEventoAutomatico:', error);
            
            // Manejar errores específicos
            if (error.result && error.result.error) {
                const googleError = error.result.error;
                if (googleError.code === 401) {
                    throw new Error('Autenticación fallida. Por favor inicia sesión nuevamente.');
                } else if (googleError.code === 403) {
                    throw new Error('Permisos insuficientes. Se necesita acceso a Google Calendar.');
                } else {
                    throw new Error(`Error de Google: ${googleError.message}`);
                }
            }
            
            throw error;
        }
    }

    generarDescripcion(visita) {
        return ` VISITA PROGRAMADA

 INFORMACIÓN DEL INMUEBLE:
• Propiedad: ${visita.inmuebletitulo}
• Precio: $${visita.inmuebleprecio || 'No especificado'}
• Tipo: ${visita.tipovisita}

 DETALLES DE LA VISITA:
• Fecha: ${visita.fecha}
• Hora: ${visita.hora}
• Estado: ${visita.estado}
• Ubicación: ${visita.ubicacion || 'Por confirmar'}

 NOTAS:
${visita.descripcion || 'Sin notas adicionales'}

---
Sistema de Gestión ARQOS
`.trim();
    }

    // Verificar si está autenticado
    isAuthenticated() {
        const token = gapi.client.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    // Cerrar sesión
    logout() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
        }
    }

    // Verificar estado de autenticación
    async checkAuthStatus() {
        try {
            await this.initializeGoogleApis();
            return this.isAuthenticated();
        } catch (error) {
            return false;
        }
    }
}

// Crear instancia global
export const googleCalendarService = new GoogleCalendarService();