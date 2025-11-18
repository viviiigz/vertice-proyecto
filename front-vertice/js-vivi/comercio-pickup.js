document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    // 1. Coordenadas de Formosa, Argentina
    const formosaCoords = [-26.18489, -58.17313];

    // 2. Inicializar el mapa
    const map = L.map('map', {
        zoomControl: false // Ocultamos el zoom por defecto para ponerlo donde queramos (opcional)
    }).setView(formosaCoords, 14);

    // Movemos el control de zoom a una esquina más cómoda si quieres, o lo dejamos false
    L.control.zoom({
        position: 'topleft'
    }).addTo(map);

    // 3. Cargar capa de OpenStreetMap (Diseño Clean)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Vértice 2025',
        maxZoom: 19
    }).addTo(map);

    // 4. DATOS SIMULADOS (Aquí conectarías con tu Backend/Base de Datos)
    const puntosDeRetiro = [
        {
            id: 1,
            nombre: "Punto Vértice 'El Almacén'",
            direccion: "Av. Italia 1234, Formosa",
            horario: "Lun-Vie: 8:00 - 20:00",
            rating: 4.8,
            coords: [-26.1849, -58.1731],
            img: "./assets/imgs/tienda-ejemplo-1.jpg", // Asegúrate de que esta imagen exista o pon una genérica
            servicios: ["Estacionamiento", "Pago en efectivo"]
        },
        {
            id: 2,
            nombre: "Librería del Centro",
            direccion: "Calle Rivadavia 550, Formosa",
            horario: "Lun-Sab: 9:00 - 13:00 / 17:00 - 21:00",
            rating: 4.5,
            coords: [-26.1810, -58.1750],
            img: "./assets/imgs/tienda-ejemplo-2.jpg",
            servicios: ["Solo retiro rápido"]
        },
        {
            id: 3,
            nombre: "Maxikiosco La Paz",
            direccion: "Av. Gutnisky 3200, Formosa",
            horario: "Todos los días: 24hs",
            rating: 4.9,
            coords: [-26.1950, -58.1850],
            img: "./assets/imgs/tienda-ejemplo-3.jpg",
            servicios: ["24 Horas", "Estacionamiento"]
        }
    ];

    // 5. Icono personalizado (Verde Vértice)
    // Si no tienes la imagen 'marcador-verde.png', Leaflet usará el azul por defecto.
    // Para usar el default de Leaflet pero cambiar el color, se suele usar un filtro CSS o una imagen custom.
    const verticeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', // Icono verde online
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // 6. Agregar Marcadores al Mapa
    puntosDeRetiro.forEach(punto => {
        const marker = L.marker(punto.coords, { icon: verticeIcon }).addTo(map);

        // --- LA MAGIA: Evento Click en lugar de Popup ---
        marker.on('click', () => {
            actualizarTarjetaFlotante(punto, map);
        });
    });
}

/**
 * Función que actualiza la tarjeta flotante sobre el mapa (Overlay)
 */
function actualizarTarjetaFlotante(punto, map) {
    // 1. Referencias al DOM
    const placeholder = document.querySelector('.point-placeholder');
    const detailsContainer = document.getElementById('selected-point-template');
    
    // Elementos a rellenar
    const titleEl = document.getElementById('detail-title');
    const addressEl = document.getElementById('detail-address');
    const horarioEl = detailsContainer.querySelector('.fa-clock').parentNode; // Busca el padre del icono reloj
    // const imgEl = detailsContainer.querySelector('.point-img'); // Descomentar si tienes imágenes reales

    // 2. Ocultar mensaje de "Selecciona un punto" y mostrar detalle
    if (placeholder) placeholder.style.display = 'none';
    if (detailsContainer) detailsContainer.classList.remove('d-none');

    // 3. Inyectar datos
    titleEl.textContent = punto.nombre;
    addressEl.textContent = punto.direccion;
    horarioEl.innerHTML = `<i class="far fa-clock text-success"></i> ${punto.horario}`;
    
    // Si tuvieras imágenes reales de los locales:
    // imgEl.src = punto.img; 

    // 4. Animación de mapa (FlyTo) para centrar y hacer zoom suave
    map.flyTo(punto.coords, 16, {
        animate: true,
        duration: 1.5 // Duración en segundos (efecto suave)
    });

    // 5. Guardar ID del punto seleccionado en un atributo del botón (para usarlo al dar click en Seleccionar)
    const btnSeleccionar = detailsContainer.querySelector('.btn-success');
    btnSeleccionar.setAttribute('data-id', punto.id);
}

/**
 * Función llamada desde el botón "Seleccionar este punto" en el HTML
 */
function seleccionarPunto() {
    const detailsContainer = document.getElementById('selected-point-template');
    const btn = detailsContainer.querySelector('.btn-success');
    const puntoId = btn.getAttribute('data-id');
    const puntoNombre = document.getElementById('detail-title').textContent;

    // Lógica de negocio: Guardar en LocalStorage o enviar a Backend
    console.log(`Punto seleccionado: ID ${puntoId} - ${puntoNombre}`);

    // Feedback visual al usuario (SweetAlert sería ideal aquí, pero usamos alert nativo por ahora)
    alert(`¡Excelente! Has seleccionado: ${puntoNombre}\nTus próximos pedidos llegarán aquí.`);

    // Opcional: Redirigir al checkout o productos
    // window.location.href = './vista-producto-user.html';
}