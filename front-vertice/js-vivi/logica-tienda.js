document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const cartCountSpan = document.getElementById('cart-count');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-btn');

    let productos = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Funciones de utilidad ---
    async function obtenerProductos() {
        try {
            const response = await fetch('/api/productos'); // Reemplaza con la URL correcta de tu API
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
                imagen: p.foto_url,
                categoria: p.categoria // Asegúrate de que este campo exista en tu backend
            }));
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    function actualizarContadorCarrito() {
        cartCountSpan.textContent = cart.length;
    }

    function guardarCarrito() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // --- Lógica de visualización y filtrado ---
    function mostrarProductos(productosAMostrar) {
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
        let productosFiltrados = [...productos];
        const searchTerm = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;
        const categoryValue = categorySelect.value;

        // Filtro por búsqueda
        if (searchTerm) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(searchTerm) || (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)));
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
        productModal.style.display = 'none';
    }

    // --- Inicialización y Eventos ---
    async function inicializarApp() {
        productos = await obtenerProductos();
        aplicarFiltrosYOrden();
        actualizarContadorCarrito();
    }
    // Llamada para iniciar la aplicación
    inicializarApp();

    // Eventos para el buscador, filtros y ordenamiento
    searchInput.addEventListener('input', aplicarFiltrosYOrden);
    sortSelect.addEventListener('change', aplicarFiltrosYOrden);
    categorySelect.addEventListener('change', aplicarFiltrosYOrden);

    // Eventos de click en el grid de productos
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

    // Eventos para el modal
    closeModalBtn.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => {
        if (e.target == productModal) {
            cerrarModal();
        }
    });

});