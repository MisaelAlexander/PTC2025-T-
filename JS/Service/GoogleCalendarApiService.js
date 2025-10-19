const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.accessToken = null;
        this.isAuthenticated = false;
        this.gapiLoaded = false;
        this.initializing = false;
    }
    
async initializeGoogleApis() {
        if (this.gapiLoaded) return true;
        if (this.initializing) {
            // Esperar si ya se está inicializando
            return new Promise(resolve => {
                const check = () => {
                    if (this.gapiLoaded) resolve(true);
                    else setTimeout(check, 100);
                };
                check();
            });
        }

        this.initializing = true;
        
        return new Promise((resolve, reject) => {
            // Si ya está cargado gapi
            if (window.gapi && window.gapi.client) {
                this.gapiLoaded = true;
                this.initializing = false;
                resolve(true);
                return;
            }

            // Cargar Google API Client
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = async () => {
                try {
                    await gapi.load('client:auth2', async () => {
                        await gapi.client.init({
                            clientId: GOOGLE_CLIENT_ID,
                            scope: SCOPES,
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                        });
                        
                        this.gapiLoaded = true;
                        this.initializing = false;
                        console.log(' Google API Client inicializado correctamente');
                        resolve(true);
                    });
                } catch (error) {
                    this.initializing = false;
                    console.error(' Error inicializando gapi.client:', error);
                    reject(error);
                }
            };
            
            script.onerror = () => {
                this.initializing = false;
                reject(new Error('Failed to load Google API script'));
            };
            
            document.head.appendChild(script);
        });
    }
    // Autenticación con Google Auth2 (más estable)
    async authenticate() {
        try {
            console.log('Iniciando autenticación...');
            
            // 1. Asegurar que gapi esté inicializado
            await this.initializeGoogleApis();
            
            // 2. Obtener instancia de auth
            const auth2 = gapi.auth2.getAuthInstance();
            if (!auth2) {
                throw new Error('Google Auth2 no disponible');
            }

            // 3. Verificar si ya está autenticado
            const user = auth2.currentUser.get();
            if (user.isSignedIn()) {
                this.accessToken = user.getAuthResponse().access_token;
                this.isAuthenticated = true;
                console.log(' Usuario ya autenticado');
                return this.accessToken;
            }

            // 4. Iniciar flujo de autenticación
            console.log('Solicitando autenticación...');
            const googleUser = await auth2.signIn({
                prompt: 'consent',
                ux_mode: 'popup'
            });

            this.accessToken = googleUser.getAuthResponse().access_token;
            this.isAuthenticated = true;
            
            console.log(' Autenticación exitosa');
            return this.accessToken;

        } catch (error) {
            console.error(' Error en autenticación:', error);
            
            if (error.error === 'popup_closed_by_user' || error.error === 'access_denied') {
                throw new Error('popup_blocked');
            }
            
            throw new Error(`Autenticación fallida: ${error.message || error}`);
        }
    }


    // Crear evento usando Fetch API con el token
 async crearEventoAutomatico(visita) {
        try {
            console.log(' Iniciando creación automática de evento...');
            
            // 1. Autenticar
            const token = await this.authenticate();
            
            // 2. Preparar evento
            const evento = this.crearObjetoEvento(visita);
            console.log(' Evento preparado:', evento);
            
            // 3. Crear evento usando gapi.client (más confiable)
            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: evento
            });

            console.log(' Evento creado exitosamente:', response.result.htmlLink);
            
            return {
                success: true,
                eventLink: response.result.htmlLink,
                eventId: response.result.id,
                method: 'automatic'
            };

        } catch (error) {
            console.error(' Error creando evento automático:', error);
            
            // Manejar errores específicos
            if (error.message === 'popup_blocked') {
                throw new Error('popup_blocked');
            }
            
            if (error.status === 403) {
                throw new Error('Permisos insuficientes para Google Calendar');
            }
            
            if (error.status === 401) {
                throw new Error('Token de autenticación inválido');
            }
            
            throw new Error(`Error al crear evento: ${error.message}`);
        }
    }

    // Generar enlace manual (fallback)
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

    // Cerrar sesión
    logout() {
        if (window.gapi && gapi.auth2) {
            const auth2 = gapi.auth2.getAuthInstance();
            if (auth2) {
                auth2.signOut();
            }
        }
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    // Verificar estado de autenticación
    async checkAuth() {
        try {
            await this.initializeGapi();
            const auth2 = gapi.auth2.getAuthInstance();
            return auth2.currentUser.get().isSignedIn();
        } catch (error) {
            return false;
        }
    }
}

export const googleCalendarService = new GoogleCalendarService();