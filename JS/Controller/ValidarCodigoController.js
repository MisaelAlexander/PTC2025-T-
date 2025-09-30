import { validarPin } from "../Service/ValidarCodigoService.js";


//capturamos el formulario
const form = document.getElementById("code-form");
form.addEventListener("submit",handleSubmit);

// Mostrar notificación
    function mostrarNotificacion(mensaje, tipo = "exito")
     {
        const notificacion = document.getElementById("notificacion");
        const notificacionMensaje = document.getElementById("notificacionMensaje");

        notificacionMensaje.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = "block";

        // Desaparece automáticamente después de 2 segundos
        setTimeout(() => {
            notificacion.style.display = "none";
        }, 2000);
    }

    
    // Manejar inputs (solo números y mover foco)
    //Esto es donde ponemos los datos
    function handleInput(input, index) {
    // Seleccionamos todos los inputs con clase .code-input
    const inputs = document.querySelectorAll(".code-input");

    // Permite solo números
    input.value = input.value.replace(/[^0-9]/g, "");

    // Si se escribe algo, pasar al siguiente input
    if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
}

function handleKeyDown(input, index, event) {
    const inputs = document.querySelectorAll(".code-input");

    // Si se presiona Backspace estando vacío => retroceder
    if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
    }
}

   //  Enviar formulario
   function handleSubmit(event) 
   {
    //Evitamos que se envie vacios
    event.preventDefault(); 

    //seleccionamos a todos los inputs
    // Esto es donde ponemos los datos
    const inputs = document.querySelectorAll(".code-input");
    let codigo = "";
    // Huntamos todos losigitos
    // Recorre todos los inputs y concatena sus valores
    inputs.forEach(input => codigo += input.value);
 
    // Validar que estén todos los dígitos
    if (codigo.trim().length < inputs.length) {
        mostrarNotificacion("Debes ingresar todos los dígitos del código", "error");
        return;
    }

    // Obtenemos el email del sessionStorage
    //Este no lo guardamos en el localStorage porque que seria menos seguro
    //por el cambio de contraseña a un usuario ya creado
    const email = sessionStorage.getItem("correoRecuperacion");
    if (!email) 
    {
        // Si no hay correo, mostramos un mensaje de error
        mostrarNotificacion("No se encontró el correo en la sesión, vuelve a iniciar el proceso.", "error");
        return;
    }

    // Llamamos al servicio para validar el PIN
    validarPin(email, codigo).then((esValido) => {
        if (esValido) {
            mostrarNotificacion(" PIN válido, continúa con el proceso", "exito");
            // Aquí podrías redirigir a otra página si lo deseas
            setTimeout(() => {
                window.location.href = "RecuperarContraseña3.html";
            }, 1500);
        } else {
            mostrarNotificacion("El código es incorrecto o ha expirado", "error");
        }
    });

   }


// Seleccionamos todos los inputs de código
const inputs = document.querySelectorAll(".code-input");

// Asignar listeners a inputs
inputs.forEach((input, index) => {
    input.addEventListener("input", () => handleInput(input, index));
    input.addEventListener("keydown", (event) => handleKeyDown(input, index, event));
});

// Listener al form
form.addEventListener("submit", handleSubmit);

// Tus funciones handleInput, handleKeyDown y handleSubmit quedan igual

