import { 
  publicarInmueble, 
  publicarFoto, 
  obtenerTipos, 
  obtenerUbicaciones, 
  obtenerBanios, 
  obtenerHabitaciones,
  subirImagen,
  actualizarInmueble,
  obtenerInmueblePorId,
  obtenerFotosPorInmueble,   
  eliminarFoto              
} from "../Service/PublicarService.js";

import { requireAuth, role, auth } from "./SessionController.js";

document.addEventListener("DOMContentLoaded", async () => {


  const ok = await requireAuth({ redirect: true });
  if (!ok || !role.isVendedor()) {
    window.location.href = "index.html";
    return;
  }

  const usuario = auth.user;  // usamos el user de la sesión en vez de localStorage

  const form = document.getElementById("formPublicar");
  const selectTipo = document.getElementById("idtipo");
  const selectUbi = document.getElementById("idubicacion");
  const selectBanios = document.getElementById("idbanios");
  const selectHab = document.getElementById("idhabitaciones");
  const fotosInput = document.getElementById("fotos");
  const preview = document.getElementById("preview");
  const fileCount = document.getElementById("fileCount");

  let selectedFiles = [];   // Archivos locales nuevos
  let existingPhotos = [];  // {idFoto, foto} desde API
  let removedPhotos = [];   // Fotos eliminadas
  let inmuebleId = null;    // Si viene en edición

  const params = new URLSearchParams(window.location.search);
  if (params.has("id")) inmuebleId = params.get("id");

  /* =====================
      Cargar combos dinámicos
  ===================== */
  try {
    const tipos = await obtenerTipos();
    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.idtipo;
      opt.textContent = t.tipo;
      selectTipo.appendChild(opt);
    });

    const ubicaciones = await obtenerUbicaciones();
    ubicaciones.data.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.idubicacion;
      opt.textContent = u.ubicacion;
      selectUbi.appendChild(opt);
    });

    const habitaciones = await obtenerHabitaciones();
    habitaciones.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.idhabitaciones;
      opt.textContent = h.habitaciones;
      selectHab.appendChild(opt);
    });

    const banios = await obtenerBanios();
    banios.data.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.idbanio;
      opt.textContent = b.banio;
      selectBanios.appendChild(opt);
    });
  } catch (error) {
    mostrarNotificacion("Error cargando datos iniciales", "error");
  }
/* =====================
      Mapa con Leaflet
  ===================== */
  const map = L.map("map").setView([13.6929, -89.2182], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  const marker = L.marker([13.6929, -89.2182]).addTo(map);

  const locateControl = L.control.locate({
    position: 'topright',
    strings: { title: "Mostrar mi ubicación actual" },
    locateOptions: { maxZoom: 16, enableHighAccuracy: true }
  }).addTo(map);

  map.on("click", e => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById("latitud").value = lat;
    document.getElementById("longitud").value = lng;
    marker.setLatLng([lat, lng]);
  });

  map.on('locationfound', e => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById("latitud").value = lat;
    document.getElementById("longitud").value = lng;
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 15);
    mostrarNotificacion("Ubicación actual capturada correctamente", "exito");
  });

  map.on('locationerror', e => {
    mostrarNotificacion("Error al obtener la ubicación: " + e.message, "error");
  });
/* =====================
      Cargar datos si es edición
  ===================== */
if (inmuebleId) {
  try {
    const res = await obtenerInmueblePorId(inmuebleId);
    const data = res.data;

    document.getElementById("titulo").value = data.titulo;
    document.getElementById("descripcion").value = data.descripcion;
    document.getElementById("precio").value = data.precio;
    selectTipo.value = data.idtipo;
    selectUbi.value = data.idubicacion;
    selectBanios.value = data.idbanios;
    selectHab.value = data.idhabitaciones;
    document.getElementById("latitud").value = data.latitud;
    document.getElementById("longitud").value = data.longitud;

    // Cargar fotos existentes desde backend
    const fotos = await obtenerFotosPorInmueble(inmuebleId);
    existingPhotos = fotos; // [{idFoto, foto, idInmueble}]
    fotos.forEach(f => agregarPreview(f.foto, "existing", null, f.idFoto));

    //  Ajustar mapa si hay coordenadas guardadas
    if (data.latitud && data.longitud) {
      const lat = parseFloat(data.latitud);
      const lng = parseFloat(data.longitud);
      marker.setLatLng([lat, lng]);   // mueve el marcador
      map.setView([lat, lng], 15);    // centra el mapa
    }

  } catch (error) {
    console.error("Error cargando inmueble:", error);
    mostrarNotificacion("Error al cargar datos del inmueble", "error");
  }
}


  /* =====================
      Previsualización de imágenes
  ===================== */
  fotosInput.addEventListener("change", e => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + existingPhotos.length + files.length > 10) {
      mostrarNotificacion("Máximo 10 imágenes permitidas", "error");
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith("image/") && !selectedFiles.includes(file)) {
        selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          agregarPreview(e.target.result, "new", file);
        };
        reader.readAsDataURL(file);
      }
    });

    fotosInput.value = "";
  });

  function agregarPreview(src, tipo, file = null, idFoto = null) {
    const previewItem = document.createElement("div");
    previewItem.classList.add("preview-item");

    const img = document.createElement("img");
    img.src = src;
    img.classList.add("preview-img");

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-image");
    removeBtn.innerHTML = "&times;";

    removeBtn.addEventListener("click", () => {
      if (tipo === "existing") {
        const index = existingPhotos.findIndex(f =>  f.idFoto === idFoto);
        if (index > -1) {
          removedPhotos.push(existingPhotos[index]); // marcar para eliminar
          existingPhotos.splice(index, 1);
        }
      } else if (tipo === "new") {
        const index = selectedFiles.indexOf(file);
        if (index > -1) selectedFiles.splice(index, 1);
      }
      previewItem.remove();
      updateFileCount();
    });

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    preview.appendChild(previewItem);
    updateFileCount();
  }

  function updateFileCount() {
    fileCount.textContent = 
      `${existingPhotos.length + selectedFiles.length} imagen(es) seleccionada(s)`;
  }

