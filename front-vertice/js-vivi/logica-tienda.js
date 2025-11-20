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
    // Eliminamos la gestión local del carrito - ahora usa CartManager global
    // let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
            
            // El backend devuelve { products: [...], pagination: {...} }
            const productos = data.products || data;
            
            // Filtro defensivo: solo mostrar categorias permitidas
            const permitidas = ['comida-por-caducarse', 'desperfecto-fisico'];
            const visibles = productos.filter(p => permitidas.includes(p.categoria));
            console.log('[TIENDA] Total backend:', productos.length, '| visibles (filtradas):', visibles.length);
            
            // Mapea los nombres de las propiedades del backend a los del frontend
            return visibles.map(p => ({
                id: p.id || p._id,
                nombre: p.nombre_producto,
                descripcion: p.descripcion,
                precioOriginal: p.precio_original,
                precioOferta: p.precio_descuento && p.precio_descuento < p.precio_original ? p.precio_descuento : null,
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
            console.log('🔐 Token en localStorage:', token ? 'Existe ✅' : 'NO EXISTE ❌');
            
            if (!token) {
                throw new Error('No estás autenticado. Por favor inicia sesión.');
            }

            console.log('📤 Haciendo POST a:', `${API_URL}/productos`);
            console.log('📦 FormData entries:');
            for (let pair of formData.entries()) {
                if (pair[0] === 'foto') {
                    console.log(`  ${pair[0]}:`, pair[1].name, `(${pair[1].size} bytes)`);
                } else {
                    console.log(`  ${pair[0]}:`, pair[1]);
                }
            }

            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📥 Respuesta del servidor - Status:', response.status, response.statusText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: 'Error del servidor sin detalles' };
                }
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta exitosa:', result);
            return result;
        } catch (error) {
            console.error('💥 Error en crearProducto:', error.message);
            console.error('Stack:', error.stack);
            throw error;
        }
    }

    // ========================================
    // FUNCIONES DE UTILIDAD - CARRITO
    // ========================================
    // ELIMINADAS - Ahora usa CartManager global
    // function actualizarContadorCarrito() {
    //     if (cartCountSpan) {
    //         cartCountSpan.textContent = cart.length;
    //     }
    // }

    // function guardarCarrito() {
    //     localStorage.setItem('cart', JSON.stringify(cart));
    // }

    // ========================================
    // LÓGICA DE VISUALIZACIÓN Y FILTRADO
    // ========================================
    let mostrandoTodos = false; // Estado para controlar si se muestran todos los productos
    const MAX_PRODUCTOS_INICIAL = 6; // Máximo de productos a mostrar inicialmente

    function mostrarProductos(productosAMostrar, forzarTodos = false) {
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        if (productosAMostrar.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; color: #888;">No se encontraron productos.</p>';
            return;
        }

        // Determinar cuántos productos mostrar
        const productosMostrar = (mostrandoTodos || forzarTodos) ? productosAMostrar : productosAMostrar.slice(0, MAX_PRODUCTOS_INICIAL);

        productosMostrar.forEach(producto => {
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

        // Actualizar visibilidad del botón "Ver más productos"
        actualizarBotonVerMas(productosAMostrar.length);
    }

    function actualizarBotonVerMas(totalProductos) {
        const loadMoreContainer = document.querySelector('.load-more-container');
        if (!loadMoreContainer) return;

        // Si ya se están mostrando todos o hay 6 o menos productos, ocultar el botón
        if (mostrandoTodos || totalProductos <= MAX_PRODUCTOS_INICIAL) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }

    function aplicarFiltrosYOrden(desdeVerMas = false) {
        if (!productGrid || !searchInput || !sortSelect || !categorySelect) return;

        // Si NO viene desde "Ver más", resetear el estado (porque el usuario cambió filtros)
        if (!desdeVerMas && mostrandoTodos) {
            mostrandoTodos = false;
        }

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
            // Usa CartManager global en lugar de array local
            if (window.cartManager) {
                window.cartManager.addItem({
                    id: producto.id || producto._id,
                    nombre_producto: producto.nombre,
                    precio_descuento: producto.precioOferta,
                    precio_original: producto.precioOriginal,
                    imagenes: producto.imagenes || []
                });
            }
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
        console.log('🔧 === INICIALIZANDO FORMULARIO NUEVO PRODUCTO ===');
        
        if (!formNuevoProducto) {
            console.log('ℹ️ No hay formulario de nuevo producto en esta página');
            return;
        }
        
        console.log('✅ Formulario encontrado:', formNuevoProducto.id);

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

        // IMPORTANTE: Prevenir submit del formulario (MÚLTIPLES CAPAS)
        formNuevoProducto.addEventListener('submit', (e) => {
            console.log('🛑 Submit del formulario interceptado');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('✅ Submit del formulario bloqueado correctamente');
            return false;
        }, true); // Capturar en fase de captura
        
        // Segunda capa de prevención
        formNuevoProducto.onsubmit = (e) => {
            console.log('🛑 onsubmit interceptado');
            e.preventDefault();
            return false;
        };

        // Manejar el click del botón directamente
        const submitBtn = document.getElementById('guardar-producto-btn');
        if (submitBtn) {
            console.log('✅ Botón encontrado');
            
            submitBtn.addEventListener('click', async (e) => {
                console.log('🖱️ CLICK EN GUARDAR');
                e.preventDefault();
                e.stopPropagation();

                submitBtn.disabled = true;
                submitBtn.textContent = 'Guardando...';

                try {
                    await guardarProducto(submitBtn);
                } catch (error) {
                    console.error('💥 ERROR:', error);
                    alert('ERROR: ' + error.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Guardar Producto';
                }
            });
        } else {
            console.error('❌ Botón no encontrado');
        }
    }

    // Función separada para guardar el producto
    async function guardarProducto(submitBtn) {
        console.log('🚀 Iniciando guardado...');
        
        const nombre = document.getElementById('nombre')?.value?.trim();
        const descripcion = document.getElementById('descripcion')?.value?.trim();
        const stock = document.getElementById('stock')?.value;
        const precioOriginal = document.getElementById('precio-original')?.value;
        const precioOferta = document.getElementById('precio_descuento')?.value || '0';
        const categoria = document.getElementById('categoria-input')?.value;
        const tipoProducto = document.getElementById('tipo-producto')?.value;
        const imagenFile = fileInput?.files[0];

        console.log('📝 Datos:', { nombre, stock, precioOriginal, categoria });

        // Validación simple
        if (!nombre || !stock) {
            alert('Por favor completa Nombre y Stock');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Producto';
            }
            return;
        }
        
        // Si NO es para-donar, validar precio
        if (categoria !== 'para-donar' && !precioOriginal) {
            alert('El precio es obligatorio para productos que no son donaciones');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Producto';
            }
            return;
        }

        // Crear FormData
        const formData = new FormData();
        formData.append('nombre_producto', nombre);
        formData.append('descripcion', descripcion || '');
        formData.append('cantidad_disponible', stock);
        formData.append('precio_original', categoria === 'para-donar' ? '0' : precioOriginal);
        formData.append('precio_descuento', categoria === 'para-donar' ? '0' : precioOferta);
        formData.append('categoria', categoria || '');
        formData.append('tipo_producto', tipoProducto || '');
        if (imagenFile) formData.append('foto_url', imagenFile);

        console.log('📦 FormData listo');

        try {
            console.log('📤 Enviando...');
            const resultado = await crearProducto(formData);
            console.log('✅ Producto creado:', resultado);
            
            // Guardar en sessionStorage
            sessionStorage.setItem('productoCreado', JSON.stringify({
                ok: true,
                nombre: nombre
            }));
            
            // Redirigir INMEDIATAMENTE
            console.log('➡️ Redirigiendo...');
            window.location.href = './comercio.producto.html';
            return;
            
        } catch (error) {
            console.error('💥 ERROR:', error);
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Producto';
            }
            
            alert('❌ Error al guardar: ' + (error.message || 'Error desconocido'));
            
            // Si es error de autenticación, redirigir al login después de mostrar el mensaje
            if (error.message && error.message.includes('autenticado')) {
                console.log('⚠️ Error de autenticación - redirigiendo al login en 3 segundos...');
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 3000);
            }
            
            // NO redirigir en caso de error para que el usuario vea el mensaje
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
            // actualizarContadorCarrito(); // Ya no se usa - cart-persistence.js lo maneja

            // Eventos para el buscador, filtros y ordenamiento
            if (searchInput) searchInput.addEventListener('input', aplicarFiltrosYOrden);
            if (sortSelect) sortSelect.addEventListener('change', aplicarFiltrosYOrden);
            if (categorySelect) categorySelect.addEventListener('change', aplicarFiltrosYOrden);

            // Evento para el botón "Ver más productos"
            const verMasBtn = document.getElementById('ver-mas-btn');
            if (verMasBtn) {
                verMasBtn.addEventListener('click', () => {
                    mostrandoTodos = true;
                    aplicarFiltrosYOrden(true); // Pasar true para indicar que viene desde "Ver más"
                    mostrarMensajeInfo('Mostrando todos los productos disponibles');
                });
            }

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


//gestion de PEDIDOS Y ESTADISTICAS
document.addEventListener('DOMContentLoaded', () => {

    const tablaPedidos = document.getElementById('pedidos-tabla-body');

    if (tablaPedidos) {
        tablaPedidos.addEventListener('click', async (e) => {
            
            // Busca el botón más cercano que fue clickeado
            const botonCompletar = e.target.closest('.btn-completar');
            const botonCancelar = e.target.closest('.btn-cancelar');

            if (botonCompletar) {
                const pedidoId = botonCompletar.dataset.id;
                // Llama a la función para completar, pasándole el ID
                await manejarActualizacionPedido(pedidoId, 'completar');
            }

            if (botonCancelar) {
                const pedidoId = botonCancelar.dataset.id;
                // Llama a la función para cancelar, pasándole el ID
                await manejarActualizacionPedido(pedidoId, 'cancelar');
            }
        });
    }
});

/**
 * Función que llama a la API para actualizar el estado de un pedido
 * @param {string} id - El ID del pedido
 * @param {'completar' | 'cancelar'} accion - La acción a realizar
 */
async function manejarActualizacionPedido(id, accion) {
    
    // Ruta de tu API (la que acordamos en el backend)
    const url = `/api/pedidos/${accion}/${id}`;
    
    try {
        const respuesta = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Asegúrate de enviar el token de autenticación si es necesario
                // 'Authorization': `Bearer ${token}` 
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error al ${accion} el pedido`);
        }

        const pedidoActualizado = await respuesta.json();

        // Éxito: Actualizar la UI
        console.log(`Pedido ${accion}do con éxito`);

        // Busca la fila de la tabla y actualiza su estado
        const filaPedido = document.getElementById(`pedido-${id}`);
        if (filaPedido) {
            const celdaEstado = filaPedido.querySelector('td:nth-child(6)');
            const celdaAcciones = filaPedido.querySelector('td:nth-child(7)');

            if (accion === 'completar') {
                celdaEstado.innerHTML = '<span class="badge bg-success">Completado</span>';
            } else {
                celdaEstado.innerHTML = '<span class="badge bg-danger">Cancelado</span>';
            }
            
            // Elimina los botones de acción
            celdaAcciones.innerHTML = ''; 
        }

        // Opcional: Recargar la página
        // window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert(`Hubo un error al ${accion} el pedido.`);
    }
}