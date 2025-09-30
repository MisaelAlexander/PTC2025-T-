import { 
  obtenerTiposVisita, 
  obtenerVisitasPorInmueble, 
  registrarVisita,
  obtenerInmueblePorId,
  obtenerFotosPorInmuebleId
} from "../Service/CrearVisitaService.js";
import { guardarHistorial } from "../Service/HistorialService.js";
import { requireAuth, role, auth } from "./SessionController.js"; // Seguridad

let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let occupiedTimes = {}; // { "YYYY-MM-DD": ["HH:mm:ss", ...] }
let tiposVisita = [];
let inmuebleData = null;

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const defaultTimeSlots = ["09:00:00", "10:00:00", "11:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00", "18:00:00"];

// ==========================
// Carga inicial con seguridad
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  const oki = await requireAuth();
  if (!oki) return;


  // Restringir acceso a solo Usuario o Vendedor
  if (!(role.isUsuario())) {
    window.location.replace("index.html");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const idInmueble = params.get("id");
  if (!idInmueble) return console.error("⚠ No se encontró el idInmueble en la URL");

  try {
    inmuebleData = await obtenerInmueblePorId(idInmueble);

    // ===== Título y ubicación =====
    const propertyTitle = document.querySelector(".property-details h2");
    const propertyLocation = document.querySelector(".property-details p");
    if (propertyTitle) propertyTitle.textContent = inmuebleData.titulo || "Título no disponible";
    if (propertyLocation) propertyLocation.textContent = inmuebleData.ubicacion || "Ubicación no disponible";

    // ===== Cargar primera foto en .property-image img =====
    const fotos = await obtenerFotosPorInmuebleId(idInmueble);
    if (fotos.length > 0) {
      const firstPhotoUrl = fotos[0].foto;
      const propertyImage = document.querySelector(".property-image img");
      if (propertyImage) {
        propertyImage.src = firstPhotoUrl;
        propertyImage.alt = inmuebleData.titulo || "Imagen del inmueble";
      }
    }

    await cargarTiposVisita();
    await cargarDisponibilidad(idInmueble);
    generarCalendario();
    actualizarTimeSlots();
  } catch (error) {
    console.error("Error inicializando la página:", error);
    mostrarNotificacion("Error al cargar los datos del inmueble", "error");
  }

  document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generarCalendario();
    actualizarTimeSlots();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generarCalendario();
    actualizarTimeSlots();
  });

  document.getElementById("appointmentForm").addEventListener("submit", handleSubmit);
  document.querySelectorAll("#notes").forEach(input => input.addEventListener("input", validateForm));
});

// ==========================
// Utilidades de fechas locales
// ==========================
function buildLocalDate(fecha, hora = "00:00:00") {
  const [year, month, day] = fecha.split("-").map(Number);
  const [h, m, s] = hora.split(":").map(Number);
  return new Date(year, month - 1, day, h, m, s);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(time) {
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

// ==========================
// Sistema de notificaciones
// ==========================
function mostrarNotificacion(mensaje, tipo = "exito") {
  const notificacion = document.getElementById("notificacion");
  const notificacionMensaje = document.getElementById("notificacionMensaje");

  notificacionMensaje.textContent = mensaje;
  notificacion.className = `notificacion ${tipo}`;
  notificacion.style.display = "block";

  setTimeout(() => {
    notificacion.style.display = "none";
  }, 2000);
}

function mostrarModal(mensaje) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirm");
    const modalMensaje = document.getElementById("modalMensaje");
    const btnSi = document.getElementById("modalSi");
    const btnNo = document.getElementById("modalNo");

    modalMensaje.textContent = mensaje;
    modal.style.display = "flex";

    const limpiar = () => {
      btnSi.removeEventListener("click", onSi);
      btnNo.removeEventListener("click", onNo);
      modal.style.display = "none";
    };

    const onSi = () => {
      limpiar();
      resolve(true);
    };

    const onNo = () => {
      limpiar();
      resolve(false);
    };

    btnSi.addEventListener("click", onSi);
    btnNo.addEventListener("click", onNo);
  });
}

// ==========================
// Guardar en historial
// ==========================
async function guardarAgendamientoHistorial(usuarioData, fechaVisita, horaVisita) {
  try {
    const fechaVisitaFormateada = new Date(fechaVisita);
    const fechaVisitaStr = fechaVisitaFormateada.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const fechaManana = new Date();
    fechaManana.setDate(fechaManana.getDate() + 1);

    const datosHistorial = {
      descripcion: `Agendó visita para ${fechaVisitaStr} a las ${formatTime(horaVisita)}, para el inmueble "${inmuebleData.titulo}"`,
      fecha: fechaManana.toISOString(),
      idUsuario: usuarioData.idusuario
    };

    await guardarHistorial(datosHistorial);
    console.log("Historial de agendamiento guardado exitosamente");
  } catch (error) {
    console.error("Error al guardar en historial:", error);
  }
}

