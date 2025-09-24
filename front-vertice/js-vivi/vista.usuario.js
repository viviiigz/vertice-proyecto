document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.getElementById('product-grid-container');
    const searchInput = document.getElementById('search-input');
    // const sortSelect = document.getElementById('sort-select'); // COMENTADA: Ya que no existe en tu HTML
    // const categorySelect = document.getElementById('category-select'); // COMENTADA: Ya que no existe en tu HTML
    const cartCountSpan = document.getElementById('cart-count');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-btn');

    // Elementos necesarios para el filtrado por categorías usando los enlaces
    const categoryLinks = document.querySelectorAll('.category-carousel-section .carousel-nav a');
    let currentCategoryFilter = 'todos'; // Almacena el filtro de categoría activo, 'todos' por defecto

    const reiniciarCarritoBtn = document.getElementById('reiniciar-carrito-btn'); 

    let productos = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Funciones de utilidad ---

    // --- Funciones de utilidad ---
    function obtenerProductos() {
        const productosJSON = localStorage.getItem('productos');
        return productosJSON ? JSON.parse(productosJSON) : [];
    }

    function actualizarContadorCarrito() {
        if (cartCountSpan) {
            cartCountSpan.textContent = cart.length;
        }
    }
    
    function guardarCarrito() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // --- NUEVO: Función para vaciar/reiniciar el carrito ---
    function vaciarCarrito() { // <--- AÑADE ESTO AQUÍ
        cart = []; // Reinicia el array del carrito en tu script
        localStorage.setItem('cart', JSON.stringify(cart)); // Guarda este array vacío en localStorage
        actualizarContadorCarrito(); // Actualiza el número de productos mostrados

        alert('El carrito ha sido vaciado y está listo para nuevas compras.');

        // Opcional: Si tienes un contenedor donde muestras los ítems del carrito
        // y quieres que se limpie visualmente, añade esto:
        // const cartItemsDisplay = document.getElementById('id-de-tu-contenedor-de-items-del-carrito');
        // if (cartItemsDisplay) {
        //     cartItemsDisplay.innerHTML = '<p>Tu carrito está vacío.</p>';
        // }
    }

    // ... (el resto del código sigue) ...
    function obtenerProductos() {
        const productosJSON = localStorage.getItem('productos');
        return productosJSON ? JSON.parse(productosJSON) : [];
    }

    function actualizarContadorCarrito() {
        if (cartCountSpan) { // Agregamos una comprobación por si el elemento no existe en otras páginas
            cartCountSpan.textContent = cart.length;
        }
    }
    
    function guardarCarrito() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

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
        let productosFiltrados = [...productos];
        const searchTerm = searchInput.value.toLowerCase();
        // const sortValue = 'a-z'; // Valor por defecto, si no hay select de ordenamiento
        // const categoryValue = currentCategoryFilter; // Usamos la variable global actualizada por los clicks

        // Filtro por búsqueda
        if (searchTerm) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(searchTerm) || (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)));
        }

        // Filtro por categoría (usando los enlaces)
        if (currentCategoryFilter !== 'todos') {
            productosFiltrados = productosFiltrados.filter(p => {
                // Aquí adaptas el 'href' de tu enlace a la categoría de tu producto
                // ¡IMPORTANTE! Ajusta estos valores a las categorías reales que guardas en tus productos
                switch(currentCategoryFilter) {
                    case '#por-caducarse': return p.categoria === 'caducarse'; // Ejemplo: Si tu producto tiene categoria 'caducarse'
                    case '#para-donar': return p.categoria === 'donar'; // Ejemplo: Si tu producto tiene categoria 'donar'
                    case '#frescos': return ['frutas-verduras', 'lacteos'].includes(p.categoria); // Ejemplo: Si frescos agrupa varias
                    case '#ofertas': return p.precioOferta && parseFloat(p.precioOferta) < parseFloat(p.precioOriginal); // Ejemplo: Si hay precio de oferta
                    default: return true; // Para 'todos' o si no hay un mapeo específico
                }
            });
        }

        // --- Ordenamiento (Manejo para cuando no hay un select de ordenamiento) ---
        // Si no tienes un <select> con id="sort-select" en tu HTML,
        // puedes eliminar toda la sección 'Ordenamiento' o dejar un orden por defecto.
        // Por ahora, asumimos un orden por defecto si no hay un select de ordenamiento.
        // Si en el futuro agregas un select para ordenar, necesitarías adaptar esta parte.
        productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Orden alfabético por defecto

        mostrarProductos(productosFiltrados);
    }

    // --- Lógica del Carrito ---
    function agregarAlCarrito(idProducto) {
        const producto = productos.find(p => p.id == idProducto);
        if (producto) {
            cart.push(producto); // Agrega el producto al array del carrito
            guardarCarrito();
            actualizarContadorCarrito();
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
    productos = obtenerProductos(); // Carga los productos al inicio

    // Inicializa el filtro de categoría activo y aplica los filtros/orden
    const activeCategoryLink = document.querySelector('.category-carousel-section .carousel-nav a.active');
    if (activeCategoryLink) {
        currentCategoryFilter = activeCategoryLink.getAttribute('href');
    }
    
    // Solo aplica filtros y orden si productGrid existe (para evitar errores en otras páginas que quizás no lo tengan)
    if (productGrid) {
        aplicarFiltrosYOrden(); // Muestra los productos inicialmente
    }
    actualizarContadorCarrito();

    // Eventos para el buscador
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltrosYOrden);
    }
    
    // NO SE AGREGAN LISTENERS PARA sortSelect y categorySelect porque no existen

    // NUEVOS EVENTOS: Para los enlaces de categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el navegador salte a la ancla

            // Quita 'active' de todos los enlaces y lo pone en el clickeado
            categoryLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            currentCategoryFilter = e.target.getAttribute('href'); // Actualiza el filtro
            aplicarFiltrosYOrden(); // Vuelve a aplicar filtros
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
    
    // Eventos para los enlaces de categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentCategoryFilter = e.target.getAttribute('href');
            aplicarFiltrosYOrden();
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

}); // Fin de document.addEventListener('DOMContentLoaded')