/* =====================
    Enviar formulario
===================== */
form.addEventListener("submit", async e => {
  e.preventDefault();

  let errores = [];

  //   titulo
  let titulo = document.getElementById("titulo").value.trim();
  if (titulo.length < 4) errores.push("El título debe tener al menos 4 caracteres");
  if (titulo.length > 150) errores.push("El título no debe superar los 150 caracteres");

  //   idtipo
  if (!selectTipo.value) errores.push("El tipo es obligatorio");

  //   idubicacion
  if (!selectUbi.value) errores.push("La ubicación es obligatoria");

  //   precio
  let precio = parseFloat(document.getElementById("precio").value);
  if (isNaN(precio)) errores.push("El precio es obligatorio");
  else if (precio <= 49) errores.push("El precio debe ser positivo y mayor o igual a 50");

  //   longitud
  let longitud = parseFloat(document.getElementById("longitud").value);
  if (isNaN(longitud)) errores.push("La longitud es obligatoria");
  else if (longitud < -180 || longitud > 180) errores.push("La longitud debe estar entre -180 y 180");

  //   latitud
  let latitud = parseFloat(document.getElementById("latitud").value);
  if (isNaN(latitud)) errores.push("La latitud es obligatoria");
  else if (latitud < -90 || latitud > 90) errores.push("La latitud debe estar entre -90 y 90");

  //   descripcion
  let descripcion = document.getElementById("descripcion").value.trim();
  if (descripcion.length === 0) errores.push("La descripción es obligatoria");
  if (descripcion.length > 450) errores.push("La descripción no debe superar los 450 caracteres");



  //   id
  if (!usuario.id) errores.push("El usuario es obligatorio");

  //   idbanios
  if (!selectBanios.value) errores.push("El número de baños es obligatorio");

  //   idhabitaciones
  if (!selectHab.value) errores.push("El número de habitaciones es obligatorio");

  // Si hay errores, mostrar y detener envío
  if (errores.length > 0) {
    errores.forEach(err => mostrarNotificacion(err, "error"));
    return;
  }

  //   Construcción DTO si pasa validaciones
  const dto = {
    titulo,
    descripcion,
    precio,
    idtipo: parseInt(selectTipo.value),
    idubicacion: parseInt(selectUbi.value),
    idhabitaciones: parseInt(selectHab.value),
    idbanios: parseInt(selectBanios.value),
    estado: true,
    idusuario: usuario.id,
    latitud,
    longitud
  };

  try {
    let inmuebleGuardado;
    if (inmuebleId) {
      inmuebleGuardado = await actualizarInmueble(inmuebleId, dto);
      mostrarNotificacion("Propiedad actualizada con éxito!", "exito");
    } else {
      inmuebleGuardado = await publicarInmueble(dto);
      mostrarNotificacion("Propiedad publicada con éxito!", "exito");
    }

    // 1. Eliminar fotos marcadas
    for (const f of removedPhotos) {
      await eliminarFoto(f.idFoto);
    }

// 2. Guardar fotos nuevas
for (const file of selectedFiles) {
  const subida = await subirImagen(file);

  if (!subida || !subida.url) {
    throw new Error("Error al subir imagen a Cloudinary");
  }

  await publicarFoto({
    idInmueble: inmuebleGuardado.idinmuebles,
    foto: subida.url
  });
}

    // Reset form
    form.reset();
    preview.innerHTML = "";
    selectedFiles = [];
    existingPhotos = [];
    removedPhotos = [];
    updateFileCount();
    inmuebleId = null;

  } catch (error) {
    mostrarNotificacion("Error al guardar la propiedad: " + error.message, "error");
  }
});
});
/* =====================
   Notificación flotante
===================== */
function mostrarNotificacion(mensaje, tipo = "exito") {
  const notificacion = document.getElementById("notificacion");
  const notificacionMensaje = document.getElementById("notificacionMensaje");

  notificacionMensaje.textContent = mensaje;
  notificacion.className = `notificacion ${tipo} show`;

  setTimeout(() => {
    notificacion.className = `notificacion ${tipo}`;
  }, 2000);
}