// ==========================
// Cargar tipos de visita
// ==========================
async function cargarTiposVisita() {
  try {
    tiposVisita = await obtenerTiposVisita();
    const container = document.querySelector(".visit-types");
    if (!container) return;

    container.innerHTML = "";
    tiposVisita.forEach((tipo, index) => {
      const label = document.createElement("label");
      label.className = "visit-option";
      label.innerHTML = `
        <input type="radio" name="visitType" value="${tipo.idtipoVisita}" ${index === 0 ? "checked" : ""}>
        <div class="option-content">
          <span class="option-title">${tipo.tipoVisita}</span>
          <span class="option-desc">${tipo.descripcion || ""}</span>
        </div>
      `;
      container.appendChild(label);
    });
  } catch (error) {
    console.error("Error cargando tipos de visita:", error);
    mostrarNotificacion("Error al cargar tipos de visita", "error");
  }
}

// ==========================
// Cargar disponibilidad
// ==========================
async function cargarDisponibilidad(idInmueble) {
  try {
    let visitas = await obtenerVisitasPorInmueble(idInmueble);

    // Asegurarnos de que sea un array
    if (!Array.isArray(visitas)) {
      if (visitas && Array.isArray(visitas.data)) {
        visitas = visitas.data; // si tu API devuelve {data: [...]}
      } else {
        visitas = []; // ningún registro
      }
    }

    occupiedTimes = {};

    visitas.forEach(v => {
      const fechaObj = buildLocalDate(v.fecha, v.hora);
      const fecha = formatDate(fechaObj);

      const [h, m, s] = v.hora.split(":");
      const hora = `${h.padStart(2,'0')}:${m.padStart(2,'0')}:${(s||'00').padStart(2,'0')}`;

      if (!occupiedTimes[fecha]) occupiedTimes[fecha] = new Set();
      occupiedTimes[fecha].add(hora);
    });

    // Convertir sets a arrays
    for (let fecha in occupiedTimes) {
      occupiedTimes[fecha] = Array.from(occupiedTimes[fecha]);
    }

  } catch (error) {
    console.error("Error cargando disponibilidad:", error);
    mostrarNotificacion("Error al cargar disponibilidad", "error");
  }
}


// ==========================
// Verificar slot disponible
// ==========================
function isSlotAvailable(date, time) {
  const dateStr = formatDate(date);
  return !(occupiedTimes[dateStr] || []).includes(time);
}

// ==========================
// Generar calendario
// ==========================
function generarCalendario() {
  const monthYear = document.getElementById("monthYear");
  const calendarGrid = document.querySelector(".calendar-grid");
  if (!monthYear || !calendarGrid) return;

  monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  calendarGrid.innerHTML = "";

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day disabled";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBtn = document.createElement("button");
    dayBtn.type = "button";
    dayBtn.className = "calendar-day";
    dayBtn.textContent = day;

    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    dateObj.setHours(0,0,0,0);
    const today = new Date(); 
    today.setHours(0,0,0,0);

    if (dateObj.getTime() === today.getTime()) dayBtn.classList.add("today");

    if (dateObj < today) {
      dayBtn.classList.add("disabled");
      dayBtn.disabled = true;
    } else {
      const dateStr = formatDate(dateObj);
      const horasOcupadas = (occupiedTimes[dateStr] || []).map(h => h.length === 5 ? h + ":00" : h);
      const availableSlots = defaultTimeSlots.filter(t => !horasOcupadas.includes(t));

      if (availableSlots.length === 0) {
        dayBtn.classList.add("occupied");
        dayBtn.disabled = true;
      } else if (horasOcupadas.length > 0) {
        dayBtn.classList.add("partial-occupied");
        dayBtn.title = `${horasOcupadas.length} hora(s) ocupada(s)`;
        dayBtn.addEventListener("click", () => selectDate(dateObj, dayBtn));
      }
      else{
        dayBtn.addEventListener("click", () => selectDate(dateObj, dayBtn));
      }
    }

    calendarGrid.appendChild(dayBtn);
  }
}

// ==========================
// Seleccionar fecha
// ==========================
function selectDate(date, element) {
  document.querySelectorAll(".calendar-day.selected").forEach(d => d.classList.remove("selected"));
  element.classList.add("selected");
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  selectedTime = null;
  actualizarTimeSlots();
  updateSummary();
  validateForm();
}

