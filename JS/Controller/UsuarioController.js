import { actualizarUsuarioCompleto, obtenerUbicaciones, subirFotoUsuario, obtenerUsuarioPorId, desactivarCuenta } from '../Service/UsuarioService.js';
import { renderUser,auth,cerrarSesion } from "../Controller/SessionController.js";

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------- Session / Autenticación --------------------
    await renderUser();

     const datos = auth.user;
     if (!auth.ok) {
            mostrarNotificacion("Debes iniciar sesión para ver tus favoritos", "error");
            return;
        }
    // -------------------- Fin Session --------------------

    // Elementos DOM
    const perfilFoto = document.getElementById('perfilFoto');
    const profileCard = document.getElementById('profileCard');
    const actualizarBtn = document.getElementById('actualizarBtn');
    const historialBtn = document.getElementById('historialBtn');
    const guardarBtn = document.getElementById('guardarBtn');
    const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
    const eliminarCuentaBtn = document.getElementById('eliminarCuentaBtn');
    const notificacion = document.getElementById("notificacion");
    const notificacionMensaje = document.getElementById("notificacionMensaje");

    // Confirmación de desactivación
    const confirmacionDesactivar = document.getElementById("modalConfirm");
    const btnConfirmar = document.getElementById("modalSi");
    const btnCancelar = document.getElementById("modalNo");


    function mostrarModalConfirm(mensaje) {
    return new Promise((resolve) => {
        const modal = document.getElementById("modalConfirm");
        const modalMensaje = document.getElementById("modalMensaje");
        const btnSi = document.getElementById("modalSi");
        const btnNo = document.getElementById("modalNo");

        modalMensaje.textContent = mensaje;
        modal.style.display = "block"; // Mostrar modal

        // Limpiar eventos previos
        btnSi.onclick = null;
        btnNo.onclick = null;

        btnSi.onclick = () => {
            modal.style.display = "none";
            resolve(true);
        };

        btnNo.onclick = () => {
            modal.style.display = "none";
            resolve(false);
        };
    });
}

    let ubicaciones = [];


    try {
        ubicaciones = await obtenerUbicaciones();
        console.log("Ubicaciones cargadas:", ubicaciones);
    } catch (err) {
        console.error("Error cargando ubicaciones:", err);
        ubicaciones = [];
    }
    // Funciones auxiliares
    const formatearFecha = fecha => fecha?.includes('T') ? fecha.split('T')[0] : fecha || '';
    const formatearFechaISO = fecha => fecha?.includes('T') ? fecha.split('T')[0] : fecha || null;
    const obtenerValorInput = id => document.getElementById(id)?.value.trim() || '';

    // Función para quitar el código de país (503) para mostrar en UI
    const quitarCodigoPais = (telefono) => {
        if (!telefono) return '';
        return telefono.replace(/^503/, '').trim();
    };

    // Función para agregar el código de país (503) para enviar al backend
    const agregarCodigoPais = (telefono) => {
        if (!telefono) return '';
        const telefonoLimpio = telefono.replace(/\D/g, '');
        return telefonoLimpio.startsWith('503') ? telefonoLimpio : `503${telefonoLimpio}`;
    };

    function mostrarNotificacion(mensaje, tipo = "exito") {
        if (!notificacion || !notificacionMensaje) return;
        notificacion.className = `notificacion ${tipo}`;
        notificacionMensaje.textContent = mensaje;
        notificacion.style.display = "block";
        setTimeout(() => notificacion.style.display = "none", 4000);
    }

    // Cargar perfil
    let usuario = null;
if (auth.ok && auth.user?.id) {
    usuario = await obtenerUsuarioPorId(auth.user.id);
}

