const API_USUARIO = 'https://arqosapi-9796070a345d.herokuapp.com/Usuario';


// Servicio para guardar el usuario en la API
export async function guardarUsuario(usuarioData) {
    const response = await fetch(`${API_USUARIO}/Guardar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(usuarioData)
    });
    if (!response.ok) {
        throw new Error("Error al guardar el usuario");
    }
    return await response.json();
}
// Función para mostrar mensajes de error al repetirse valor
export async function checkUsuario(usuario) {
    const res = await fetch(`${API_USUARIO}/check-usuario?usuario=${encodeURIComponent(usuario)}`);
    return res.json();
}

