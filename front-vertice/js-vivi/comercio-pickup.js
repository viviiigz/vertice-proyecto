//
// --- ARCHIVO: js/comercio-pickup.js ---
// (Versión con Leaflet.js)
//

// 1. Espera a que el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // 2. Coordenadas de tus puntos (¡Valores reales de Formosa!)
    const puntosDeRetiro = [
        { 
            nombre: 'Plaza San Martín (Centro)', 
            lat: -26.185145, 
            lng: -58.174520 
        },
        { 
            nombre: 'Cruz del Norte Formosa', 
            lat: -26.197596, 
            lng: -58.212465 
        },
        { 
            nombre: 'Monumento a la Virgen del Carmen', 
            lat: -26.157044, 
            lng: -58.185414 
        }
    ];

    // 3. Coordenadas del centro del mapa (promedio de los 3 puntos)
    const centroFormosa = [-26.180, -58.190];
    const zoomLevel = 12;

    // 4. Inicializa el mapa
    // 'L.map('map')' busca un div con id="map"
    const map = L.map('map').setView(centroFormosa, zoomLevel);

    // 5. Añade la capa de mapa (el visual de OpenStreetMap)
    // Esto es lo que dibuja las calles.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 6. Crear un icono personalizado verde para Vértice
    const iconoVerde = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
                <path fill="#4cd309" stroke="#2d8006" stroke-width="1.5" d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/>
                <circle fill="white" cx="12" cy="9" r="3.5"/>
            </svg>
        `),
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });

    // 7. Añade los marcadores (pins) al mapa con el icono verde
    puntosDeRetiro.forEach(punto => {
        L.marker([punto.lat, punto.lng], { icon: iconoVerde })  // Usa el icono verde
            .addTo(map)                   // Lo añade al mapa
            .bindPopup(`<h5 style="font-family: 'Montserrat', sans-serif; margin: 0; color: #4cd309;">${punto.nombre}</h5>`); // Le pone el popup con título verde
    });

});