// banco-elegir-pickup.js - Selección de punto pickup y horario para banco

const API_URL = 'http://localhost:3000';
let pickupPoints = [];
let selectedPickup = null;
let selectedHorario = null;
let solicitudProductos = [];
let map = null;
let markers = [];

// Puntos de retiro fijos (mismos que consumidor)
const PUNTOS_RETIRO_FIJOS = [
    { 
        _id: 'plaza-san-martin',
        nombre: 'Plaza San Martín (Centro)', 
        direccion: 'Plaza San Martín, Centro, Formosa',
        latitud: -26.185145, 
        longitud: -58.174520,
        descripcion: 'Punto de retiro en el centro de la ciudad',
        horario: 'Lunes a Viernes: 8:00 - 18:00',
        telefono: '+54 370 123-4567',
        activo: true
    },
    { 
        _id: 'cruz-del-norte',
        nombre: 'Cruz del Norte Formosa', 
        direccion: 'Cruz del Norte, Formosa',
        latitud: -26.197596, 
        longitud: -58.212465,
        descripcion: 'Punto de retiro en Cruz del Norte',
        horario: 'Lunes a Sábado: 9:00 - 17:00',
        telefono: '+54 370 987-6543',
        activo: true
    },
    { 
        _id: 'virgen-carmen',
        nombre: 'Monumento a la Virgen del Carmen', 
        direccion: 'Monumento a la Virgen del Carmen, Formosa',
        latitud: -26.157044, 
        longitud: -58.185414,
        descripcion: 'Punto de retiro en el monumento',
        horario: 'Lunes a Domingo: 7:00 - 19:00',
        telefono: '+54 370 555-1234',
        activo: true
    }
];

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏦 Iniciando selección de punto de recolección...');
    
    // Verificar autenticación y rol
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión como Banco de Alimentos');
        window.location.href = './login.html';
        return;
    }
    
    // Verificar rol del usuario
    try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('👤 Usuario autenticado:', payload.email, '- Rol:', payload.role);
        
        if (payload.role !== 'banco') {
            alert('Esta página es solo para usuarios con rol de Banco de Alimentos. Tu rol actual es: ' + payload.role);
            window.location.href = './vertice.html';
            return;
        }
    } catch (e) {
        console.error('Error al verificar token:', e);
        alert('Token inválido. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = './login.html';
        return;
    }
    
    // Cargar productos del sessionStorage
    const solicitudData = sessionStorage.getItem('solicitudEnProceso');
    if (!solicitudData) {
        alert('No hay productos en el carrito');
        window.location.href = './banco-donaciones.html';
        return;
    }
    
    solicitudProductos = JSON.parse(solicitudData);
    console.log('📦 Productos en solicitud:', solicitudProductos.length);
    
    // Actualizar resumen
    document.getElementById('summary-productos').textContent = `${solicitudProductos.length} productos`;
    
    // Inicializar mapa
    initMap();
    
    // Cargar puntos de pickup
    await cargarPuntosPickup();
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
});

