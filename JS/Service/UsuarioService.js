const API_USE = "https://arqosapi-9796070a345d.herokuapp.com/Usuario";
const API_UBI = "https://arqosapi-9796070a345d.herokuapp.com/Ubicacion";
const API_IMG = "https://arqosapi-9796070a345d.herokuapp.com/Imagen";


// Actualizar usuario completo
export async function actualizarUsuarioCompleto(id, usuarioDTO) {
    try {
        const response = await fetch(`${API_USE}/Actualizar/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(usuarioDTO)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al actualizar usuario");

        return data.data;
    } catch (error) {
        console.error("Error en actualizarUsuarioCompleto:", error);
        throw error;
    }
}

// Obtener ubicaciones
export async function obtenerUbicaciones() {
    try {
        const response = await fetch(`${API_UBI}/Mostrar`,{credentials: 'include'});
        if (!response.ok) throw new Error("Error al obtener ubicaciones");

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error en obtenerUbicaciones:", error);
        return [];
    }
}

// Servicio para subir una foto a Cloudinary - MODIFICADO
export async function subirFotoUsuario(file) {
    // Si no hay archivo, devolvemos la imagen por defecto
    if (!file) {
        return IMAGEN_POR_DEFECTO; 
    }

    // Si hay archivo, lo subimos a Cloudinary
    const formData = new FormData();
    formData.append("image", file); // Cambiado de "file" a "image" para coincidir con tu controller
    formData.append("folder", "Usuarios"); // Especificamos la carpeta

    try {
        const response = await fetch(`${API_IMG}/GuardarCarpeta`, {
            method: "POST",
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Error al subir la foto a Cloudinary");
        }

        const data = await response.json();

        // Validar que exista la propiedad url (Cloudinary devuelve "url")
        if (!data.url) throw new Error("La respuesta no contiene la URL de la foto");

        return data.url;
    } catch (error) {
        console.error("Error en subirFotoCloudinary:", error);
        // Si falla la subida, devolvemos la imagen por defecto
        return IMAGEN_POR_DEFECTO; 
    }
}



// Desactivar usuario
export async function desactivarUsuario(id, usuarioDTO) {
    try {
        const response = await fetch(`${API_USE}/Actualizar/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuarioDTO),
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al desactivar usuario");

        return data.data;
    } catch (error) {
        console.error("Error en desactivarUsuario:", error);
        throw error;
    }
}

// Obtener usuario por ID
export async function obtenerUsuarioPorId(id) {
    try {
        const response = await fetch(`${API_USE}/Buscar/${id}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Error al obtener usuario");
        return data.data;
    } catch (error) {
        console.error("Error en obtenerUsuarioPorId:", error);
        return null;
    }
}
