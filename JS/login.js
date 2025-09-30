function Loguear(e) {
    e.preventDefault();

    let user = document.getElementById("Usuario").value;
    let pass = document.getElementById("Contraseña").value;

    if (user === "" || pass === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, complete todos los campos'
        });
    } else if (user === "isaacramos" && pass === "123456789") {
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Inicio de sesión exitoso',
            showConfirmButton: false,
            timer: 1500
        });

        document.getElementById("body").classList.add("fade-out");

        setTimeout(() => {
            window.location.href = "menu_casa.html";
        }, 1500); // Coincide con el tiempo del alert
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Usuario o contraseña incorrectos'
        });
    }
}
