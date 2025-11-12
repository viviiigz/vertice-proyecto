import { InfiniteScroll } from './infinite-scroll.js';

document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.getElementById('product-grid-container');
    const searchInput = document.getElementById('search-input');
    const cartCountSpan = document.getElementById('cart-count');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-btn');

    // Elementos necesarios para el filtrado por categorías usando los enlaces
    const categoryLinks = document.querySelectorAll('.category-carousel-section .carousel-nav a');
    let currentCategoryFilter = 'todos'; // Almacena el filtro de categoría activo, 'todos' por defecto

    const reiniciarCarritoBtn = document.getElementById('reiniciar-carrito-btn'); 

    let scrollManager = null; // Instancia de InfiniteScroll

    // --- Funciones de utilidad ---

    // ELIMINADAS - Ahora usa CartManager global
    // function actualizarContadorCarrito() {
    //     if (cartCountSpan) {
    //         cartCountSpan.textContent = cart.length;
    //     }
    // }
    
    // function guardarCarrito() {
    //     localStorage.setItem('cart', JSON.stringify(cart));
    // }

    // --- NUEVO: Función para vaciar/reiniciar el carrito ---
    function vaciarCarrito() {
        if (window.cartManager) {
            window.cartManager.clearCart();
            alert('El carrito ha sido vaciado y está listo para nuevas compras.');
        }
    }

    // ... (el resto del código sigue) ...
    
    // Función para mapear un producto del backend al formato local
    function mapearProducto(p) {
        return {
            id: p._id || p.id,
            nombre: p.nombre_producto,
            descripcion: p.descripcion || '',
            precioOriginal: p.precio_original,
            precioOferta: p.precio_descuento && p.precio_descuento < p.precio_original ? p.precio_descuento : null,
            imagen: p.foto_url ? `http://localhost:3000/uploads/${p.foto_url}` : './assets/imgs/placeholder.png',
            categoria: p.categoria,
            tipo_producto: p.tipo_producto,
            stock: p.cantidad_disponible || 0
        };
    }

    // ELIMINADAS - Ahora usa CartManager global
    // function actualizarContadorCarrito() {
    //     if (cartCountSpan) {
    //         cartCountSpan.textContent = cart.length;
    //     }
    // }
    
    // function guardarCarrito() {
    //     localStorage.setItem('cart', JSON.stringify(cart));
    // }

    // --- Lógica de visualización y filtrado ---
    function mostrarProductos(productosAMostrar) {
        if (!productGrid) { // IMPORTE: Asegurarse de que productGrid existe
            console.error('El contenedor de productos (product-grid-container) no se encontró.');
            return;
        }
        productGrid.innerHTML = ''; // Limpia el contenido actual

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
        console.log('🔍 aplicarFiltrosYOrden - productos disponibles:', productos.length);
        let productosFiltrados = [...productos];
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        // const sortValue = 'a-z'; // Valor por defecto, si no hay select de ordenamiento
        // const categoryValue = currentCategoryFilter; // Usamos la variable global actualizada por los clicks

        // Filtro por búsqueda
        if (searchTerm) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(searchTerm) || (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)));
            console.log('🔍 Después de buscar:', productosFiltrados.length);
        }

        // Filtro por categoría (usando los enlaces)
        // Nota: vista-producto-user.html ya viene filtrado solo con 'comida-por-caducarse'
        // Los enlaces con .html navegan a otras páginas, solo los hash filtran aquí
        console.log('🔍 currentCategoryFilter:', currentCategoryFilter);
        if (currentCategoryFilter && currentCategoryFilter !== 'todos' && currentCategoryFilter !== '#todos' && currentCategoryFilter.startsWith('#')) {
            console.log('🔍 Filtrando por categoría:', currentCategoryFilter);
            productosFiltrados = productosFiltrados.filter(p => {
                switch(currentCategoryFilter) {
                    case '#lacteos': return p.tipo_producto === 'lacteos';
                    case '#bebidas': return p.tipo_producto === 'bebidas';
                    case '#frescos': return p.tipo_producto === 'frescos';
                    case '#ofertas': return p.precioOferta && parseFloat(p.precioOferta) < parseFloat(p.precioOriginal);
                    default: return true; // Para 'todos' o cualquier otro caso
                }
            });
            console.log('🔍 Después de filtrar por categoría:', productosFiltrados.length);
        }

        // --- Ordenamiento (Manejo para cuando no hay un select de ordenamiento) ---
        // Si no tienes un <select> con id="sort-select" en tu HTML,
        // puedes eliminar toda la sección 'Ordenamiento' o dejar un orden por defecto.
        // Por ahora, asumimos un orden por defecto si no hay un select de ordenamiento.
        // Si en el futuro agregas un select para ordenar, necesitarías adaptar esta parte.
        productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Orden alfabético por defecto

        console.log('✅ Mostrando productos:', productosFiltrados.length);
        mostrarProductos(productosFiltrados);
    }

    // --- Lógica del Carrito ---
    function agregarAlCarrito(idProducto) {
        const producto = productos.find(p => p.id == idProducto);
        if (producto && window.cartManager) {
            window.cartManager.addItem({
                id: producto.id,
                nombre_producto: producto.nombre,
                precio_descuento: producto.precioOferta,
                precio_original: producto.precioOriginal,
                imagenes: [producto.imagen]
            });
            alert(`"${producto.nombre}" ha sido agregado al carrito.`);
        }
    }

    // --- Lógica del Modal (Vista de Producto) ---
    function abrirModal(idProducto) {
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
        if (productModal) { // Comprobación de seguridad
            productModal.style.display = 'none';
        }
    }

    // --- Inicialización y Eventos ---
    
    // Función async para inicializar todo
    async function inicializar() {
        productos = await obtenerProductos(); // Carga los productos desde la BD

        // Inicializa el filtro de categoría activo y aplica los filtros/orden
        const activeCategoryLink = document.querySelector('.category-carousel-section .carousel-nav a.active');
        if (activeCategoryLink) {
            currentCategoryFilter = activeCategoryLink.getAttribute('href');
        }
        
        // Solo aplica filtros y orden si productGrid existe
        if (productGrid) {
        aplicarFiltrosYOrden(); // Muestra los productos inicialmente
    }
    // actualizarContadorCarrito(); // ELIMINADO - CartManager lo maneja automáticamente

    // Eventos para el buscador
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltrosYOrden);
    }
    
    // NO SE AGREGAN LISTENERS PARA sortSelect y categorySelect porque no existen

    // NUEVOS EVENTOS: Para los enlaces de categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = e.target.getAttribute('href');
            
            // Solo prevenir default si es un hash (#todos, #lacteos), no si es una página real (.html)
            if (href && href.startsWith('#')) {
                e.preventDefault(); // Evita que el navegador salte a la ancla

                // Quita 'active' de todos los enlaces y lo pone en el clickeado
                categoryLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                currentCategoryFilter = href; // Actualiza el filtro
                aplicarFiltrosYOrden(); // Vuelve a aplicar filtros
            }
            // Si no empieza con #, deja que navegue normalmente a la otra página
        });
    });

    // Eventos de click en el grid de productos (si productGrid existe)
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const addToCartBtn = e.target.closest('.add-to-cart-btn');

            if (addToCartBtn) {
                e.stopPropagation(); // Evita que el evento se propague al card
                const id = addToCartBtn.dataset.id;
                agregarAlCarrito(id);
            } else if (card) {
                const id = card.dataset.id;
                abrirModal(id);
            }
        });
    }


    // Eventos para el modal (si productModal existe)
    if (productModal && closeModalBtn) { // Comprobación de seguridad
        closeModalBtn.addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => {
            if (e.target == productModal) {
                cerrarModal();
            }
        });
    }
    // ... (código anterior de Inicialización y Eventos) ...

    // Eventos para el buscador
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltrosYOrden);
    }
    
    // Eventos para los enlaces de categoría (segundo bloque)
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = e.target.getAttribute('href');
            
            // Solo prevenir default si es un hash (#todos, #lacteos), no si es una página real (.html)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                currentCategoryFilter = href;
                aplicarFiltrosYOrden();
            }
            // Si no empieza con #, deja que navegue normalmente a la otra página
        });
    });

    // Eventos de click en el grid de productos
    if (productGrid) {
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
    if (productModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => {
            if (e.target == productModal) {
                cerrarModal();
            }
        });
    }

    // --- NUEVO: Event listener para el botón de reiniciar carrito ---
    if (reiniciarCarritoBtn) { // <--- AÑADE ESTO AQUÍ
        reiniciarCarritoBtn.addEventListener('click', () => {
            vaciarCarrito();
        });
    }
    
    } // Fin de función inicializar()
    
    // Llamar a la función de inicialización
    inicializar();

}); // Fin de document.addEventListener('DOMContentLoaded')

