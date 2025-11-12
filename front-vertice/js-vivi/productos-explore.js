// Archivo: js-vivi/productos-explore.js
// Script para productos.html con scroll infinito y búsqueda en tiempo real

import { InfiniteScroll } from './infinite-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productos-grid-container');
    const searchInput = document.getElementById('buscador');
    
    let scrollManager = null;
    let searchTimeout = null;

    if (!productsGrid) {
        console.error('[productos-explore] Grid de productos no encontrado');
        return;
    }

    // Función para calcular el porcentaje de descuento
    function calcularDescuento(precioOriginal, precioDescuento) {
        if (!precioDescuento || precioDescuento >= precioOriginal) return null;
        const descuento = ((precioOriginal - precioDescuento) / precioOriginal) * 100;
        return Math.round(descuento);
    }

    // Función para crear tarjeta de producto
    function crearTarjetaProducto(producto) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const precioOferta = producto.precio_descuento && producto.precio_descuento < producto.precio_original ? producto.precio_descuento : null;
        const porcentajeDescuento = precioOferta ? calcularDescuento(producto.precio_original, precioOferta) : null;
        const imagenURL = producto.foto_url ? `http://localhost:3000/uploads/${producto.foto_url}` : './assets/imgs/placeholder.png';
        
        // Obtener nombre del comercio del usuario (si está poblado)
        const nombreComercio = producto.user_id?.username || 'Comercio local';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imagenURL}" alt="${producto.nombre_producto}" class="product-image">
                ${porcentajeDescuento ? `<span class="discount-badge">-${porcentajeDescuento}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre_producto}</h3>
                <p class="store-name">${nombreComercio}</p>
                <div class="price-container">
                    ${precioOferta 
                        ? `<span class="original-price">$${producto.precio_original.toLocaleString('es-AR')}</span>
                           <span class="current-price">$${precioOferta.toLocaleString('es-AR')}</span>`
                        : `<span class="current-price">$${producto.precio_original.toLocaleString('es-AR')}</span>`
                    }
                </div>
            </div>
            <a href="registro.html" class="more-info-btn">Más Información</a>
        `;
        
        return card;
    }

    // Función para inicializar scroll infinito
    function inicializarScrollInfinito(searchQuery = '') {
        // Si ya existe un scroll manager, destruirlo
        if (scrollManager) {
            scrollManager.destroy();
        }

        // Limpiar el contenedor
        productsGrid.innerHTML = '';

        // Configurar query params según búsqueda
        const queryParams = searchQuery ? { q: searchQuery } : {};

        // Crear nuevo scroll manager
        scrollManager = new InfiniteScroll({
            containerId: 'productos-grid-container',
            apiUrl: 'http://localhost:3000/api/productos',
            queryParams: queryParams,
            renderItem: crearTarjetaProducto,
            limit: 12, // 12 productos por página (múltiplo de 3 para grid)
            threshold: 400
        });

        scrollManager.init();
    }

    // Event listener para búsqueda con debounce
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            
            // Limpiar timeout previo
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Esperar 500ms después de que el usuario deja de escribir
            searchTimeout = setTimeout(() => {
                console.log('[productos-explore] Buscando:', searchTerm || '(todos)');
                inicializarScrollInfinito(searchTerm);
            }, 500);
        });
    }

    // Inicializar con todos los productos
    console.log('[productos-explore] Inicializando productos...');
    inicializarScrollInfinito();
});
