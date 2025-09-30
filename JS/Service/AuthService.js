// Service/UsuarioDService.js
const API_BASE = 'https://arqosapi-9796070a345d.herokuapp.com/Usuario';


// Función para hacer login
export async function login(usuario, contrasena) {
    try {
       
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ usuario, contrasena })
        });
        if (!response.ok) throw new Error(await response.text().catch(() => "")); // lanza error si falla
  return true; // devuelve true en caso de éxito

    } catch (error) {
        console.error('Error en loginService:', error);
        throw error;
    }
}


// Funcion me etadoa ctual de autenticacion
export async function me() 
{
    try 
    {
        // Mandamos el /me con las cookies para que nos de losd atos que especificamos
    const response = await fetch(`${API_BASE}/me`, {credentials: 'include'});
    //Si devuelce ok devolcemos el json si no retornamos authenticated:false
    //En cortas palabras si da 200 peude usar el sistema y si da otra respuesta no(400,500)
    return response.ok ? response.json(): { authenticated: false};
    }
    catch (error) {
        console.error('Error en me:', error);
        throw error;
    }    
}

//Funcion de logout
export async function logout() 
{
    try
    {
      const r = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include", // necesario para que el backend identifique la sesión
    });
    return r.ok; // true si el logout fue exitoso
    }
    catch
    {
        return false; // false en caso de error de red u otro fallo
    }
}