// ==========================
// Actualizar slots
// ==========================
function actualizarTimeSlots() {
  const timeSlotsContainer = document.getElementById("timeSlots");
  const noDateMessage = document.getElementById("noDateMessage");
  const availableCount = document.getElementById("availableCount");

  if (!selectedDate) {
    timeSlotsContainer.style.display = "none";
    noDateMessage.style.display = "block";
    availableCount.textContent = "";
    return;
  }

  noDateMessage.style.display = "none";
  timeSlotsContainer.style.display = "grid";
  timeSlotsContainer.innerHTML = "";

  const dateStr = formatDate(selectedDate);
  const horasOcupadas = (occupiedTimes[dateStr] || []).map(h => h.length === 5 ? h + ":00" : h);

  const availableSlots = defaultTimeSlots.filter(t => !horasOcupadas.includes(t));
  availableCount.textContent = `(${availableSlots.length} disponibles)`;

  defaultTimeSlots.forEach(time => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-slot";
    btn.textContent = formatTime(time);
    btn.dataset.time = time;

    if (horasOcupadas.includes(time)) {
      btn.disabled = true;
      btn.classList.add("occupied");
    } else {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".time-slot.selected").forEach(s => s.classList.remove("selected"));
        btn.classList.add("selected");
        selectedTime = time;
        updateSummary();
        validateForm();
      });
    }

    timeSlotsContainer.appendChild(btn);
  });
}

// ==========================
// Resumen y validaciones
// ==========================
function updateSummary() {
  const summary = document.getElementById("appointmentSummary");
  const summaryDate = document.getElementById("summaryDate");
  const summaryTime = document.getElementById("summaryTime");
  const summaryType = document.getElementById("summaryType");

  if (selectedDate && selectedTime) {
    const dateOptions = { weekday:"long", year:"numeric", month:"long", day:"numeric" };
    summaryDate.textContent = selectedDate.toLocaleDateString("es-ES", dateOptions);
    summaryTime.textContent = formatTime(selectedTime);

    const typeRadio = document.querySelector('input[name="visitType"]:checked');
    const tipo = tiposVisita.find(t => t.idtipoVisita == typeRadio?.value);
    summaryType.textContent = tipo?.tipoVisita || "Visita Individual";

    summary.style.display = "block";
  } else summary.style.display = "none";
}

function validateForm() {
  const confirmBtn = document.getElementById("confirmBtn");
  confirmBtn.disabled = !(selectedDate && selectedTime);
}

// ==========================
// Enviar formulario
// ==========================
async function handleSubmit(e) {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    mostrarNotificacion("Debes seleccionar fecha y hora.", "error");
    return;
  }

  if (!isSlotAvailable(selectedDate, selectedTime)) {
    mostrarNotificacion("La fecha y hora seleccionadas ya están ocupadas.", "error");
    return;
  }
   const usuario = auth.user;



  const typeRadio = document.querySelector('input[name="visitType"]:checked');
  if (!typeRadio) {
    mostrarNotificacion("Debes seleccionar un tipo de visita.", "error");
    return;
  }

  const fechaParaEnviar = new Date(selectedDate);
  fechaParaEnviar.setDate(fechaParaEnviar.getDate());

  const visita = {
    fecha: formatDate(fechaParaEnviar),
    hora: selectedTime,
    descripcion: document.getElementById("notes").value || "",
    idestado: 3,
    idinmueble: inmuebleData.idinmuebles,
    idvendedor: inmuebleData.idusuario,
    idcliente: usuario.id,
    idtipovisita: parseInt(typeRadio.value)
  };

  const confirmBtn = document.getElementById("confirmBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");

  btnText.textContent = "Confirmando...";
  btnSpinner.style.display = "inline-block";
  confirmBtn.disabled = true;

  try {
    const result = await registrarVisita(visita);
    if (result && result.idvisita) {
      await guardarAgendamientoHistorial(usuario, selectedDate, selectedTime);
      mostrarNotificacion(`Has agendado una visita para ${inmuebleData.titulo}`, "exito");

      await cargarDisponibilidad(inmuebleData.idinmuebles);
      generarCalendario();

      if (selectedDate) {
        const day = selectedDate.getDate();
        const btn = [...document.querySelectorAll(".calendar-day")]
          .find(b => b.textContent == day && !b.classList.contains("disabled"));
        if (btn) selectDate(selectedDate, btn);
      } else {
        actualizarTimeSlots();
      }
    } else {
      mostrarNotificacion("No se pudo registrar la cita. Inténtalo nuevamente.", "error");
    }
  } catch (error) {
    console.error("Error al registrar la cita:", error);
    mostrarNotificacion("Error al registrar la cita. Revisa la consola para más detalles.", "error");
  } finally {
    btnText.textContent = "Confirmar Cita";
    btnSpinner.style.display = "none";
    confirmBtn.disabled = false;
    validateForm();
  }
}