// Inicializar mapa
function initMap() {
    // Centrar el mapa en Formosa, Argentina
    const formosaCenter = [-26.180, -58.190];
    
    map = L.map('map').setView(formosaCenter, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Cargar puntos de pickup
async function cargarPuntosPickup() {
    const listContainer = document.getElementById('pickup-points-list');
    
    try {
        // Intentar cargar desde la API primero
        const response = await fetch(`${API_URL}/api/pedidos/puntos-retiro`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                pickupPoints = data.data;
                console.log('📍 Puntos de pickup cargados desde API:', pickupPoints.length);
                renderPickupPoints();
                addMarkersToMap();
                return;
            }
        }
        
        // Si no hay puntos en la BD o hay error, usar puntos fijos
        console.log('📍 Usando puntos de retiro fijos predefinidos');
        pickupPoints = PUNTOS_RETIRO_FIJOS;
        
        renderPickupPoints();
        addMarkersToMap();
        
    } catch (error) {
        console.error('❌ Error al cargar puntos de pickup:', error);
        // Fallback: usar puntos fijos
        console.log('📍 Fallback: usando puntos de retiro fijos');
        pickupPoints = PUNTOS_RETIRO_FIJOS;
        
        renderPickupPoints();
        addMarkersToMap();
    }
}

// Renderizar lista de puntos de pickup
function renderPickupPoints() {
    const listContainer = document.getElementById('pickup-points-list');
    
    if (pickupPoints.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay puntos de recolección disponibles</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = pickupPoints.map(punto => `
        <div class="pickup-item" onclick="seleccionarPickup('${punto._id}')">
            <h4><i class="fas fa-map-marker-alt me-2 text-success"></i>${punto.nombre}</h4>
            <p><i class="fas fa-map-pin me-2"></i>${punto.direccion}</p>
            ${punto.horario ? `<p><i class="fas fa-clock me-2"></i>${punto.horario}</p>` : ''}
            ${punto.telefono ? `<p><i class="fas fa-phone me-2"></i>${punto.telefono}</p>` : ''}
        </div>
    `).join('');
}

// Agregar marcadores al mapa
function addMarkersToMap() {
    // Crear icono personalizado verde (mismo que consumidor)
    const iconoVerde = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
                <path fill="#008744" stroke="#00562e" stroke-width="1.5" d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/>
                <circle fill="white" cx="12" cy="9" r="3.5"/>
            </svg>
        `),
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });
    
    // Agregar marcadores para cada punto
    pickupPoints.forEach(punto => {
        if (punto.latitud && punto.longitud) {
            const marker = L.marker([punto.latitud, punto.longitud], { icon: iconoVerde })
                .addTo(map)
                .bindPopup(`
                    <h5 style="font-family: 'Montserrat', sans-serif; margin: 0; color: #008744;">${punto.nombre}</h5>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${punto.direccion || ''}</p>
                    ${punto.horario ? `<p style="margin: 5px 0 0 0; font-size: 0.85em;"><i class="fas fa-clock"></i> ${punto.horario}</p>` : ''}
                `);
            
            marker.on('click', () => {
                seleccionarPickup(punto._id);
            });
            
            markers.push(marker);
        }
    });
}

// Seleccionar punto de pickup
function seleccionarPickup(pickupId) {
    selectedPickup = pickupPoints.find(p => p._id === pickupId);
    
    if (!selectedPickup) return;
    
    console.log('✅ Pickup seleccionado:', selectedPickup.nombre);
    
    // Actualizar UI - marcar como seleccionado
    document.querySelectorAll('.pickup-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.pickup-item').classList.add('selected');
    
    // Centrar mapa en el punto seleccionado
    if (selectedPickup.latitud && selectedPickup.longitud) {
        map.setView([selectedPickup.latitud, selectedPickup.longitud], 15);
    }
    
    // Actualizar resumen
    document.getElementById('summary-pickup').textContent = selectedPickup.nombre;
    document.getElementById('summary-box').style.display = 'block';
    
    // Activar paso 2 (horario)
    document.getElementById('step-horario').classList.add('active');
    
    // Mostrar sección de horarios
    mostrarSeccionHorarios();
}

// Mostrar sección de horarios
function mostrarSeccionHorarios() {
    const scheduleSection = document.getElementById('schedule-section');
    const scheduleSlotsContainer = document.getElementById('schedule-slots');
    
    scheduleSection.style.display = 'block';
    
    // Generar horarios disponibles (ejemplo: de 8am a 6pm cada 2 horas)
    const horarios = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00'
    ];
    
    scheduleSlotsContainer.innerHTML = horarios.map(horario => `
        <div class="schedule-slot" onclick="seleccionarHorario('${horario}')">
            <i class="fas fa-clock mb-2"></i><br>
            ${horario}
        </div>
    `).join('');
    
    // Scroll suave hacia la sección de horarios
    scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Seleccionar horario
function seleccionarHorario(horario) {
    selectedHorario = horario;
    
    console.log('✅ Horario seleccionado:', horario);
    
    // Actualizar UI
    document.querySelectorAll('.schedule-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Actualizar resumen
    document.getElementById('summary-horario').textContent = horario;
    
    // Activar paso 3 (confirmar)
    document.getElementById('step-confirmar').classList.add('active');
    
    // Habilitar botón de confirmar
    document.getElementById('btn-confirmar').disabled = false;
}

// Confirmar solicitud
async function confirmarSolicitud() {
    if (!selectedPickup || !selectedHorario) {
        alert('Por favor, selecciona un punto de recolección y un horario');
        return;
    }
    
    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            window.location.href = './login.html';
            return;
        }
        
        // Decodificar token para ver el rol del usuario
        try {
            const tokenParts = token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('👤 Usuario del token:', {
                email: payload.email,
                role: payload.role,
                id: payload.id
            });
        } catch (e) {
            console.error('Error al decodificar token:', e);
        }
        
        // Preparar datos del pedido
        console.log('📦 Productos en solicitud (raw):', solicitudProductos);
        
        const pedidoData = {
            productos: solicitudProductos.map(p => ({
                producto_id: p.producto_id || p.id,
                cantidad: p.cantidad || 1
            })),
            punto_pickup_id: selectedPickup._id,
            horario_retiro: selectedHorario,
            notas: 'Solicitud de donación para banco de alimentos'
        };
        
        console.log('📤 Enviando solicitud:', pedidoData);
        console.log('📤 Productos mapeados:', pedidoData.productos);
        console.log('📤 URL:', `${API_URL}/api/pedidos/crear`);
        console.log('📤 Token presente:', !!token);
        
        const response = await fetch(`${API_URL}/api/pedidos/crear`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers.get('content-type'));
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ Respuesta no es JSON:', textResponse);
            throw new Error('El servidor no respondió correctamente. Por favor, verifica que el backend esté funcionando.');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || result.error || 'Error al crear solicitud');
        }
        
        console.log('✅ Solicitud creada:', result);
        
        // Limpiar carrito y sessionStorage
        localStorage.removeItem('donacionesCart');
        sessionStorage.removeItem('solicitudEnProceso');
        
        // Mostrar notificación elegante
        mostrarNotificacionExito();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = './banco.mis-pedidos.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error al confirmar solicitud:', error);
        mostrarNotificacionError(error.message);
        
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="fas fa-check-circle me-2"></i>Confirmar Solicitud';
    }
}

// Mostrar notificación de éxito
function mostrarNotificacionExito() {
    const notificacion = document.createElement('div');
    notificacion.className = 'toast-notification-success';
    notificacion.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle fa-2x"></i>
            <div class="toast-text">
                <h4>¡Solicitud enviada con éxito!</h4>
                <p>Puedes ver el estado en "Mis Solicitudes"</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification-success {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 135, 68, 0.3);
            z-index: 10000;
            animation: scaleIn 0.3s ease-out;
            border: 3px solid #28a745;
        }
        
        .toast-notification-error {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(220, 53, 69, 0.3);
            z-index: 10000;
            animation: scaleIn 0.3s ease-out;
            border: 3px solid #dc3545;
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .toast-content i {
            color: #28a745;
        }
        
        .toast-notification-error .toast-content i {
            color: #dc3545;
        }
        
        .toast-text h4 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
        }
        
        .toast-text p {
            margin: 0;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.7);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

// Mostrar notificación de error
function mostrarNotificacionError(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'toast-notification-error';
    notificacion.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-circle fa-2x"></i>
            <div class="toast-text">
                <h4>Error al enviar solicitud</h4>
                <p>${mensaje}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 4000);
}

// Volver al carrito
function volverAlCarrito() {
    window.history.back();
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Exportar funciones globales
window.seleccionarPickup = seleccionarPickup;
window.seleccionarHorario = seleccionarHorario;
window.confirmarSolicitud = confirmarSolicitud;
window.volverAlCarrito = volverAlCarrito;
