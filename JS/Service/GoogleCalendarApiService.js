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

    // Inicializar Google APIs - CORREGIDO
    async initializeGoogleApis() {
        return new Promise((resolve, reject) => {
            if (this.gapiInited && this.gisInited) {
                resolve();
                return;
            }

            // Cargar Google API Client - CORREGIDO
            const loadGapi = () => {
                return new Promise((resolveGapi) => {
                    if (window.gapi) {
                        gapi.load('client', async () => {
                            try {
                                await gapi.client.init({});
                                resolveGapi();
                            } catch (error) {
                                reject(error);
                            }
                        });
                    } else {
                        const gapiScript = document.createElement('script');
                        gapiScript.src = 'https://apis.google.com/js/api.js';
                        gapiScript.onload = () => {
                            gapi.load('client', async () => {
                                try {
                                    await gapi.client.init({});
                                    resolveGapi();
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        };
                        gapiScript.onerror = () => reject(new Error('Error cargando Google API'));
                        document.head.appendChild(gapiScript);
                    }
                });
            };

            // Cargar Google Identity Services - CORREGIDO
            const loadGis = () => {
                return new Promise((resolveGis) => {
                    if (window.google) {
                        this.initializeTokenClient();
                        resolveGis();
                    } else {
                        const gisScript = document.createElement('script');
                        gisScript.src = 'https://accounts.google.com/gsi/client';
                        gisScript.onload = () => {
                            this.initializeTokenClient();
                            resolveGis();
                        };
                        gisScript.onerror = () => reject(new Error('Error cargando Google Identity Services'));
                        document.head.appendChild(gisScript);
                    }
                });
            };

            // Inicializar token client - NUEVO MÉTODO
            this.initializeTokenClient = () => {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: (response) => {
                        this.handleTokenResponse(response);
                    },
                    // PARÁMETROS CLAVE AGREGADOS:
                    hint: '',
                    state: 'calendar_auth',
                });
            };

            // Ejecutar ambas cargas
            Promise.all([loadGapi(), loadGis()])
                .then(() => {
                    this.gapiInited = true;
                    this.gisInited = true;
                    resolve();
                })
                .catch(reject);
        });
    }

    // Manejar respuesta del token - CORREGIDO
    handleTokenResponse(response) {
        console.log(' Respuesta de token:', response);
        
        if (response.error) {
            console.error(' Error de autenticación:', response.error);
            if (this.pendingReject) {
                this.pendingReject(new Error(response.error_description || response.error));
            }
        } else {
            console.log(' Token recibido correctamente');
            gapi.client.setToken(response);
            if (this.pendingResolve) {
                this.pendingResolve(response);
            }
        }
        
        this.cleanupPending();
    }

    // Limpiar pendientes - NUEVO MÉTODO
    cleanupPending() {
        this.pendingVisita = null;
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    // Obtener token de acceso - CORREGIDO
    async getAccessToken() {
        return new Promise((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;

            const token = gapi.client.getToken();
            
            if (token && !this.isTokenExpired(token)) {
                console.log(' Usando token existente');
                resolve(token);
                this.cleanupPending();
                return;
            }

            console.log(' Solicitando nuevo token...');
            try {
                this.tokenClient.requestAccessToken({
                    prompt: 'consent',
                    // Sin redirect_uri para evitar el error
                });
            } catch (error) {
                this.cleanupPending();
                reject(error);
            }
        });
    }

    // Verificar si el token expiró - CORREGIDO
    isTokenExpired(token) {
        if (!token.expires_at) return true;
        const now = Date.now();
        return now >= token.expires_at;
    }

    // Crear evento con token - CORREGIDO
    async crearEventoConToken(visita) {
        try {
            // Cargar Calendar API explícitamente
            await gapi.client.load('calendar', 'v3');
            console.log(' Calendar API cargada');

            const evento = {
                summary: ` Visita: ${visita.inmuebletitulo}`,
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
            };

            console.log(' Creando evento:', evento);
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

    // Crear evento automáticamente (método principal) - CORREGIDO
    async crearEventoAutomatico(visita) {
        try {
            console.log('Iniciando creación automática de evento...');
            
            // 1. Inicializar APIs
            await this.initializeGoogleApis();
            console.log('APIs inicializadas');
            
            // 2. Obtener token de acceso
            const token = await this.getAccessToken();
            console.log(' Token obtenido');
            
            // 3. Crear evento
            const resultado = await this.crearEventoConToken(visita);
            console.log('Evento creado exitosamente');
            
            return resultado;

        } catch (error) {
            console.error('Error en crearEventoAutomatico:', error);
            
            // Manejar errores específicos
            if (error.result && error.result.error) {
                const googleError = error.result.error;
                if (googleError.code === 401) {
                    throw new Error('Autenticación fallida. Por favor inicia sesión nuevamente.');
                } else if (googleError.code === 403) {
                    throw new Error('Permisos insuficientes. Se necesita acceso a Google Calendar.');
                } else {
                    throw new Error(`Error de Google: ${googleError.message} (Código: ${googleError.code})`);
                }
            } else if (error.message && error.message.includes('popup')) {
                throw new Error('La ventana de autorización fue bloqueada. Por favor permite los popups.');
            } else {
                throw error;
            }
        }
    }

    generarDescripcion(visita) {
        return `VISITA PROGRAMADA

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
Sistema ARQOS
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
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }
}

// Crear instancia global
export const googleCalendarService = new GoogleCalendarService();