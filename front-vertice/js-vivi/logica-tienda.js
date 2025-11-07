document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // CONFIGURACIÓN Y VARIABLES GLOBALES
    // ========================================
    const API_URL = 'http://localhost:3000/api';
    
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const cartCountSpan = document.getElementById('cart-count');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-btn');

    // Elementos para el formulario de nuevo producto
    const formNuevoProducto = document.getElementById('form-nuevo-producto');
    const fileUploadBox = document.getElementById('file-upload-box');
    const fileInput = document.getElementById('imagen');

    let productos = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ========================================
    // FUNCIONES DE NOTIFICACIONES
    // ========================================
    function mostrarMensajeExito(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4cd309;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        mensajeDiv.textContent = '✓ ' + mensaje;
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => mensajeDiv.remove(), 300);
        }, 3000);
    }

    function mostrarMensajeError(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        mensajeDiv.textContent = '✗ ' + mensaje;
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => mensajeDiv.remove(), 300);
        }, 4000);
    }

    function mostrarMensajeInfo(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #17a2b8;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        mensajeDiv.textContent = 'ℹ ' + mensaje;
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => mensajeDiv.remove(), 300);
        }, 3000);
    }

    function mostrarMensajeAdvertencia(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffc107;
            color: #333;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        mensajeDiv.textContent = '⚠ ' + mensaje;
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => mensajeDiv.remove(), 300);
        }, 3500);
    }

    // ========================================
    // FUNCIONES DE API - PRODUCTOS
    // ========================================
    async function obtenerProductos() {
        try {
            const response = await fetch(`${API_URL}/productos`);
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            const data = await response.json();
            // Mapea los nombres de las propiedades del backend a los del frontend
            return data.map(p => ({
                id: p.id,
                nombre: p.nombre_producto,
                descripcion: p.descripcion,
                precioOriginal: p.precio_original,
                precioOferta: p.precio_descuento,
                stock: p.cantidad_disponible,
                imagen: p.foto_url ? `${API_URL.replace('/api', '')}/uploads/${p.foto_url}` : 'assets/imgs/default.jpg',
                categoria: p.categoria
            }));
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function crearProducto(formData) {
        try {
            const token = localStorage.getItem('token');
            console.log('Token en localStorage:', token ? 'Existe' : 'No existe');
            
            if (!token) {
                throw new Error('No estás autenticado. Por favor inicia sesión.');
            }

            console.log('Haciendo fetch a:', `${API_URL}/productos`);
            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('Respuesta del servidor - Status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Respuesta exitosa:', result);
            return result;
        } catch (error) {
            console.error('Error en crearProducto:', error);
            throw error;
        }
    }

    // ========================================
    // FUNCIONES DE UTILIDAD - CARRITO
    // ========================================
    function actualizarContadorCarrito() {
        if (cartCountSpan) {
            cartCountSpan.textContent = cart.length;
        }
    }

    function guardarCarrito() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // ========================================
    // LÓGICA DE VISUALIZACIÓN Y FILTRADO
    // ========================================
    function mostrarProductos(productosAMostrar) {
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        if (productosAMostrar.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; color: #888;">No se encontraron productos.</p>';
            return;
        }

        productosAMostrar.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = producto.id;

            const precioDisplay = producto.precioOferta ?
                `<span class="product-price">$${producto.precioOferta}</span><span class="original-price">$${producto.precioOriginal}</span>` :
                `<span class="product-price">$${producto.precioOriginal}</span>`;

            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="card-content">
                    <h3>${producto.nombre}</h3>
                    <p class="product-description">${producto.descripcion || ''}</p>
                    <div class="price-info">
                        ${precioDisplay}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-id="${producto.id}">Agregar al carrito</button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    function aplicarFiltrosYOrden() {
        if (!productGrid || !searchInput || !sortSelect || !categorySelect) return;

        let productosFiltrados = [...productos];
        const searchTerm = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;
        const categoryValue = categorySelect.value;

        // Filtro por búsqueda
        if (searchTerm) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) || 
                (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro por categoría
        if (categoryValue !== 'todas') {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoryValue);
        }

        // Ordenamiento
        switch (sortValue) {
            case 'a-z':
                productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'z-a':
                productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            case 'menor-precio':
                productosFiltrados.sort((a, b) => (a.precioOferta || a.precioOriginal) - (b.precioOferta || b.precioOriginal));
                break;
            case 'mayor-precio':
                productosFiltrados.sort((a, b) => (b.precioOferta || b.precioOriginal) - (a.precioOferta || a.precioOriginal));
                break;
        }

        mostrarProductos(productosFiltrados);
    }

    // ========================================
    // LÓGICA DEL CARRITO
    // ========================================
    function agregarAlCarrito(idProducto) {
        const producto = productos.find(p => p.id == idProducto);
        if (producto) {
            cart.push(producto);
            guardarCarrito();
            actualizarContadorCarrito();
            mostrarMensajeExito(`"${producto.nombre}" ha sido agregado al carrito`);
        }
    }

    // ========================================
    // LÓGICA DEL MODAL
    // ========================================
    function abrirModal(idProducto) {
        if (!productModal) return;

        const producto = productos.find(p => p.id == idProducto);
        if (producto) {
            const modalBody = document.querySelector('.modal-body');
            const precioDisplayModal = producto.precioOferta ?
                `<span class="price">$${producto.precioOferta}</span><span class="old-price">$${producto.precioOriginal}</span>` :
                `<span class="price">$${producto.precioOriginal}</span>`;

            modalBody.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="product-details">
                    <div>
                        <h2>${producto.nombre}</h2>
                        <p class="description">${producto.descripcion || 'Sin descripción.'}</p>
                        <p><strong>Stock:</strong> ${producto.stock}</p>
                        <p><strong>Categoría:</strong> ${producto.categoria}</p>
                    </div>
                    <div>
                        <div class="price-info">${precioDisplayModal}</div>
                        <button class="modal-add-to-cart" data-id="${producto.id}">Agregar al carrito</button>
                    </div>
                </div>
            `;
            productModal.style.display = 'block';
        }
    }

    function cerrarModal() {
        if (productModal) {
            productModal.style.display = 'none';
        }
    }

    // ========================================
    // LÓGICA DE FORMULARIO NUEVO PRODUCTO
    // ========================================
    function inicializarFormularioProducto() {
        if (!formNuevoProducto) return;

        // Preview de imagen
        if (fileUploadBox && fileInput) {
            fileUploadBox.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    const file = this.files[0];
                    
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            fileUploadBox.innerHTML = `
                                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                                <span style="display: block; margin-top: 10px; font-size: 14px; color: #666;">${file.name}</span>
                            `;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        mostrarMensajeAdvertencia('Por favor selecciona un archivo de imagen válido');
                        this.value = '';
                    }
                } else {
                    fileUploadBox.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span id="file-name">Ningún archivo seleccionado</span>
                    `;
                }
            });
        }

        // IMPORTANTE: Prevenir submit del formulario
        formNuevoProducto.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log(' Submit del formulario bloqueado');
            return false;
        });

        // Manejar el click del botón directamente
        const submitBtn = document.getElementById('guardar-producto-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(' Botón clickeado - Iniciando proceso de guardado');

                // Deshabilitar el botón para evitar doble submit
                submitBtn.disabled = true;
                submitBtn.textContent = 'Guardando...';

                await guardarProducto(submitBtn);
            });
        }
    }

    // Función separada para guardar el producto
    async function guardarProducto(submitBtn) {
        const nombre = document.getElementById('nombre')?.value;
        const descripcion = document.getElementById('descripcion')?.value;
        const stock = document.getElementById('stock')?.value;
        const precioOriginal = document.getElementById('precio-original')?.value;
        const precioOferta = document.getElementById('precio_descuento')?.value;
        const categoria = document.getElementById('categoria-input')?.value;
        const tipoProducto = document.getElementById('tipo-producto')?.value;
        const imagenFile = fileInput?.files[0];

        console.log('Datos del formulario:', {
            nombre, descripcion, stock, precioOriginal, precioOferta, categoria, tipoProducto,
            imagen: imagenFile ? imagenFile.name : 'Sin imagen'
        });

        // Validar campos obligatorios
        if (!nombre || !stock || !precioOriginal || !precioOferta) {
            console.log('Validación fallida - Campos faltantes');
            mostrarMensajeAdvertencia('Por favor completa todos los campos obligatorios (Nombre, Stock, Precio Original y Precio con Descuento)');
            
            // Re-habilitar el botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Producto';
            }
            return;
        }

        console.log(' Validación exitosa');

        // Crear FormData
        const formData = new FormData();
        formData.append('nombre_producto', nombre);
        formData.append('descripcion', descripcion || '');
        formData.append('cantidad_disponible', stock);
        formData.append('precio_original', precioOriginal);
        formData.append('precio_descuento', precioOferta);
        formData.append('categoria', categoria || '');
        formData.append('tipo_producto', tipoProducto || '');
        if (imagenFile) formData.append('foto_url', imagenFile);

        console.log(' FormData creado');

        try {
            console.log('Enviando producto al backend...');
            const resultado = await crearProducto(formData);
            console.log('Producto creado exitosamente:', resultado);
            // Guardar flag en sessionStorage para mostrar mensaje en la otra página
            const payloadMensaje = {
                ok: true,
                tipo: 'exito',
                texto: '¡Producto guardado correctamente!',
                nombre: nombre,
                timestamp: Date.now()
            };
            try {
                sessionStorage.setItem('productoCreado', JSON.stringify(payloadMensaje));
            } catch (eStore) {
                console.warn('⚠ No se pudo guardar productoCreado en sessionStorage:', eStore);
            }

            console.log('➡ Redirigiendo inmediatamente a /front-vertice/comercio.producto.html con flag productoCreado');
            window.location.href = window.location.origin + '/front-vertice/comercio.producto.html';
            
        } catch (error) {
            console.error(' Error completo:', error);
            
            // Re-habilitar el botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Producto';
            }
            
            if (error.message.includes('autenticado')) {
                mostrarMensajeError('No estás autenticado. Redirigiendo al login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                mostrarMensajeError(`Error al guardar el producto: ${error.message}`);
            }
        }
    }

    // ========================================
    // INICIALIZACIÓN Y EVENTOS
    // ========================================
    async function inicializarApp() {
        // Inicializar formulario de nuevo producto si existe
        inicializarFormularioProducto();

        // Inicializar lista de productos si existe el grid
        if (productGrid) {
            productos = await obtenerProductos();
            aplicarFiltrosYOrden();
            actualizarContadorCarrito();

            // Eventos para el buscador, filtros y ordenamiento
            if (searchInput) searchInput.addEventListener('input', aplicarFiltrosYOrden);
            if (sortSelect) sortSelect.addEventListener('change', aplicarFiltrosYOrden);
            if (categorySelect) categorySelect.addEventListener('change', aplicarFiltrosYOrden);

            // Eventos de click en el grid de productos
            productGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                const addToCartBtn = e.target.closest('.add-to-cart-btn');

                if (addToCartBtn) {
                    e.stopPropagation();
                    const id = addToCartBtn.dataset.id;
                    agregarAlCarrito(id);
                } else if (card) {
                    const id = card.dataset.id;
                    abrirModal(id);
                }
            });
        }

        // Eventos para el modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', cerrarModal);
        }
        if (productModal) {
            window.addEventListener('click', (e) => {
                if (e.target == productModal) {
                    cerrarModal();
                }
            });
        }
    }

    // Llamada para iniciar la aplicación
    inicializarApp();

});