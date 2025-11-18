import { InfiniteScroll } from './infinite-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid-container');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const reiniciarCarritoBtn = document.getElementById('reiniciar-carrito-btn'); 

    let scrollManager = null;
    let allProducts = [];

    function vaciarCarrito() {
        if (window.cartManager) {
            window.cartManager.clearCart();
            window.notify.success('El carrito ha sido vaciado y está listo para nuevas compras.');
        }
    }

    function crearTarjetaProducto(producto) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = producto._id || producto.id;

        const precioOferta = producto.precio_descuento && producto.precio_descuento < producto.precio_original ? producto.precio_descuento : null;
        const precioDisplay = precioOferta ? "<span class='product-price'>$" + precioOferta + "</span><span class='original-price'>$" + producto.precio_original + "</span>" : "<span class='product-price'>$" + producto.precio_original + "</span>";
        const imagenURL = producto.foto_url ? "http://localhost:3000/uploads/" + producto.foto_url : './assets/imgs/placeholder.png';

        card.innerHTML = "<img src='" + imagenURL + "' alt='" + producto.nombre_producto + "'><div class='card-content'><h3>" + producto.nombre_producto + "</h3><p class='product-description'>" + (producto.descripcion || '') + "</p><div class='price-info'>" + precioDisplay + "</div></div><div class='product-actions'><button class='add-to-cart-btn' data-id='" + (producto._id || producto.id) + "'>Agregar al carrito</button></div>";
        
        allProducts.push(producto);
        return card;
    }

    function agregarAlCarrito(idProducto) {
        console.log('Intentando agregar al carrito, ID:', idProducto);
        console.log('CartManager disponible:', !!window.cartManager);
        
        const producto = allProducts.find(p => (p._id || p.id) == idProducto);
        console.log('Producto encontrado:', producto);
        
        if (producto && window.cartManager) {
            const result = window.cartManager.addItem({
                id: producto._id || producto.id,
                nombre_producto: producto.nombre_producto,
                precio_descuento: producto.precio_descuento,
                precio_original: producto.precio_original,
                imagenes: [producto.foto_url ? "http://localhost:3000/uploads/" + producto.foto_url : './assets/imgs/placeholder.png'],
                user_id: producto.user_id // ✅ Agregar el comercianteId al carrito
            });
            console.log('Producto agregado al carrito:', result);
            window.notify.success(`✓ ${producto.nombre_producto} agregado al carrito`, 3000);
        } else {
            console.error('Error: Producto o CartManager no disponible');
            if (!producto) console.error('Producto no encontrado');
            if (!window.cartManager) console.error('CartManager no inicializado');
        }
    }

    function abrirModal(idProducto) {
        const producto = allProducts.find(p => (p._id || p.id) == idProducto);
        if (producto) {
            const modalBody = document.querySelector('.modal-body');
            const precioOferta = producto.precio_descuento && producto.precio_descuento < producto.precio_original ? producto.precio_descuento : null;
            const precioDisplayModal = precioOferta ? "<span class='price'>$" + precioOferta + "</span><span class='old-price'>$" + producto.precio_original + "</span>" : "<span class='price'>$" + producto.precio_original + "</span>";
            const imagenURL = producto.foto_url ? "http://localhost:3000/uploads/" + producto.foto_url : './assets/imgs/placeholder.png';

            modalBody.innerHTML = "<img src='" + imagenURL + "' alt='" + producto.nombre_producto + "'><div class='product-details'><div><h2>" + producto.nombre_producto + "</h2><p class='description'>" + (producto.descripcion || 'Sin descripción.') + "</p><p><strong>Stock:</strong> " + (producto.cantidad_disponible || 0) + "</p><p><strong>Categoría:</strong> " + producto.categoria + "</p></div><div><div class='price-info'>" + precioDisplayModal + "</div><button class='modal-add-to-cart' data-id='" + (producto._id || producto.id) + "'>Agregar al carrito</button></div></div>";
            productModal.style.display = 'block';
        }
    }

    function cerrarModal() {
        if (productModal) productModal.style.display = 'none';
    }

    function inicializar() {
        if (!productGrid) {
            console.error('El contenedor de productos no se encontró.');
            return;
        }

        scrollManager = new InfiniteScroll({
            containerId: 'product-grid-container',
            apiUrl: 'http://localhost:3000/api/productos',
            queryParams: {},
            renderItem: crearTarjetaProducto,
            limit: 15,
            threshold: 400
        });

        scrollManager.init();
    }

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

    if (productModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => {
            if (e.target == productModal) cerrarModal();
        });
        
        productModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-add-to-cart')) {
                const id = e.target.dataset.id;
                agregarAlCarrito(id);
                cerrarModal();
            }
        });
    }

    if (reiniciarCarritoBtn) {
        reiniciarCarritoBtn.addEventListener('click', () => {
            vaciarCarrito();
        });
    }
    
    inicializar();
});
