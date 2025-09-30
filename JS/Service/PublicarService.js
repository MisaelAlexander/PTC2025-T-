// Base URL
const API_BASE = "https://arqosapi-9796070a345d.herokuapp.com";

/* =====================
     SUBIDA DE ARCHIVOS
   ===================== */
export async function subirImagen(file) {
   // Si hay archivo, lo subimos a Cloudinary
    const formData = new FormData();
    formData.append("image", file); 
    formData.append("folder", "Inmuebles"); // Carpeta en el servidor

    try {
        const response = await fetch(`${API_BASE}/Imagen/GuardarCarpeta`, {
            method: "POST",
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Error al subir la foto a Cloudinary");
        }

        const data = await response.json();

        // Cloudinary devuelve un objeto con "url"
        if (!data.url) throw new Error("La respuesta no contiene la URL de la foto");

        return { url: data.url }; // 🔹 Ahora siempre devolvemos un objeto con {url}
    } catch (error) {
        console.error("Error en subirFotoCloudinary:", error);
        return false; 
    }
}

/* =====================
     INMUEBLES Y FOTOS
   ===================== */
export async function publicarInmueble(dto) {
  try {
    const res = await fetch(`${API_BASE}/Inmueble/Guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
      credentials: 'include'
    });
    return await res.json();
  } catch (error) {
    console.error("Error publicando inmueble:", error);
  }
}

// Relacionar foto con inmueble
export async function publicarFoto(dto) {
  try {
    const res = await fetch(`${API_BASE}/Foto/Guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto), 
      credentials: 'include'
    });
    return await res.json();
  } catch (error) {
    console.error("Error guardando foto:", error);
  }
}

/* =====================
     CATÁLOGOS
   ===================== */
export async function obtenerTipos() {
  try {
    const res = await fetch(`${API_BASE}/Tipo/Mostrar`,{credentials: 'include'});
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo tipos:", error);
  }
}

export async function obtenerUbicaciones() {
  try {
    const res = await fetch(`${API_BASE}/Ubicacion/Mostrar`,{credentials: 'include'});
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo ubicaciones:", error);
  }
}

export async function obtenerBanios() {
  try {
    const res = await fetch(`${API_BASE}/Banio/Mostrar`,{credentials: 'include'});
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo baños:", error);
  }
}

export async function obtenerHabitaciones() {
  try {
    const res = await fetch(`${API_BASE}/Habitacion/Mostrar`,{credentials: 'include'});
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo habitaciones:", error);
  }
}

/* =====================
   INMUEBLE CRUD
===================== */
export async function obtenerInmueblePorId(id) {
  try {
    const res = await fetch(`${API_BASE}/Inmueble/BuscarPorId/${id}`,{credentials: 'include'});
    return await res.json(); 
  } catch (error) {
    console.error("Error obteniendo inmueble:", error);
  }
}

export async function actualizarInmueble(id, dto) {
  try {
    const res = await fetch(`${API_BASE}/Inmueble/Actualizar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
      credentials: 'include'
    });
    return await res.json();
  } catch (error) {
    console.error("Error actualizando inmueble:", error);
  }
}

// Obtener fotos por inmueble
export async function obtenerFotosPorInmueble(id) {
  const res = await fetch(`${API_BASE}/Foto/Mostrar/${id}`,{credentials: 'include'});
  if (!res.ok) throw new Error("Error al obtener fotos");
  return await res.json();
}

// Eliminar foto
export async function eliminarFoto(id) {
  const res = await fetch(`${API_BASE}/Foto/Eliminar/${id}`, {
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Error al eliminar foto");
}
