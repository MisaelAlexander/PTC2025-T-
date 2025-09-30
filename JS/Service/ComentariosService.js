const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/ComentariosInmuebles";

// Crear comentario
export async function crearComentario(comentarioData) {
  try {
    const response = await fetch(`${API_URL}/Guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(comentarioData),
    });
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en crearComentario:", error);
    throw error;
  }
}

// Obtener comentarios de un inmueble con paginación
export async function obtenerComentariosPorInmueble(idInmueble, page = 0, size = 5) {
  try {
    const response = await fetch(`${API_URL}/Mostrar/Inmueble/${idInmueble}?page=${page}&size=${size}`,{
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en obtenerComentariosPorInmueble:", error);
    throw error;
  }
}

// Obtener comentarios de un usuario
export async function obtenerComentariosPorUsuario(idUsuario, page = 0, size = 5) {
  try {
    const response = await fetch(`${API_URL}/BuscarPorUsuario/${idUsuario}?page=${page}&size=${size}`,{
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en obtenerComentariosPorUsuario:", error);
    throw error;
  }
}

// Eliminar comentario
export async function eliminarComentario(idComentario) {
  try {
    const response = await fetch(`${API_URL}/Eliminar/${idComentario}`, { method: "DELETE",credentials: 'include' });
    if (!response.ok) throw new Error(`Error al eliminar comentario: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en eliminarComentario:", error);
    throw error;
  }
}

// Actualizar comentario
export async function actualizarComentario(idComentario, comentarioData) {
  try {
    const response = await fetch(`${API_URL}/Actualizar/${idComentario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(comentarioData),
    });
    if (!response.ok) throw new Error(`Error al actualizar comentario: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en actualizarComentario:", error);
    throw error;
  }
}
