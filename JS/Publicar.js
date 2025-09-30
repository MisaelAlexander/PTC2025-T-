    // Variables globales para almacenar archivos
        let selectedImages = [];
        let selectedVideos = [];

        // Funciones del sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        }

        function toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.overlay');
            
            sidebar.classList.add('mobile-active');
            overlay.classList.add('active');
        }

        function closeMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.overlay');
            
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }

        // Funciones para cambiar entre tabs de multimedia
        document.addEventListener('DOMContentLoaded', function() {
            const mediaTabs = document.querySelectorAll('.media-tab');
            const uploadContainers = document.querySelectorAll('.upload-container');
            const mediaPreviews = document.querySelectorAll('.media-preview');

            mediaTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const type = this.dataset.type;
                    
                    // Remover clase active de todos los tabs
                    mediaTabs.forEach(t => t.classList.remove('active'));
                    
                    // Agregar clase active al tab clickeado
                    this.classList.add('active');
                    
                    // Mostrar/ocultar containers de upload
                    uploadContainers.forEach(container => {
                        if (container.id === type + '-upload') {
                            container.style.display = 'flex';
                        } else {
                            container.style.display = 'none';
                        }
                    });
                    
                    // Mostrar/ocultar previews
                    mediaPreviews.forEach(preview => {
                        if (preview.id === type + '-preview') {
                            preview.classList.add('active');
                        } else {
                            preview.classList.remove('active');
                        }
                    });
                });
            });

            // Configurar drag and drop para imágenes
            setupDragAndDrop('imagesUploadZone', 'imagesInput');
            setupDragAndDrop('videosUploadZone', 'videosInput');

            // Configurar change events para los inputs
            document.getElementById('imagesInput').addEventListener('change', function(e) {
                handleFileSelection(e, 'images');
            });

            document.getElementById('videosInput').addEventListener('change', function(e) {
                handleFileSelection(e, 'videos');
            });
        });

        // Función para configurar drag and drop
        function setupDragAndDrop(zoneId, inputId) {
            const zone = document.getElementById(zoneId);
            const input = document.getElementById(inputId);

            zone.addEventListener('click', () => input.click());
            
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                const mediaType = zoneId.includes('images') ? 'images' : 'videos';
                
                // Filtrar archivos según el tipo
                const filteredFiles = filterFilesByType(files, mediaType);
                
                if (filteredFiles.length > 0) {
                    // Simular selección de archivos
                    const dt = new DataTransfer();
                    filteredFiles.forEach(file => dt.items.add(file));
                    input.files = dt.files;
                    
                    // Procesar archivos
                    handleFileSelection({target: {files: filteredFiles}}, mediaType);
                }
            });
        }

        // Función para filtrar archivos por tipo
        function filterFilesByType(files, type) {
            if (type === 'images') {
                return files.filter(file => file.type.startsWith('image/'));
            } else if (type === 'videos') {
                return files.filter(file => file.type.startsWith('video/'));
            }
            return files;
        }

        // Función para manejar la selección de archivos
        function handleFileSelection(event, type) {
            const files = Array.from(event.target.files);
            
            if (type === 'images') {
                selectedImages = [...selectedImages, ...files];
                renderImagePreviews();
            } else if (type === 'videos') {
                selectedVideos = [...selectedVideos, ...files];
                renderVideoPreviews();
            }
            
            updateUploadZoneStatus(type);
        }

        // Función para renderizar previews de imágenes
        function renderImagePreviews() {
            const grid = document.getElementById('imagesPreviewGrid');
            grid.innerHTML = '';
            
            selectedImages.forEach((file, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewItem.innerHTML = `
                        <button type="button" class="remove-btn" onclick="removeFile('images', ${index})">
                            <i class="fas fa-times"></i>
                        </button>
                        <img src="${e.target.result}" alt="${file.name}" class="preview-content">
                        <div class="preview-info">
                            <div class="file-name" title="${file.name}">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
                
                grid.appendChild(previewItem);
            });
        }

        // Función para renderizar previews de videos
        function renderVideoPreviews() {
            const grid = document.getElementById('videosPreviewGrid');
            grid.innerHTML = '';
            
            selectedVideos.forEach((file, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewItem.innerHTML = `
                        <button type="button" class="remove-btn" onclick="removeFile('videos', ${index})">
                            <i class="fas fa-times"></i>
                        </button>
                        <video src="${e.target.result}" class="preview-content" controls muted preload="metadata">
                            Tu navegador no soporta el elemento video.
                        </video>
                        <div class="preview-info">
                            <div class="file-name" title="${file.name}">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
                
                grid.appendChild(previewItem);
            });
        }

        // Función para remover archivos
        function removeFile(type, index) {
            if (type === 'images') {
                selectedImages.splice(index, 1);
                renderImagePreviews();
                updateUploadZoneStatus('images');
            } else if (type === 'videos') {
                selectedVideos.splice(index, 1);
                renderVideoPreviews();
                updateUploadZoneStatus('videos');
            }
        }

        // Función para actualizar el estado de las zonas de upload
        function updateUploadZoneStatus(type) {
            const zone = document.getElementById(type + 'UploadZone');
            const hasFiles = (type === 'images' && selectedImages.length > 0) || 
                            (type === 'videos' && selectedVideos.length > 0);
            
            if (hasFiles) {
                zone.classList.add('has-files');
                const icon = zone.querySelector('.upload-icon i');
                const title = zone.querySelector('h4');
                
                if (type === 'images') {
                    icon.className = 'fas fa-check-circle';
                    title.textContent = `${selectedImages.length} imagen(es) seleccionada(s)`;
                } else {
                    icon.className = 'fas fa-check-circle';
                    title.textContent = `${selectedVideos.length} video(s) seleccionado(s)`;
                }
            } else {
                zone.classList.remove('has-files');
                const icon = zone.querySelector('.upload-icon i');
                const title = zone.querySelector('h4');
                
                if (type === 'images') {
                    icon.className = 'fas fa-images';
                    title.textContent = 'Subir Imágenes';
                } else {
                    icon.className = 'fas fa-video';
                    title.textContent = 'Subir Videos';
                }
            }
        }

        // Función para formatear el tamaño del archivo
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Función para validar archivos antes del envío
        function validateFiles() {
            // Validar tamaños máximos
            const maxImageSize = 10 * 1024 * 1024; // 10MB
            const maxVideoSize = 50 * 1024 * 1024; // 50MB
            
            for (let image of selectedImages) {
                if (image.size > maxImageSize) {
                    alert(`La imagen "${image.name}" excede el tamaño máximo de 10MB.`);
                    return false;
                }
            }
            
            for (let video of selectedVideos) {
                if (video.size > maxVideoSize) {
                    alert(`El video "${video.name}" excede el tamaño máximo de 50MB.`);
                    return false;
                }
            }
            
            return true;
        }

        // Interceptar el envío del formulario
        document.querySelector('.property-form').addEventListener('submit', function(e) {
            if (!validateFiles()) {
                e.preventDefault();
                return false;
            }
            
            // Aquí puedes agregar lógica adicional para el envío
            console.log('Formulario enviado con:', {
                images: selectedImages,
                videos: selectedVideos
            });
        });
    