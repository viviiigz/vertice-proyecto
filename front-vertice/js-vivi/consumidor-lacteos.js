// Archivo: js-vivi/consumidor-lacteos.js

document.addEventListener('DOMContentLoaded', () => {
    // Apunta al contenedor donde irán los productos
    const productGrid = document.getElementById('product-grid-container');

    // Función para cargar los productos de la categoría "Lacteos"
    async function cargarProductosLacteos() {
        if (!productGrid) return;
        
        productGrid.innerHTML = '<p>Cargando productos...</p>'; // Mensaje de carga

        try {
            const url = 'http://localhost:3000/api/productos?tipo_producto=lacteos&categoria=comida-por-caducarse';
            console.log('[LÁCTEOS] Fetch =>', url);
            const respuesta = await fetch(url);
            
            if (!respuesta.ok) {
                throw new Error('Error al cargar los productos');
            }

            const productos = await respuesta.json();
            console.log('[LÁCTEOS] Total backend =>', productos.length);
            // Filtro defensivo en cliente por si el backend ignorara los params
            const filtrados = productos.filter(p => p.categoria === 'comida-por-caducarse' && p.tipo_producto === 'lacteos');
            console.log('[LÁCTEOS] Total tras filtro cliente =>', filtrados.length);
            
            productGrid.innerHTML = ''; // Limpia el "Cargando..."

            if (filtrados.length === 0) {
                productGrid.innerHTML = '<p>No hay productos en esta categoría por el momento.</p>';
                return;
            }

            // Llama a la función para mostrar los productos
            mostrarProductos(filtrados);

        } catch (error) {
            console.error(error);
            productGrid.innerHTML = '<p>Error al cargar productos. Intente más tarde.</p>';
        }
    }

    // Función para crear la tarjeta de cada producto
    function mostrarProductos(productos) {
        const productGrid = document.getElementById('product-grid-container');
        productos.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card'; // Asegúrate de tener esta clase en tu CSS
            
            // Lógica para mostrar precios (con o sin oferta)
            let precioHTML = '';
            if (producto.precio_descuento && producto.precio_descuento < producto.precio_original) {
                precioHTML = `
                    <p class="price-original" style="text-decoration: line-through; color: #888;">$${producto.precio_original}</p>
                    <p class="price-offer" style="color: #28a745; font-weight: bold;">$${producto.precio_descuento}</p>
                `;
            } else {
                precioHTML = `<p class="price-offer" style="font-weight: bold;">$${producto.precio_original}</p>`;
            }

            // Construir URL completa de la imagen
            const imagenURL = producto.foto_url ? `http://localhost:3000/uploads/${producto.foto_url}` : './assets/imgs/placeholder.png';

            // Estructura de la tarjeta de producto (ajústala a tu CSS)
            card.innerHTML = `
                <img src="${imagenURL}" alt="${producto.nombre_producto}" class="product-image">
                <div class="product-info">
                    <h5 class="product-title">${producto.nombre_producto}</h5>
                    <div class="product-prices">
                        ${precioHTML}
                    </div>
                    <button class="btn-add-cart" data-id="${producto._id}">
                        <i class="fas fa-shopping-cart"></i> Agregar
                    </button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Inicia la carga de productos
    cargarProductosLacteos();
});