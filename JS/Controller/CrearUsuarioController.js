import { obtenerUbicaciones, obtenerRoles, subirFotoCloudinary, guardarDescripcion, checkDui, checkCorreo, checkTelefono } from '../Service/CrearUsuarioService.js';

/*Esto es para validar que no se repitan */
async function validarCampos(dui, correo, telefono) {
    const [duiExiste, correoExiste, telefonoExiste] = await Promise.all([
        checkDui(dui),
        checkCorreo(correo),
        checkTelefono(telefono)
    ]);

    if (duiExiste) throw new Error("DUI ya registrado");
    if (correoExiste) throw new Error("Correo ya registrado");
    if (telefonoExiste) throw new Error("Teléfono ya registrado");
}

export async function CargarUbicaciones() {
    const select = document.getElementById('departamento');
    const ubicaciones = await obtenerUbicaciones();
    if (ubicaciones.length === 0) return;
    select.options.length = 1;
    ubicaciones.forEach(ubi => {
        const option = document.createElement('option');
        option.value = ubi.idubicacion;
        option.textContent = ubi.ubicacion;
        select.appendChild(option);
    });
}

export async function CargarRoles() {
    const select = document.getElementById('rol');
    const roles = await obtenerRoles();
    if (roles.length === 0) return;
    select.options.length = 1;
    roles.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.idrol;
        option.textContent = rol.rol;
        select.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    CargarUbicaciones();
    CargarRoles();

    const form = document.getElementById("registroForm");
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("preview");

    // Notificación
    const notificacion = document.getElementById("notificacion");
    const notificacionMensaje = document.getElementById("notificacionMensaje");

    function mostrarNotificacion(mensaje, tipo = "exito") {
        notificacionMensaje.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = "block";

        setTimeout(() => {
            notificacion.style.display = "none";
        }, 2500);
    }

    function mostrarError(mensaje) {
        mostrarNotificacion(mensaje, "error");
    }

    function mostrarExito(mensaje) {
        mostrarNotificacion(mensaje, "exito");
    }

    // Vista previa de la foto
    fotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) {
            preview.style.display = "none";
            preview.src = "";
            return;
        }
        if (!file.type.startsWith("image/")) {
            mostrarError("Por favor selecciona una imagen válida.");
            fotoInput.value = "";
            preview.style.display = "none";
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener valores
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const dui = document.getElementById("dui").value.trim();
        const departamento = document.getElementById("departamento").value;
        const rol = document.getElementById("rol").value;
        const direccion = document.getElementById("direccion").value.trim();
        const correo = document.getElementById("correo").value.trim();
        let telefono = document.getElementById("telefono").value.trim();
        const fechaNacimiento = document.getElementById("fechaNacimiento")?.value;
        const file = fotoInput.files[0];

        // Validaciones (mantenemos las mismas)
        if (!nombre) return mostrarError("El nombre no puede ser nulo");
        if (nombre.length > 75) return mostrarError("El nombre no debe tener más de 75 caracteres");
        if (nombre.length < 3) return mostrarError("El nombre no puede tener menos de 3 caracteres");
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ '\-]+$/.test(nombre)) return mostrarError("El nombre solo debe contener letras, espacios, apóstrofes o guiones");

        if (!apellido) return mostrarError("El apellido no puede ser nulo");
        if (apellido.length > 75) return mostrarError("El apellido no debe tener más de 75 caracteres");
        if (apellido.length < 3) return mostrarError("El apellido no puede tener menos de 3 caracteres");
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ '\-]+$/.test(apellido)) return mostrarError("El apellido solo debe contener letras, espacios, apóstrofes o guiones");

        if (!dui) return mostrarError("El DUI no puede ser nulo");
        if (!/^\d{8}-\d$/.test(dui)) return mostrarError("Formato de DUI inválido (ej: 12345678-9)");

        if (!departamento) return mostrarError("El ID de ubicación no debe ser nulo");
        if (!rol) return mostrarError("El ID de rol no debe ser nulo");

        if (!direccion) return mostrarError("La dirección no debe ser nula");
        if (direccion.length > 300) return mostrarError("La dirección no debe superar los 300 caracteres");
        if (direccion.length < 10) return mostrarError("La dirección es muy corta");

        if (!correo) return mostrarError("El correo no debe ser nulo");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mostrarError("El correo debe tener un formato válido");

        // --- Validación teléfono ---
        if (!telefono) return mostrarError("El teléfono no debe ser nulo");

        // limpiar guiones o espacios
        let telefonoLimpio = telefono.replace(/[-\s]/g, "");  

        if (!/^\d{8}$/.test(telefonoLimpio)) {
            return mostrarError("El teléfono debe tener exactamente 8 dígitos numéricos (sin letras).");
        }

        // normalizar a formato internacional de El Salvador
        telefono = "+503" + telefonoLimpio;

        if (!fechaNacimiento) return mostrarError("La fecha de nacimiento no puede ser nula");
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        const hace18Anios = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
        if (nacimiento > hace18Anios) return mostrarError("Debes ser mayor de 18 años");
        const hace90Anios = new Date(hoy.getFullYear() - 90, hoy.getMonth(), hoy.getDate());
        if (nacimiento < hace90Anios) return mostrarError("Debes ser menor de 90 años");
        if (nacimiento >= hoy) return mostrarError("La fecha de nacimiento debe ser una fecha pasada");

        try {
            await validarCampos(dui, correo, telefono);

            //Hoy si subumis  a cloudinary
            let urlFoto;
            if (file) {
                urlFoto = await subirFotoCloudinary(file); 
            } else {
                // Imagen por defecto de firebase
                urlFoto = "https://firebasestorage.googleapis.com/v0/b/conversordeimagenes.firebasestorage.app/o/logo.png?alt=media&token=40bde2c7-43c2-4263-ae69-8aa25a540872";
            }
            if (urlFoto.length > 500) return mostrarError("El enlace de la foto no debe superar los 500 caracteres");

            const data = {
                nombre,
                apellido,
                dui,
                idubicacion: parseInt(departamento),
                idrol: parseInt(rol),
                direccion,
                correo,
                telefono, // ya normalizado con +503
                fotoperfil: urlFoto,
                fechadenacimiento: fechaNacimiento,
                estado: true
            };

            const resultado = await guardarDescripcion(data);
            localStorage.setItem("iddescripcion", resultado.data.iddescripcion);

            mostrarExito("¡Registro completado con éxito!");
            form.reset();

            setTimeout(() => {
                window.location.href = "CrearUsuario1.html";
            }, 3000);
        } catch (error) {
            mostrarError(error.message || "Error al registrar el usuario.");
        }
    });
});