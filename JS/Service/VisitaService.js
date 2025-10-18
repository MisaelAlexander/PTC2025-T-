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

/*Funcion de mandar la visita a google calendar:D */

// 1 Espero que funcione
//2 Lo que hace esto es amndar la
// Generar enlace para Google Calendar - Versión corregida
export function generarEnlaceGoogleCalendar(visita) {
    console.log('Datos de la visita recibidos:', visita); // Para debug
    
    try {
        // Validar que tenemos fecha y hora
        if (!visita.fecha || !visita.hora) {
            console.error('Fecha u hora faltantes:', { fecha: visita.fecha, hora: visita.hora });
            return null;
        }

        // Formatear fecha y hora correctamente
        const fechaInicio = new Date(`${visita.fecha}T${visita.hora}`);
        
        // Validar que la fecha es válida
        if (isNaN(fechaInicio.getTime())) {
            console.error('Fecha inválida:', `${visita.fecha}T${visita.hora}`);
            return null;
        }

        // Agregar 1 hora de duración por defecto
        const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

        // Formato requerido por Google: YYYYMMDDTHHMMSSZ
        const formatearFechaGoogle = (fecha) => {
            return fecha.toISOString()
                .replace(/-/g, '')
                .replace(/:/g, '')
                .split('.')[0] + 'Z';
        };

        const fechaInicioFormateada = formatearFechaGoogle(fechaInicio);
        const fechaFinFormateada = formatearFechaGoogle(fechaFin);

        console.log('Fechas formateadas:', { inicio: fechaInicioFormateada, fin: fechaFinFormateada });

        // Crear parámetros para Google Calendar
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `Visita: ${visita.inmuebletitulo || 'Inmueble'}`,
            dates: `${fechaInicioFormateada}/${fechaFinFormateada}`,
            details: `Visita programada para el inmueble: ${visita.inmuebletitulo || 'Inmueble'}
Precio: $${visita.inmuebleprecio || 'No especificado'}
Tipo: ${visita.tipovisita || 'Visita'}
Nota: ${visita.descripcion || 'Sin notas adicionales'}
Estado: ${visita.estado || 'Aceptada'}`,
            location: visita.ubicacion || 'Ubicación por confirmar',
            sf: 'true',
            output: 'xml'
        });

        const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
        console.log('URL generada:', url); // Para debug
        
        return url;
    } catch (error) {
        console.error('Error generando enlace de Google Calendar:', error);
        return null;
    }
}