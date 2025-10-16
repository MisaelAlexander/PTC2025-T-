const API_BASE = 'https://arqosapi-9796070a345d.herokuapp.com/Usuario';

// Función para hacer login
export async function login(usuario, contrasena) {
    try {

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ usuario, contrasena })
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Error de autenticación");
            throw new Error(errorText);
        }
        

        return true;
    } catch (error) {
        console.error('Error en loginService:', error);
        throw error;
    }
}

// Funcion me - estado actual de autenticacion
export async function me() {
    try {

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE}/me`, {
            credentials: 'include',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {

            return { authenticated: false };
        }
        
        const data = await response.json();

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {

        } else {

        }
        return { authenticated: false };
    }
}

// Funcion de logout
export async function logout() {
    try {

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE}/logout`, {
            method: "POST",
            credentials: "include",
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        return true;
    } catch (error) {

        // Aún así consideramos exitoso para limpiar estado local
        return true;
    }
}