// Archivo: js-vivi/consumidor-frescos.js

import { InfiniteScroll } from './infinite-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    // Función para crear la tarjeta de cada producto
    function crearTarjetaProducto(producto) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let precioHTML = '';
        if (producto.precio_descuento && producto.precio_descuento < producto.precio_original) {
            precioHTML = `
                <p class="price-original" style="text-decoration: line-through; color: #888;">$${producto.precio_original}</p>
                <p class="price-offer" style="color: #28a745; font-weight: bold;">$${producto.precio_descuento}</p>
            `;
        } else {
            precioHTML = `<p class="price-offer" style="font-weight: bold;">$${producto.precio_original}</p>`;
        }

        const imagenURL = producto.foto_url ? `http://localhost:3000/uploads/${producto.foto_url}` : './assets/imgs/placeholder.png';

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
        return card;
    }

    // Inicializar scroll infinito
    const scrollManager = new InfiniteScroll({
        containerId: 'product-grid-container',
        apiUrl: 'http://localhost:3000/api/productos',
        queryParams: {
            tipo_producto: 'frescos',
            categoria: 'comida-por-caducarse'
        },
        renderItem: crearTarjetaProducto,
        limit: 12,
        threshold: 400
    });

    scrollManager.init();
});