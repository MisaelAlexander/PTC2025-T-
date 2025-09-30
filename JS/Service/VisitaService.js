const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/Visita";
const API_URL_TIPO = "https://arqosapi-9796070a345d.herokuapp.com/Estado";

// Obtener visitas por cliente
export async function obtenerVisitasPorCliente(idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/Cliente/${idUsuario}?page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener visitas por cliente");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorCliente:", err);
    throw err;
  }
}

// Obtener visitas por vendedor
export async function obtenerVisitasPorVendedor(idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/Vendedor/${idUsuario}?page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener visitas por vendedor");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorVendedor:", err);
    throw err;
  }
}

// Buscar visitas por título (cliente)
export async function obtenerVisitasPorTitulo(titulo, idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/BuscarPorTituloU?titulo=${encodeURIComponent(titulo)}&idUsuario=${idUsuario}&page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al buscar visitas por título (cliente)");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorTitulo:", err);
    throw err;
  }
}

// Buscar visitas por título (vendedor)
export async function obtenerVisitasPorTituloV(titulo, idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/BuscarPorTituloV?titulo=${encodeURIComponent(titulo)}&idUsuario=${idUsuario}&page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al buscar visitas por título (vendedor)");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorTituloV:", err);
    throw err;
  }
}

// Obtener tipos de visita
export async function obtenerTiposVisita() {
  try {
    const response = await fetch(`${API_URL_TIPO}/Mostrar`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener tipos de visita");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerTiposVisita:", err);
    throw err;
  }
}

// Obtener visitas por estado y cliente
export async function obtenerVisitasPorEstadoYCliente(idEstado, idCliente, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/EstadoCliente?idEstado=${idEstado}&idCliente=${idCliente}&page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener visitas por estado y cliente");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorEstadoYCliente:", err);
    throw err;
  }
}

// Obtener visitas por estado y vendedor
export async function obtenerVisitasPorEstadoYVendedor(idEstado, idVendedor, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/EstadoVendedor?idEstado=${idEstado}&idVendedor=${idVendedor}&page=${page}&size=${size}`, { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener visitas por estado y vendedor");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorEstadoYVendedor:", err);
    throw err;
  }
}

// Actualizar visita
export async function actualizarVisita(id, data) {
  const resp = await fetch(`${API_URL}/Actualizar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  if (!resp.ok) throw new Error("Error al actualizar la visita");
  return await resp.json();
}

// Obtener visitas por inmueble (normalizado)
export async function obtenerVisitasPorInmueble(id, page = 0, size = 10) {
  try {
    const resp = await fetch(`${API_URL}/Inmueble/${id}?page=${page}&size=${size}`, {
      credentials: "include"
    });

    if (!resp.ok) throw new Error("Error al obtener visitas por inmueble");

    const result = await resp.json();

    // Normalizamos para que sea compatible con cargarVisitas()
    return {
      data: {
        content: result.data || [],
        totalPages: 1, // si tu backend no devuelve paginación, ponemos 1
        pageNumber: 0  // y la página 0
      }
    };

  } catch (error) {
    console.error("Error en obtenerVisitasPorInmueble:", error);
    return {
      data: {
        content: [],
        totalPages: 1,
        pageNumber: 0
      }
    };
  }
}


