const API_HISTORIAL = "https://arqosapi-9796070a345d.herokuapp.com/Historial"; 

// Buscar historial por usuario 
export async function obtenerHistorial(idUsuario, page = 0, size = 5) {
  try {
    const resp = await fetch(
      `${API_HISTORIAL}/Usuario/${idUsuario}?page=${page}&size=${size}`, 
      {
        method: "GET",
        credentials: "include", //  importante para enviar cookie
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!resp.ok) throw new Error("Error al obtener historial");

    const json = await resp.json();
    console.log("Historial cargado:", json); //  debug
    return json; //Retornamos
  } catch (err) {
    console.error("Error al obtener historial", err);
    return null;
  }
}

// Guardar datos en el historial
export async function guardarHistorial(historial) {
  try {
    const resp = await fetch(`${API_HISTORIAL}/Guardar`, {
      method: "POST",
      credentials: "include", //  enviar cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(historial)
    });

    if (!resp.ok) throw new Error("Error al guardar historial");
    
    const json = await resp.json();
    console.log("Historial guardado:", json); //  debug
    return json;
  } catch (err) {
    console.error("Error al guardar historial:", err);
    return null;
  }
}
