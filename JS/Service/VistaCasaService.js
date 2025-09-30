// JS/Service/VistaCasaService.js
const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/Inmueble"; 
const API_IMG = "https://arqosapi-9796070a345d.herokuapp.com/Foto"; 

// Obtener inmueble por ID
export async function obtenerInmueblePorId(id) {
  try {
    const response = await fetch(`${API_URL}/BuscarPorId/${id}`,{credentials:"include"});
    if (!response.ok) {
      throw new Error("Error en la petición");
    }

    const result = await response.json();
    if (!result.status) {
      throw new Error(result.message || "Error en la respuesta del servidor");
    }

    // Devolvemos directamente el objeto data (que es el inmueble)
    return result.data;
  } catch (error) {
    console.error("Error en obtenerInmueblePorId:", error);
    return null;
  }
}


// Obtener inmueble por ID + fotos
export async function obtenerFotosPorInmuebleId(id) {
  try {
    const resp = await fetch(`${API_IMG}/Mostrar/${id}`,{credentials:"include"});
    if (!resp.ok) throw new Error("Error al obtener fotos");
    const fotos = await resp.json();
    return Array.isArray(fotos) ? fotos : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

