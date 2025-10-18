const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.isInitializing = false;
    }

    // Inicializar Google APIs - CON MANEJO DE POPUP BLOQUEADO
    async initializeGoogleApis() {
        if (this.gapiInited && this.gisInited) {
            return;
        }

        if (this.isInitializing) {
            // Esperar si ya se está inicializando
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.initializeGoogleApis();
        }

        this.isInitializing = true;

        try {
            // Cargar Google API Client
            await this.loadScript('https://apis.google.com/js/api.js');
            await new Promise((resolve) => gapi.load('client', resolve));
            await gapi.client.init({});
            
            // Cargar Google Identity Services
            await this.loadScript('https://accounts.google.com/gsi/client');
            
            // Configurar token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {
                    if (response.access_token) {
                        gapi.client.setToken(response);
                    }
                },
                error_callback: (error) => {
                    console.warn(' Error en OAuth (puede ser normal):', error);
                }
            });

            this.gapiInited = true;
            this.gisInited = true;
            console.log(' Google APIs inicializadas correctamente');
        } catch (error) {
            console.error(' Error inicializando APIs:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    // Cargar script
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Error cargando script: ${src}`));
            document.head.appendChild(script);
        });
    }

    // Obtener token de acceso - CON MANEJO DE POPUP
    async getAccessToken() {
        try {
            await this.initializeGoogleApis();
            
            const token = gapi.client.getToken();
            if (token && !this.isTokenExpired(token)) {
                console.log(' Usando token existente');
                return token;
            }

            console.log(' Solicitando nuevo token...');
            
            return new Promise((resolve, reject) => {
                // Timeout para detectar popup bloqueado
                const popupTimeout = setTimeout(() => {
                    reject(new Error('El popup de autenticación fue bloqueado. Por favor permite ventanas emergentes para este sitio.'));
                }, 3000);

                this.tokenClient.callback = (response) => {
                    clearTimeout(popupTimeout);
                    
                    if (response.access_token) {
                        gapi.client.setToken(response);
                        resolve(response);
                    } else {
                        reject(new Error('No se pudo obtener el token de acceso'));
                    }
                };

                // Intentar abrir el popup
                try {
                    this.tokenClient.requestAccessToken({
                        prompt: 'consent'
                    });
                } catch (error) {
                    clearTimeout(popupTimeout);
                    reject(new Error('No se pudo abrir la ventana de autenticación. Por favor permite popups.'));
                }
            });

        } catch (error) {
            console.error('Error obteniendo token:', error);
            throw error;
        }
    }

    // Verificar si el token expiró
    isTokenExpired(token) {
        if (!token.expires_in) return true;
        const expiryTime = token.issued_at + (token.expires_in * 1000);
        return Date.now() >= expiryTime;
    }

    // Crear evento automáticamente - CON FALLBACK
    async crearEventoAutomatico(visita) {
        try {
            console.log('Intentando crear evento automáticamente...');
            
            const token = await this.getAccessToken();
            console.log('Token obtenido');
            
            await gapi.client.load('calendar', 'v3');
            
            const evento = this.crearObjetoEvento(visita);
            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: evento,
            });

            console.log('Evento creado automáticamente');
            return {
                success: true,
                eventLink: response.result.htmlLink,
                eventId: response.result.id,
                method: 'automatic'
            };

        } catch (error) {
            console.warn('No se pudo crear evento automáticamente:', error.message);
            
            // Si falla la autenticación automática, ofrecer opción manual
            if (error.message.includes('popup') || error.message.includes('bloqueado')) {
                throw new Error('popup_blocked');
            }
            
            throw error;
        }
    }

    // Generar enlace manual para Google Calendar
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
                text: ` Visita: ${visita.inmuebletitulo}`,
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
}

export const googleCalendarService = new GoogleCalendarService();