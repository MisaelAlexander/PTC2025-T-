const API_USUARIO = 'https://arqosapi-9796070a345d.herokuapp.com/Usuario';


export async function enviarPin(usuarioOCorreo) 
{
    const res = await fetch(`${API_USUARIO}/Recuperar?usuarioOCorreo=${encodeURIComponent(usuarioOCorreo)}`, {
        method: 'POST',
        credentials: 'include'
    });
    if (!res.ok) {
        if (res.status === 404) return { exito: false, mensaje: "Usuario no encontrado" };
        throw new Error("Error al conectar con el servidor");
    }
    return res.json();
}

export async function restablecerContrasena(correo, pin, nuevaContrasena)
 {
    const res = await fetch(`${API_USUARIO}/Restablecer?correo=${encodeURIComponent(correo)}&pin=${encodeURIComponent(pin)}&nuevaContrasena=${encodeURIComponent(nuevaContrasena)}`, {
        method: 'POST',
        credentials: 'include'
    });
    if (!res.ok) {
        throw new Error("Error al conectar con el servidor");
    }
    return res.json();
}

export async function buscarPorCorreo(correo) 
{
    const res = await fetch(`${API_USUARIO}/BuscarPorCorreo?correo=${encodeURIComponent(correo)}`,{credentials: 'include'});
    if (!res.ok) {
        if (res.status === 404) return { exito: false, mensaje: "Usuario no encontrado" };
        throw new Error("Error al conectar con el servidor");
    }
    return res.json();
}

export async function buscarPorUsuario(nombre)
 {
    const res = await fetch(`${API_USUARIO}/BuscarPorUsuario?usuario=${encodeURIComponent(nombre)}`,{credentials: 'include'});
    if (!res.ok) {
        if (res.status === 404) return { exito: false, mensaje: "Usuario no encontrado" };
        throw new Error("Error al conectar con el servidor");
    }
    return res.json();
}

