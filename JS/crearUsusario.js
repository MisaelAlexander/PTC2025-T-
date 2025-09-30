 // Función para previsualizar la foto
        function previewPhoto(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoPreview = document.querySelector('.photo-preview');
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Foto de perfil">`;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Formateo automático del DUI
        document.getElementById('dui').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Solo números
            if (value.length > 8) {
                value = value.substring(0, 8) + '-' + value.substring(8, 9);
            }
            e.target.value = value;
        });

        // Validación de fecha de nacimiento (mayor de edad)
        document.getElementById('fechaNacimiento').addEventListener('change', function(e) {
            const today = new Date();
            const birthDate = new Date(e.target.value);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 18) {
                showMessage('Debes ser mayor de 18 años para crear una cuenta', 'error');
                e.target.value = '';
            }
        });

        // Función para mostrar mensajes
        function showMessage(message, type) {
            const messageContainer = document.getElementById('messageContainer');
            messageContainer.textContent = message;
            messageContainer.className = `message ${type}`;
            messageContainer.style.display = 'block';
            
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }

        // Manejo del formulario
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const submitText = document.getElementById('submitText');
            
            // Mostrar loading
            loadingSpinner.style.display = 'inline-block';
            submitText.textContent = 'Creando cuenta...';
            submitBtn.disabled = true;
            
            // Simular procesamiento
            setTimeout(() => {
                // Resetear botón
                loadingSpinner.style.display = 'none';
                submitText.textContent = 'Crear Cuenta';
                submitBtn.disabled = false;
                
                // Mostrar mensaje de éxito
                showMessage('¡Cuenta creada exitosamente!', 'success');
                
                // Opcional: resetear formulario
                // this.reset();
            }, 2000);
        });

        // Validación en tiempo real del nombre de usuario
        document.getElementById('usuario').addEventListener('input', function(e) {
            const value = e.target.value;
            if (value.length > 0 && value.length < 3) {
                e.target.setCustomValidity('El nombre de usuario debe tener al menos 3 caracteres');
            } else {
                e.target.setCustomValidity('');
            }
        });

        // Validación de contraseña en tiempo real
        document.getElementById('password').addEventListener('input', function(e) {
            const password = e.target.value;
            const requirements = document.getElementById('passwordRequirements');
            
            // Mostrar/ocultar requisitos
            if (password.length > 0) {
                requirements.classList.add('show');
                validatePasswordStrength(password);
            } else {
                requirements.classList.remove('show');
            }
        });

        // Validación de confirmación de contraseña
        document.getElementById('confirmPassword').addEventListener('input', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = e.target.value;
            const matchDiv = document.getElementById('passwordMatch');
            
            if (confirmPassword.length > 0) {
                if (password === confirmPassword) {
                    matchDiv.textContent = '✓ Las contraseñas coinciden';
                    matchDiv.className = 'password-match valid';
                    e.target.setCustomValidity('');
                } else {
                    matchDiv.textContent = '✗ Las contraseñas no coinciden';
                    matchDiv.className = 'password-match invalid';
                    e.target.setCustomValidity('Las contraseñas no coinciden');
                }
            } else {
                matchDiv.textContent = '';
                matchDiv.className = 'password-match';
            }
        });

        // Función para validar fortaleza de contraseña
        function validatePasswordStrength(password) {
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            // Actualizar cada requisito
            updateRequirement('lengthReq', requirements.length, 'Mínimo 8 caracteres');
            updateRequirement('uppercaseReq', requirements.uppercase, 'Una letra mayúscula');
            updateRequirement('lowercaseReq', requirements.lowercase, 'Una letra minúscula');
            updateRequirement('numberReq', requirements.number, 'Un número');
            updateRequirement('specialReq', requirements.special, 'Un carácter especial (!@#$%^&*)');

            // Validar el campo de contraseña
            const passwordField = document.getElementById('password');
            const allValid = Object.values(requirements).every(req => req);
            
            if (allValid) {
                passwordField.setCustomValidity('');
            } else {
                passwordField.setCustomValidity('La contraseña no cumple con todos los requisitos');
            }

            // Calcular y mostrar fortaleza
            showPasswordStrength(password, requirements);
        }

        // Función para actualizar cada requisito visual
        function updateRequirement(elementId, isValid, text) {
            const element = document.getElementById(elementId);
            if (isValid) {
                element.textContent = '✓ ' + text;
                element.className = 'requirement valid';
            } else {
                element.textContent = '✗ ' + text;
                element.className = 'requirement invalid';
            }
        }

        // Función para mostrar la fortaleza de la contraseña
        function showPasswordStrength(password, requirements) {
            // Crear barra de fortaleza si no existe
            let strengthBar = document.querySelector('.password-strength');
            if (!strengthBar) {
                strengthBar = document.createElement('div');
                strengthBar.className = 'password-strength';
                strengthBar.innerHTML = '<div class="password-strength-bar"></div>';
                document.getElementById('passwordRequirements').appendChild(strengthBar);
            }

            const bar = strengthBar.querySelector('.password-strength-bar');
            const validCount = Object.values(requirements).filter(req => req).length;
            
            // Resetear clases
            bar.className = 'password-strength-bar';
            
            if (validCount >= 5) {
                bar.classList.add('strength-strong');
            } else if (validCount >= 4) {
                bar.classList.add('strength-good');
            } else if (validCount >= 3) {
                bar.classList.add('strength-fair');
            } else if (validCount >= 1) {
                bar.classList.add('strength-weak');
            }
        }