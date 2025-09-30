const API_PIN = "https://arqosapi-9796070a345d.herokuapp.com/Pin/validar"; 
// Validacion del pin
export async function validarPin(email, pin) {
    const res = await fetch(`${API_PIN}?email=${email}&pin=${pin}`, {
        method: 'POST',
        credentials: 'include'
    });

    //Solo devuelve true o false pq solo verifica el pin
    if (!res.ok) 
    {
        throw new Error("Error al conectar con el servidor");
    }
    return res.json();
    
}