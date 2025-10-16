const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/ComentariosUsuario";
const API_INMUEBLE = "https://arqosapi-9796070a345d.herokuapp.com/Inmueble";

// ======= COMENTARIOS =======
export async function crearComentario(comentarioData) {
  try {
    const res = await fetch(`${API_URL}/Guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(comentarioData),
    });
    if (!res.ok) throw new Error(`Error en la petición: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Error crearComentario:", e);
    throw e;
  }
}

export async function actualizarComentario(idComentario, comentarioData) {
  try {
    const res = await fetch(`${API_URL}/Actualizar/${idComentario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(comentarioData),
    });
    if (!res.ok) throw new Error(`Error en la petición: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Error actualizarComentario:", e);
    throw e;
  }
}

export async function eliminarComentario(idComentario) {
  try {
    const res = await fetch(`${API_URL}/Eliminar/${idComentario}`, { 
      method: "DELETE", 
      credentials: 'include'
    });
    
    // Manejar respuesta 204 No Content
    if (res.status === 204) {
      return { success: true, message: "Comentario eliminado correctamente" };
    }
    
    // Si hay otro código de éxito
    if (res.ok) {
      try {
        return await res.json();
      } catch (jsonError) {
        // Si no hay JSON pero la respuesta es OK
        return { success: true, message: "Comentario eliminado" };
      }
    }
    
    // Si hay error
    if (!res.ok) {
      // Intentar obtener mensaje de error del JSON
      try {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      } catch (jsonError) {
        throw new Error(`Error en la petición: ${res.status}`);
      }
    }
  } catch (e) {
    console.error("Error eliminarComentario:", e);
    throw e;
  }
}


export async function obtenerComentariosPorVendedor(idVendedor, page = 0, size = 5) {
  try {
    const res = await fetch(`${API_URL}/Vendedor/${idVendedor}?page=${page}&size=${size}`,{
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Error en la petición: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Error obtenerComentariosPorVendedor:", e);
    throw e;
  }
}

// ======= INMUEBLE =======
export async function obtenerIdUsuarioInmueble(idInmueble) {
  try {
    const res = await fetch(`${API_INMUEBLE}/BuscarPorId/${idInmueble}`,{credentials: 'include'});
    if (!res.ok) throw new Error(`Error al obtener inmueble: ${res.status}`);
    const data = await res.json();
    console.log(" Inmueble obtenido:", data);
    return data.data?.idusuario; // minúscula, según tu JSON
  } catch (e) {
    console.error("Error obtenerIdUsuarioInmueble:", e);
    throw e;
  }
}
