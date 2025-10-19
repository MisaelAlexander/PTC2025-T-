const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.accessToken = null;
        this.isAuthenticated = false;
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
    }

    //   NUEVO: Inicializar Google Identity Services
    async initializeGoogleApis() {
        try {
            console.log('🔄 Inicializando Google APIs...');
            
            // Cargar GAPI para Calendar API
            await this.loadGapi();
            
            // Cargar Google Identity Services
            await this.loadGis();
            
            console.log('  Google APIs inicializadas correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Google APIs:', error);
            throw error;
        }
    }

    // Cargar Google API Client (para Calendar)
    loadGapi() {
        return new Promise((resolve, reject) => {
            if (window.gapi && window.gapi.client) {
                this.gapiInited = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: '', // No necesitas API key para OAuth
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                        });
                        this.gapiInited = true;
                        console.log('  GAPI client inicializado');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    //   NUEVO: Cargar Google Identity Services
    loadGis() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts) {
                this.gisInited = true;
                this.initializeTokenClient();
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                this.gisInited = true;
                this.initializeTokenClient();
                console.log('  Google Identity Services inicializado');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    //   NUEVO: Inicializar el cliente de tokens
    initializeTokenClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                if (response.error) {
                    console.error('❌ Error en OAuth:', response.error);
                    return;
                }
                this.accessToken = response.access_token;
                this.isAuthenticated = true;
                console.log('  Token obtenido correctamente');
            },
            error_callback: (error) => {
                console.error('❌ Error en OAuth callback:', error);
            }
        });
    }

    //   NUEVO: Método de autenticación actualizado
    async authenticate() {
        try {
            console.log('🔄 Iniciando autenticación...');
            
            // Esperar a que estén inicializadas las APIs
            if (!this.gisInited || !this.gapiInited) {
                await this.initializeGoogleApis();
            }

            return new Promise((resolve, reject) => {
                if (this.accessToken && this.isAuthenticated) {
                    console.log('  Ya autenticado');
                    resolve(this.accessToken);
                    return;
                }

                // Configurar callback para la promesa
                const originalCallback = this.tokenClient.callback;
                this.tokenClient.callback = (response) => {
                    // Restaurar callback original
                    this.tokenClient.callback = originalCallback;
                    
                    if (response.error) {
                        reject(new Error(response.error));
                        return;
                    }
                    
                    this.accessToken = response.access_token;
                    this.isAuthenticated = true;
                    resolve(this.accessToken);
                };

                // Solicitar token
                this.tokenClient.requestAccessToken();
            });

        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            
            if (error.message?.includes('popup') || error.message?.includes('user closed')) {
                throw new Error('popup_blocked');
            }
            
            throw error;
        }
    }

    //   Método para crear evento (actualizado)
    async crearEventoAutomatico(visita) {
        try {
            console.log('🎫 Iniciando creación automática de evento...');
            
            // 1. Autenticar
            const token = await this.authenticate();
            
            // 2. Preparar evento
            const evento = this.crearObjetoEvento(visita);
            console.log('📅 Evento preparado:', evento);
            
            // 3. Crear evento usando Fetch API con el token
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(evento)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Google API: ${errorData.error?.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            console.log('  Evento creado exitosamente:', result.htmlLink);
            
            return {
                success: true,
                eventLink: result.htmlLink,
                eventId: result.id,
                method: 'automatic'
            };

        } catch (error) {
            console.error('❌ Error creando evento automático:', error);
            
            if (error.message === 'popup_blocked') {
                throw new Error('popup_blocked');
            }
            
            throw error;
        }
    }

    // 🔄 Mantener método manual como fallback
    generarEnlaceManual(visita) {
        try {
            const fechaInicio = new Date(`${visita.fecha}T${visita.hora}`);
            const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

            const formatearFecha = (fecha) => {
                return fecha.toISOString()
                    .replace(/-/g, '')
                    .replace(/:/g, '')
                    .split('.')[0] + 'Z';
            };

            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: `Visita: ${visita.inmuebletitulo}`,
                dates: `${formatearFecha(fechaInicio)}/${formatearFecha(fechaFin)}`,
                details: this.generarDescripcion(visita),
                location: visita.ubicacion || 'Ubicación por confirmar',
                sf: 'true'
            });

            return `https://calendar.google.com/calendar/render?${params.toString()}`;
        } catch (error) {
            console.error('Error generando enlace manual:', error);
            return 'https://calendar.google.com/calendar/r';
        }
    }

    crearObjetoEvento(visita) {
        const fechaInicio = new Date(`${visita.fecha}T${visita.hora}`);
        const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

        return {
            summary: `Visita: ${visita.inmuebletitulo}`,
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

    generarDescripcion(visita) {
        return `VISITA PROGRAMADA - ARQOS

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

    //   Nuevo método para cerrar sesión
    logout() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('Token revocado');
            });
        }
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    //   Nuevo método para verificar estado
    async checkAuth() {
        return this.isAuthenticated && this.accessToken !== null;
    }
}

export const googleCalendarService = new GoogleCalendarService();