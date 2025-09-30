document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector("form");
    const codeInputs = document.querySelectorAll(".code-input");
    const mensajeExito = document.getElementById("mensajeExito");
    const mensajeError = document.getElementById("mensajeError");

    // Prevenir pegar múltiples dígitos
    codeInputs.forEach(input => {
        input.addEventListener("paste", e => e.preventDefault());
    });

    // Al cargar, enfocar el primer input
    codeInputs[0].focus();

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        let allFilled = true;
        let codigo = "";

        codeInputs.forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
            }
            codigo += input.value;
        });

        if (allFilled && codigo.length === 6) {
            mensajeExito.style.display = "block";
            mensajeExito.textContent = "¡Código aceptado!";
            setTimeout(() => {
                mensajeExito.style.display = "none";
                window.location.href = "RecuperarContraseña3.html";
            }, 1000);
        } else {
            mostrarError("Falta parte del código");
        }
    });

    function mostrarError(mensaje) {
        mensajeError.textContent = mensaje;
        mensajeError.style.display = "block";
        setTimeout(() => {
            mensajeError.style.display = "none";
        }, 4000);
    }

    window.handleInput = function(input, index) {
        const codeInputs = document.querySelectorAll(".code-input");
        if (input.value.length === 1 && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    };

    window.handleKeyDown = function(input, index, event) {
        const codeInputs = document.querySelectorAll(".code-input");

        if (event.key === "Backspace") {
            if (input.value === "" && index > 0) {
                codeInputs[index - 1].focus();
            }
        } else if (/^[0-9]$/.test(event.key)) {
            input.value = ""; // Asegura que se sobrescriba
        }
    };
});
