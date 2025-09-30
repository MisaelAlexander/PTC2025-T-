/*La pongo completa por que este proceso solo tiene un metodo get */
const API_DEP = 'https://arqosapi-9796070a345d.herokuapp.com/Ubicacion/Mostrar';

// Service Rol js
const API_ROL = 'https://arqosapi-9796070a345d.herokuapp.com/Rol/Mostrar';

//Service Subir Foto - MODIFICADO para Cloudinary
const API_FOT = 'https://arqosapi-9796070a345d.herokuapp.com/Imagen/GuardarCarpeta'; // Cambiado el endpoint

//Service Guardar Descripcion
const API_GDES = 'https://arqosapi-9796070a345d.herokuapp.com/Descripcion';

//Esto es por si el usuario no tiene foto
const IMAGEN_POR_DEFECTO = 'img/usuario.png';

// Servicio para subir una foto a Cloudinary - MODIFICADO
export async function subirFotoCloudinary(file) {
    // Si no hay archivo, devolvemos la imagen por defecto
    if (!file) {
        return IMAGEN_POR_DEFECTO; 
    }

    // Si hay archivo, lo subimos a Cloudinary
    const formData = new FormData();
    formData.append("image", file); // Cambiado de "file" a "image" para coincidir con tu controller
    formData.append("folder", "Usuarios"); // Especificamos la carpeta

    try {
        const response = await fetch(API_FOT, {
            method: "POST",
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Error al subir la foto a Cloudinary");
        }

        const data = await response.json();

        // Validar que exista la propiedad url (Cloudinary devuelve "url")
        if (!data.url) throw new Error("La respuesta no contiene la URL de la foto");

        return data.url;
    } catch (error) {
        console.error("Error en subirFotoCloudinary:", error);
        // Si falla la subida, devolvemos la imagen por defecto
        return IMAGEN_POR_DEFECTO; 
    }
}

/*Cargamos Ubicaciones */
export async function obtenerUbicaciones() 
{
    try
    {
        /*Convocamos al direccion */
        const res = await fetch(API_DEP,{credentials: 'include'});
        /*Verificamos existencia*/
        if(!res.ok)
            {
                throw new Error('Error al cargar ubicaciones');   
            } 
        const json = await res.json();
       
        /*Verificamos una respuesta positiva */
        if (json.status && Array.isArray(json.data))
            {
                return json.data;
            }
        else
            {
                throw new Error('Formato de datos inválido');
            }
    }
    catch(err)
    {
        console.error('Error en obtenerUbicaciones:', err);
        return [];
    }
}

/*Cargamos Roles (Sip voy  a meter en su control y service lo que la vista necesite) */
export async function obtenerRoles() {
  try {
    const res = await fetch(API_ROL,{credentials: 'include'});
    if (!res.ok) {
      throw new Error('Error al cargar roles');
    }
    const json = await res.json();
    if (json.status && Array.isArray(json.data)) {
      return json.data;
    } else {
      throw new Error('Formato de datos inválido');
    }
  } catch (err) {
    console.error('Error en obtenerRoles:', err);
    return [];
  }
}

// Servicio para guardar la descripción en la API
export async function guardarDescripcion(data) {
     try {
        const response = await fetch(`${API_GDES}/Guardar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const json = await response.json();

        // Retornamos todo el json (status, message, data)-Esto por ApiResponse
        return json;
    } catch (error) {
        console.error("Error en guardarUsuario:", error);
        throw new Error("Error de conexión con el servidor");
    }
}

export async function checkDui(dui) {
    const res = await fetch(`${API_GDES}/check-dui?dui=${encodeURIComponent(dui)}`,{credentials: 'include'});
    return res.json();
}

export async function checkCorreo(correo) {
    const res = await fetch(`${API_GDES}/check-correo?correo=${encodeURIComponent(correo)}`,{credentials: 'include'});
    return res.json();
}

export async function checkTelefono(telefono) {
    const res = await fetch(`${API_GDES}/check-telefono?telefono=${encodeURIComponent(telefono)}`,{credentials: 'include'});
    return res.json();
}