if (!usuario) {
    mostrarNotificacion("No se pudo cargar la información del usuario.", "error");
    return;
}

    function cargarPerfil() {

        if (perfilFoto) perfilFoto.src = usuario.fotoPerfil || usuario.fotoperfil || 'IMG/logo.png';

        if (!profileCard) return;

        const ubicacionId = usuario.idubicacion || usuario.IDUbicacion;
        let ubicacionNombre = '-';
        if (ubicacionId) {
            const u = ubicaciones.find(u => u.idubicacion == ubicacionId || u.IDUbicacion == ubicacionId);
            ubicacionNombre = u?.nombre || u?.ubicacion || '-';
        }

        // Mostrar teléfono sin código de país en la vista
        const telefonoMostrar = quitarCodigoPais(usuario.telefono);

        profileCard.innerHTML = `
            <div class="section-title">Información Personal</div>
            <div class="profile-row"><h4>Nombre</h4><p>${usuario.nombre || '-'}</p></div>
            <div class="profile-row"><h4>Apellido</h4><p>${usuario.apellido || '-'}</p></div>
            <div class="profile-row"><h4>Nacimiento</h4><p>${formatearFecha(usuario.fechadeNacimiento || usuario.fechaDeNacimiento) || '-'}</p></div>
            <div class="profile-row"><h4>DUI</h4><p>${usuario.dui || '-'}</p></div>
            <div class="profile-row"><h4>Ubicación</h4><p>${ubicacionNombre}</p></div>
            <div class="section-title">Cuenta</div>
            <div class="profile-row"><h4>Usuario</h4><p>${usuario.usuario || '-'}</p></div>
            <div class="profile-row"><h4>Rol</h4><p>${usuario.rol || '-'}</p></div>
            <div class="section-title">Contacto</div>
            <div class="profile-row"><h4>Correo</h4><p>${usuario.correo || '-'}</p></div>
            <div class="profile-row"><h4>Teléfono</h4><p>${telefonoMostrar || '-'}</p></div>
            <div class="profile-row"><h4>Dirección</h4><p>${usuario.direccion || '-'}</p></div>
        `;
    }

    cargarPerfil();

    // Botón actualizar
    actualizarBtn?.addEventListener('click', () => {
        
        if (!usuario || !profileCard) return;

        let ubicacionOptions = '<option value="">Seleccione una ubicación</option>';
        ubicaciones.forEach(u => {
            const id = u.idubicacion || u.IDUbicacion;
            const selected = id == (usuario.idubicacion || usuario.IDUbicacion) ? 'selected' : '';
            ubicacionOptions += `<option value="${id}" ${selected}>${u.nombre || u.ubicacion}</option>`;
        });

        // Mostrar teléfono sin código de país en el formulario de edición
        const telefonoMostrar = quitarCodigoPais(usuario.telefono);

        profileCard.innerHTML = `
            <div class="section-title">Imagen de perfil</div>
            <div class="profile-row">
                <img id="previewFoto" src="${usuario.fotoPerfil || 'IMG/logo.png'}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-right:10px;">
                <input type="file" id="fotoInput" accept="image/*">
            </div>
            <div class="section-title">Información Personal</div>
            <div class="profile-row"><h4>Nombre</h4><input id="nombreInput" type="text" value="${usuario.nombre || ''}"></div>
            <div class="profile-row"><h4>Apellido</h4><input id="apellidoInput" type="text" value="${usuario.apellido || ''}"></div>
            <div class="profile-row"><h4>Nacimiento</h4><input type="date" id="nacimientoInput" value="${formatearFecha(usuario.fechadeNacimiento || usuario.fechaDeNacimiento) || ''}"></div>
            <div class="profile-row"><h4>DUI</h4><input id="duiInput" type="text" value="${usuario.dui || ''}"></div>
            <div class="profile-row"><h4>Ubicación</h4><select id="ubicacionInput">${ubicacionOptions}</select></div>
            <div class="section-title">Cuenta</div>
            <div class="profile-row"><h4>Usuario</h4><input id="usuarioInput" type="text" value="${usuario.usuario || ''}"></div>
            <div class="profile-row"><h4>Rol</h4><input id="rolInput" value="${usuario.rol || ''}" disabled></div>
            <div class="section-title">Contacto</div>
            <div class="profile-row"><h4>Correo</h4><input id="correoInput" type="email" value="${usuario.correo || ''}"></div>
            <div class="profile-row"><h4>Teléfono</h4><input id="telefonoInput" type="tel" value="${telefonoMostrar || ''}" placeholder="Ej: 12345678"></div>
            <div class="profile-row"><h4>Dirección</h4><input id="direccionInput" type="text" value="${usuario.direccion || ''}"></div>
        `;

        // Preview de foto
        document.getElementById('fotoInput')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) document.getElementById('previewFoto').src = URL.createObjectURL(file);
        });

        guardarBtn.style.display = 'inline-block';
        actualizarBtn.style.display = 'none';
    });

    // Guardar cambios
