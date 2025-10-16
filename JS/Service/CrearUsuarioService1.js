const API_USUARIO = "https://arqosapi-9796070a345d.herokuapp.com/Usuario";


// Servicio para guardar el usuario en la API
// SERVICIO CORREGIDO
export async function guardarUsuario(usuarioData) {
    const response = await fetch(`${API_USUARIO}/Guardar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include', // ← CAMBIAR a 'include' o 'same-origin'
        body: JSON.stringify(usuarioData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
}
// Función para mostrar mensajes de error al repetirse valor
export async function checkUsuario(usuario) {
    const res = await fetch(`${API_USUARIO}/check-usuario?usuario=${encodeURIComponent(usuario)}`);
    return res.json();
}

