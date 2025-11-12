// Archivo: js-vivi/vertice-home.js
// Script para la página principal vertice.html con scroll infinito de productos destacados

import { InfiniteScroll } from './infinite-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('vertice-products-grid');
    
    if (!productsGrid) {
        console.log('[vertice-home] Grid de productos no encontrado');
        return;
    }

    // Función para crear tarjeta de producto
    function crearTarjetaProducto(producto) {
        const card = document.createElement('div');
        card.className = 'featured-product-card';
        
        const precioOferta = producto.precio_descuento && producto.precio_descuento < producto.precio_original ? producto.precio_descuento : null;
        const imagenURL = producto.foto_url ? `http://localhost:3000/uploads/${producto.foto_url}` : './assets/imgs/placeholder.png';
        
        // HTML de la tarjeta
        const precioHTML = precioOferta 
            ? `<p class="price-original" style="text-decoration: line-through; color: #888;">$${producto.precio_original}</p>
               <p class="price-offer" style="color: #28a745; font-weight: bold; font-size: 1.5rem;">$${precioOferta}</p>`
            : `<p class="price-offer" style="font-weight: bold; font-size: 1.5rem;">$${producto.precio_original}</p>`;

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imagenURL}" alt="${producto.nombre_producto}" class="product-image">
                ${precioOferta ? '<span class="discount-badge">¡Oferta!</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre_producto}</h3>
                <p class="product-description">${producto.descripcion ? producto.descripcion.substring(0, 80) + '...' : 'Producto de calidad'}</p>
                <div class="product-prices">
                    ${precioHTML}
                </div>
                <a href="login.html" class="btn-view-product">Ver Producto</a>
            </div>
        `;
        
        return card;
    }

    // Inicializar scroll infinito
    const scrollManager = new InfiniteScroll({
        containerId: 'vertice-products-grid',
        apiUrl: 'http://localhost:3000/api/productos',
        queryParams: {}, // Sin filtros => obtiene productos de la página principal
        renderItem: crearTarjetaProducto,
        limit: 9, // Múltiplo de 3 para grid responsive
        threshold: 500
    });

    console.log('[vertice-home] Inicializando scroll infinito...');
    scrollManager.init();
});
