// API de Inmuebles
const API_INM = "https://arqosapi-9796070a345d.herokuapp.com/Inmueble";
const API_FAV = "https://arqosapi-9796070a345d.herokuapp.com/Favorito";
const API_TIP = "https://arqosapi-9796070a345d.herokuapp.com/Tipo"; 
const API_UBI = "https://arqosapi-9796070a345d.herokuapp.com/Ubicacion";

// ============================
// FUNCIONES COMUNES (TIPOS, UBICACIONES, FOTOS)
// ============================

// Obtener ubicaciones
export async function obtenerUbicaciones() {
  try {
    const resp = await fetch(`${API_UBI}/Mostrar`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al obtener ubicaciones");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en obtenerUbicaciones:", err);
    return null;
  }
}

// Obtener todos los tipos
export async function obtenerTipos() {
  try {
    const resp = await fetch(`${API_TIP}/Mostrar`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error obteniendo tipos");
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error("Error en obtenerTipos:", err);
    return null;
  }
}

// Obtener foto principal de un inmueble
export async function obtenerFotoInmueble(idInmueble) {
  try {
    const resp = await fetch(`https://arqosapi-9796070a345d.herokuapp.com/Foto/Mostrar/${idInmueble}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al obtener fotos");
    const fotos = await resp.json();
    return fotos.length > 0 ? fotos[0].foto : "IMG/logo.png";
  } catch (err) {
    console.error("Error al cargar foto:", err);
    return "IMG/logo.png";
  }
}

// ============================
// FUNCIONES PARA USUARIO
// ============================

export async function mostrarInmuebles(page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/Mostrar?page=${page}&size=${size}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al cargar inmuebles");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en obtenerInmuebles:", err);
    return null;
  }
}

export async function mostrarInmueblesPorTipo(tipo, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarporTip/${tipo}?page=${page}&size=${size}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al buscar inmuebles por tipo");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorTipo:", err);
    return null;
  }
}

export async function mostrarInmueblesPorUbi(ubicacion, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarporUbi/${ubicacion}?page=${page}&size=${size}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al buscar inmuebles por ubicación");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorUbi:", err);
    return null;
  }
}

export async function mostrarInmueblesPorBusqueda(texto, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarporTitu?titulo=${encodeURIComponent(texto)}&page=${page}&size=${size}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al buscar inmuebles");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorBusqueda:", err);
    return null;
  }
}

export async function mostrarInmueblesPorUbiYTipo(idUbicacion, idTipo, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarPorUbicacionYTipo?idUbicacion=${idUbicacion}&idTipo=${idTipo}&page=${page}&size=${size}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al buscar inmuebles por ubicación y tipo");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorUbiYTipo:", err);
    return null;
  }
}

// Favoritos (solo usuarios)
export async function guardarFavorito(usuarioId, inmuebleId) {
  try {
    const resp = await fetch(`${API_FAV}/Guardar`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario: usuarioId, idInmueble: inmuebleId })
    });
    if (!resp.ok) throw new Error("Error al guardar favorito");
    return await resp.json();
  } catch (err) {
    console.error("Error al guardar favorito:", err);
    return null;
  }
}

export async function eliminarFavorito(idFavorito) {
  try {
    const resp = await fetch(`${API_FAV}/Eliminar/${idFavorito}`, { method: "DELETE",credentials: "include" });
    if (!resp.ok) throw new Error("Error al eliminar favorito");
    return true;
  } catch (err) {
    console.error("Error al eliminar favorito:", err);
    return false;
  }
}

export async function obtenerFavoritos(idUsuario) {
  try {
    const resp = await fetch(`${API_FAV}/Usuario/${idUsuario}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al obtener favoritos");
    const json = await resp.json();
    return Array.isArray(json.data?.content) ? json.data.content : [];
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return [];
  }
}

// ============================
// FUNCIONES PARA VENDEDOR
// ============================

// Obtener todos los inmuebles de un vendedor
export async function mostrarInmueblesPorUsuario(idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarporUser/${idUsuario}?page=${page}&size=${size}`,{credentials: "include",});
    if (!resp.ok) throw new Error("Error al obtener inmuebles por vendedor");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorUsuario:", err);
    return null;
  }
}

export async function mostrarInmueblesPorUbiYUser(idUbicacion, idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarPorUbiYUser?idUbicacion=${idUbicacion}&idUsuario=${idUsuario}&page=${page}&size=${size}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al filtrar por ubicación y vendedor");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorUbiYUser:", err);
    return null;
  }
}

export async function mostrarInmueblesPorTipYUser(idTipo, idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarPorTipYUser?idTipo=${idTipo}&idUsuario=${idUsuario}&page=${page}&size=${size}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al filtrar por tipo y vendedor");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorTipYUser:", err);
    return null;
  }
}

export async function mostrarInmueblesPorTituloYUser(titulo, idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarPorTituloYUser?titulo=${encodeURIComponent(titulo)}&idUsuario=${idUsuario}&page=${page}&size=${size}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al filtrar por título y vendedor");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorTituloYUser:", err);
    return null;
  }
}

export async function mostrarInmueblesPorUbiYTipoYUser(idUbicacion, idTipo, idUsuario, page = 0, size = 4) {
  try {
    const resp = await fetch(`${API_INM}/BuscarPorUbiTipYUser?idUbicacion=${idUbicacion}&idTipo=${idTipo}&idUsuario=${idUsuario}&page=${page}&size=${size}`,{credentials: "include"});
    if (!resp.ok) throw new Error("Error al filtrar por ubicación, tipo y vendedor");
    const json = await resp.json();
    return json.data;
  } catch (err) {
    console.error("Error en mostrarInmueblesPorUbiYTipoYUser:", err);
    return null;
  }
}


export async function eliminarInmueble(idInmueble) {
  try {
    // 1. Obtener el inmueble actual
    const respGet = await fetch(`${API_INM}/BuscarPorId/${idInmueble}`,{credentials: "include"});
    if (!respGet.ok) throw new Error("No se pudo obtener el inmueble");
    const dataGet = await respGet.json();
    const inmueble = dataGet.data; //  aquí está el objeto completo

    // 2. Crear el objeto actualizado (estado = false)
    // ponemos los ...inmeuble para copiar todas las propiedades del objeto original, y luego sobreescribimos estado a false
    const inmuebleActualizado = { ...inmueble, estado: false };

    // 3. Enviar el PUT con el objeto completo
    // aca solo enviamos el elemento
    const resp = await fetch(`${API_INM}/Actualizar/${idInmueble}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inmuebleActualizado)
    });

    if (!resp.ok) throw new Error("Error al eliminar inmueble");
    return await resp.json();
  } catch (err) {
    console.error("Error en eliminarInmueble:", err);
    return null;
  }
}
