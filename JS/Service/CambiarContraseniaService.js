// Service para manejar la comunicación con el backend
const API_CAM = "https://arqosapi-9796070a345d.herokuapp.com/Usuario/RestablecerContrasena";

export async function restablecerContrasena(usuario, contrasenia) {
    try {
        const response = await fetch(`${API_CAM}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ usuario, contrasenia })
        });

        const data = await response.json();
        
        // Estructura exacta basada en tu JSON: {status: true, message: "...", data: {...}}
        return {
            status: data.status,        //  status
            mensaje: data.message,      //  message  
            usuario: data.data          //  data contiene el usuario
        };
    } catch (error) {
        console.error("Error en la API:", error);
        return { 
            status: false, 
            mensaje: "Error de conexión con el servidor" 
        };
    }
}