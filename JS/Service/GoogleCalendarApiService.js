const GOOGLE_CLIENT_ID = '675315032003-50dvo0f4dnapma29tlth558mdc2alcsf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

class GoogleCalendarService {
    constructor() {
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    // NUEVO ENFOQUE: Usar Google API Client directamente sin GIS problemático
    async initializeGapi() {
        return new Promise((resolve, reject) => {
            if (window.gapi && window.gapi.client) {
                resolve();
                return;
            }

            // Cargar Google API Client
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:auth2', () => {
                    gapi.client.init({
                        clientId: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    }).then(() => {
                        console.log('Google API inicializada correctamente');
                        resolve();
                    }).catch(reject);
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Autenticación con Google Auth2 (más estable)
    async authenticate() {
        try {
            await this.initializeGapi();
            
            const auth2 = gapi.auth2.getAuthInstance();
            const user = auth2.currentUser.get();
            
            if (user.isSignedIn()) {
                this.accessToken = user.getAuthResponse().access_token;
                this.isAuthenticated = true;
                return this.accessToken;
            }

            // Iniciar flujo de autenticación
            const googleUser = await auth2.signIn({
                prompt: 'consent'
            });

            this.accessToken = googleUser.getAuthResponse().access_token;
            this.isAuthenticated = true;
            
            console.log(' Autenticación exitosa');
            return this.accessToken;

        } catch (error) {
            console.error(' Error en autenticación:', error);
            
            if (error.error === 'popup_closed_by_user') {
                throw new Error('popup_blocked');
            }
            throw error;
        }
    }

    // Crear evento usando Fetch API con el token
    async crearEventoAutomatico(visita) {
        try {
            console.log(' Iniciando creación de evento...');
            
            // 1. Autenticar
            const token = await this.authenticate();
            
            // 2. Crear evento
            const evento = this.crearObjetoEvento(visita);
            
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
            
            console.log(' Evento creado exitosamente:', result.htmlLink);
            return {
                success: true,
                eventLink: result.htmlLink,
                eventId: result.id,
                method: 'automatic'
            };

        } catch (error) {
            console.error(' Error creando evento:', error);
            
            if (error.message === 'popup_blocked') {
                throw new Error('popup_blocked');
            }
            
            throw error;
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