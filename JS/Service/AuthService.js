const API_BASE = 'https://arqosapi-9796070a345d.herokuapp.com/Usuario';

// Función para hacer login
export async function login(usuario, contrasena) {
    try {
        console.log("Enviando credenciales al servidor...");
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
        
        console.log("Login exitoso en servidor");
        return true;
    } catch (error) {
        console.error('Error en loginService:', error);
        throw error;
    }
}

// Funcion me - estado actual de autenticacion
export async function me() {
    try {
        console.log("Verificando estado de autenticación...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE}/me`, {
            credentials: 'include',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.log("Me: No autenticado (response not ok)");
            return { authenticated: false };
        }
        
        const data = await response.json();
        console.log("Me: Respuesta recibida", data);
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Me: Timeout - asumiendo no autenticado");
        } else {
            console.log('Error en me:', error.message);
        }
        return { authenticated: false };
    }
}

// Funcion de logout
export async function logout() {
    try {
        console.log("Ejecutando logout...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE}/logout`, {
            method: "POST",
            credentials: "include",
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("Logout completado en servidor");
        return true;
    } catch (error) {
        console.log("Logout: Error de red, pero procediendo con limpieza local");
        // Aún así consideramos exitoso para limpiar estado local
        return true;
    }
}