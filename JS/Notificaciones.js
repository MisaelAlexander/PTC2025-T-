
        // Toggle sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        }

        // Mobile menu toggle
        document.getElementById('mobileMenuBtn').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('mobile-open');
        });

        // Filtros de notificaciones
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase activo de todos los botones
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
                
                // Agregar clase activo al botón clickeado
                this.classList.add('activo');
                
                // Obtener el filtro seleccionado
                const filtro = this.dataset.filter;
                
                // Mostrar/ocultar notificaciones según el filtro
                document.querySelectorAll('.notificacion').forEach(notif => {
                    if (filtro === 'todas') {
                        notif.style.display = 'flex';
                    } else if (filtro === 'no-leidas') {
                        notif.style.display = notif.classList.contains('no-leida') ? 'flex' : 'none';
                    } else {
                        const tipo = notif.dataset.tipo;
                        notif.style.display = (filtro === 'importantes' && (tipo === 'seguridad' || tipo === 'visita')) ||
                                           (filtro === 'sistema' && tipo === 'sistema') ? 'flex' : 'none';
                    }
                });
            });
        });

        // Marcar como leída
        document.querySelectorAll('.btn-marcar-leida').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificacion = this.closest('.notificacion');
                notificacion.classList.remove('no-leida');
                this.remove();
            });
        });

        // Eliminar notificación
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificacion = this.closest('.notificacion');
                notificacion.style.animation = 'fadeOutUp 0.3s ease-out forwards';
                setTimeout(() => {
                    notificacion.remove();
                }, 300);
            });
        });

        // Cerrar sidebar en móvil al hacer click fuera
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const mobileBtn = document.getElementById('mobileMenuBtn');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !mobileBtn.contains(e.target) && 
                sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        });

        // Animación adicional para fadeOut
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOutUp {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);