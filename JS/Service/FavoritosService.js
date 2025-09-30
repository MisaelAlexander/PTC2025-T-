// URLs base
const API_FAV = "https://arqosapi-9796070a345d.herokuapp.com/Favorito";
const API_FOTO = "https://arqosapi-9796070a345d.herokuapp.com/Foto";

// Obtener favoritos paginados por usuario
export async function obtenerFavoritos(idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_FAV}/Usuario/${idUsuario}?page=${page}&size=${size}`, { credentials: 'include' });
    if (!resp.ok) throw new Error("Error al obtener favoritos");
    const json = await resp.json();
    return json.data || { content: [], totalPages: 1, pageNumber: 0 };
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return { content: [], totalPages: 1, pageNumber: 0 };
  }
}

// Eliminar un favorito
export async function eliminarFavorito(idFavorito) {
  try {
    const resp = await fetch(`${API_FAV}/Eliminar/${idFavorito}`, { method: "DELETE",credentials: 'include' });
    if (!resp.ok) throw new Error("Error al eliminar favorito");
    return true;
  } catch (err) {
    console.error("Error al eliminar favorito:", err);
    return false;
  }
}

// Obtener foto principal de un inmueble
export async function obtenerFotoInmueble(idInmueble) {
  try {
    const resp = await fetch(`${API_FOTO}/Mostrar/${idInmueble}`,{credentials: 'include'});
    if (!resp.ok) throw new Error("Error al obtener fotos");
    const fotos = await resp.json();
    return fotos.length > 0 ? fotos[0].foto : "IMG/logo.png";
  } catch (err) {
    console.error("Error al cargar foto:", err);
    return "IMG/logo.png";
  }
}
