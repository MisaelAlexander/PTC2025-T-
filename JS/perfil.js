let isEditing = false;

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        }

        document.getElementById('edit-btn').addEventListener('click', function() {
            const button = this;
            const buttonText = document.getElementById('edit-text');
            const buttonIcon = button.querySelector('i');
            
            if (!isEditing) {
                // Activar modo edición
                isEditing = true;
                button.classList.add('saving');
                buttonText.textContent = 'Guardar Cambios';
                buttonIcon.className = 'fas fa-save';
                
                // Mostrar todos los inputs
                document.querySelectorAll('.field-value').forEach(field => {
                    const display = field.querySelector('.field-display');
                    const input = field.querySelector('.field-input');
                    
                    if (display && input) {
                        display.style.display = 'none';
                        input.style.display = 'block';
                        input.focus();
                        field.classList.add('editing');
                    }
                });
                
            } else {
                // Guardar cambios
                isEditing = false;
                button.classList.remove('saving');
                buttonText.textContent = 'Editar Perfil';
                buttonIcon.className = 'fas fa-edit';
                
                // Ocultar todos los inputs y mostrar valores
                document.querySelectorAll('.field-value').forEach(field => {
                    const display = field.querySelector('.field-display');
                    const input = field.querySelector('.field-input');
                    
                    if (display && input) {
                        // Actualizar el valor mostrado
                        if (input.tagName === 'SELECT') {
                            display.textContent = input.options[input.selectedIndex].text;
                        } else {
                            display.textContent = input.value;
                        }
                        
                        display.style.display = 'block';
                        input.style.display = 'none';
                        field.classList.remove('editing');
                    }
                });
                
                // Mostrar notificación
                showNotification();
            }
        });

        function showNotification() {
            const notification = document.getElementById('notification');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Cerrar sidebar al hacer clic fuera en dispositivos móviles
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    