guardarBtn?.addEventListener('click', async () => {
    if (!usuario) return;

    const nombre = obtenerValorInput('nombreInput');
    const apellido = obtenerValorInput('apellidoInput');
    const dui = obtenerValorInput('duiInput');
    const departamento = obtenerValorInput('ubicacionInput');
    const correo = obtenerValorInput('correoInput');
    const telefonoInput = obtenerValorInput('telefonoInput');
    const usuarioNombre = obtenerValorInput('usuarioInput');
    const fotoInput = document.getElementById('fotoInput');
    const foto = fotoInput?.files?.[0];

    // Agregar código de país al teléfono antes de validar
    const telefono = agregarCodigoPais(telefonoInput);

    // Validaciones
    if (!nombre || !apellido || !dui || !departamento || !correo || !telefonoInput || !usuarioNombre) {
        mostrarNotificacion("Todos los campos son obligatorios.", "error");
        return;
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetras.test(nombre) || !soloLetras.test(apellido)) {
        mostrarNotificacion("Nombre y apellido solo deben contener letras.", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarNotificacion("Correo no válido.", "error");
        return;
    }

    // Validar que el teléfono (sin código) tenga 8 dígitos
    const telefonoLimpio = telefonoInput.replace(/\D/g, '');
    if (telefonoLimpio.length !== 8) {
        mostrarNotificacion("El teléfono debe tener 8 dígitos (sin el código 503).", "error");
        return;
    }

    try {
        let fotoURL = usuario.fotoPerfil || usuario.fotoperfil || null;
        if (foto) fotoURL = await subirFotoUsuario(foto);

        const usuarioDTO = {
            idusuario: usuario.idusuario,
            iddescripcion: usuario.iddescripcion,
            usuario: usuarioNombre,
            contrasenia: usuario.contrasenia || '123456Aa!',
            estado: usuario.estado !== undefined ? usuario.estado : true,
            nombre,
            apellido,
            dui,
            correo,
            telefono: telefono, // Usamos el teléfono con código de país
            direccion: obtenerValorInput('direccionInput') || usuario.direccion,
            fechadeNacimiento: formatearFechaISO(obtenerValorInput('nacimientoInput')) || formatearFechaISO(usuario.fechadeNacimiento),
            idubicacion: departamento,
            fotoPerfil: fotoURL,
            IDRol: usuario.IDRol,
            estadoD: usuario.estadoD !== undefined ? usuario.estadoD : true,
            fechadecreacion: usuario.fechadecreacion || formatearFechaISO(new Date().toISOString())
        };

        // Detectar cambio en el nombre de usuario
        const cambioUsuario = usuarioNombre !== usuario.usuario;

        if (cambioUsuario) {
            const confirmar = await mostrarModalConfirm("Has cambiado tu nombre de usuario. Si continúas, se cerrará la sesión y deberás iniciar de nuevo. ¿Deseas continuar?");
            
          if (!confirmar) {
    // Canceló → recargar datos originales desde la base
    usuario = await obtenerUsuarioPorId(usuario.idusuario);
    cargarPerfil();

    // Restaurar visibilidad de botones
    guardarBtn.style.display = 'none';
    actualizarBtn.style.display = 'inline-block';

    mostrarNotificacion("Se canceló el cambio de usuario.", "exito");
    return;
}
        }

        // PUT
        const actualizado = await actualizarUsuarioCompleto(usuario.idusuario || usuario.IDUsuario, usuarioDTO);
        localStorage.setItem('usuario', JSON.stringify(actualizado));

        if (cambioUsuario) {
            // Si cambió el username → cerrar sesión
            localStorage.removeItem('usuario');
            mostrarNotificacion("Usuario actualizado. Debes volver a iniciar sesión.", "exito");
            setTimeout(() => window.location.href = "index.html", 1500);
        } else {
            // Si no cambió → actualizar normal
            usuario = actualizado;
            cargarPerfil();
            guardarBtn.style.display = 'none';
            actualizarBtn.style.display = 'inline-block';
            mostrarNotificacion("Usuario correctamente modificado.", "exito");
        }

    } catch (error) {
        console.error(error);
        mostrarNotificacion("Error al actualizar perfil.", "error");
    }
});



    // Historial
    historialBtn?.addEventListener('click', () => {
        
        
        console.log(usuario.idusuario); // debería mostrar 141
        mostrarNotificacion('Cargando Historial', "exito");
        
        setTimeout(() => window.location.href = `Historial.html?id=${usuario.idusuario}`, 1500);
    });

    // Cerrar sesión
   cerrarSesionBtn?.addEventListener('click', async () => 
    {
         mostrarNotificacion('Cerrando Secion', "exito");
        
        setTimeout(() =>   cerrarSesion(), /*pasa por SessionController*/ 1500);
   
  });

// Eliminar / desactivar cuenta
eliminarCuentaBtn?.addEventListener('click', () => {

    confirmacionDesactivar.style.display = "block";
});

btnCancelar?.addEventListener('click', () => {
    confirmacionDesactivar.style.display = "none";
});

btnConfirmar?.addEventListener('click', async () => {

    
    if (!usuario) {

        return;
    }

    try {

        
        // Asegúrate de importar desactivarCuenta al inicio del archivo
        await desactivarCuenta(usuario.idusuario || usuario.IDUsuario);
        
        localStorage.removeItem('usuario');
        mostrarNotificacion("Cuenta e inmuebles desactivados correctamente.", "exito");
        confirmacionDesactivar.style.display = "none";
        setTimeout(() =>   cerrarSesion(), /*pasa por SessionController*/ 1500);
        setTimeout(() => window.location.href = "index.html", 1500);
    } catch (error) {

        mostrarNotificacion("Error al desactivar cuenta.", "error");
    }
});

});