/**
 * elegir-pickup.js - Página de selección de punto de retiro y horario
 */

const API_URL = 'http://localhost:3000/api';
let map;
let selectedPickupPoint = null;
let puntosRetiro = [];

// Puntos de retiro fijos (mismos que comercio-pickup.html)
const PUNTOS_RETIRO_FIJOS = [
    { 
        nombre: 'Plaza San Martín (Centro)', 
        direccion: 'Plaza San Martín, Centro, Formosa',
        latitud: -26.185145, 
        longitud: -58.174520,
        descripcion: 'Punto de retiro en el centro de la ciudad',
        activo: true
    },
    { 
        nombre: 'Cruz del Norte Formosa', 
        direccion: 'Cruz del Norte, Formosa',
        latitud: -26.197596, 
        longitud: -58.212465,
        descripcion: 'Punto de retiro en Cruz del Norte',
        activo: true
    },
    { 
        nombre: 'Monumento a la Virgen del Carmen', 
        direccion: 'Monumento a la Virgen del Carmen, Formosa',
        latitud: -26.157044, 
        longitud: -58.185414,
        descripcion: 'Punto de retiro en el monumento',
        activo: true
    }
];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrderSummary();
    loadPickupPoints();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.notify.error('Debes iniciar sesión para continuar');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    }
}

function setupEventListeners() {
    const form = document.getElementById('pickup-form');
    if (form) {
        form.addEventListener('submit', handleSubmitOrder);
    }

    const horarioSelect = document.getElementById('horario-retiro');
    if (horarioSelect) {
        horarioSelect.addEventListener('change', validateForm);
    }
}

function loadOrderSummary() {
    const cart = window.cartManager.getCart();
    
    if (!cart || cart.items.length === 0) {
        window.notify.warning('Tu carrito está vacío');
        setTimeout(() => {
            window.location.href = './vista-producto-user.html';
        }, 2000);
        return;
    }

    const total = cart.items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    
    document.getElementById('items-count').textContent = `${cart.count} producto(s)`;
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
}

async function loadPickupPoints() {
    try {
        // Intentar cargar desde la API primero
        const response = await fetch(`${API_URL}/pedidos/puntos-retiro`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                puntosRetiro = data.data;
                initMap();
                displayPickupPoints();
                return;
            }
        }
        
        // Si no hay puntos en la BD o hay error, usar puntos fijos
        console.log('Usando puntos de retiro fijos predefinidos');
        puntosRetiro = PUNTOS_RETIRO_FIJOS;
        
        initMap();
        displayPickupPoints();
        
    } catch (error) {
        console.error('Error al cargar puntos de retiro:', error);
        // En caso de error, usar puntos fijos como fallback
        console.log('Fallback: usando puntos de retiro fijos');
        puntosRetiro = PUNTOS_RETIRO_FIJOS;
        
        initMap();
        displayPickupPoints();
    }
}

function initMap() {
    // Centrar el mapa en Formosa, Argentina (promedio de los 3 nuevos puntos)
    const formosaCenter = [-26.180, -58.190];
    
    map = L.map('map').setView(formosaCenter, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Crear icono personalizado verde (mismo que comercio-pickup.js)
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
    
    // Agregar marcadores para cada punto
    puntosRetiro.forEach(punto => {
        const marker = L.marker([punto.latitud, punto.longitud], { icon: iconoVerde })
            .addTo(map)
            .bindPopup(`
                <h5 style="font-family: 'Montserrat', sans-serif; margin: 0; color: #4cd309;">${punto.nombre}</h5>
                <p style="margin: 5px 0 0 0; font-size: 0.9em;">${punto.direccion || ''}</p>
            `);
        
        marker.on('click', () => {
            selectPickupPoint(punto.nombre);
        });
    });
}

function displayPickupPoints() {
    const pickupList = document.getElementById('pickup-list');
    pickupList.innerHTML = '';
    
    puntosRetiro.forEach(punto => {
        const option = document.createElement('div');
        option.className = 'pickup-option';
        option.dataset.puntoNombre = punto.nombre;
        
        option.innerHTML = `
            <input type="radio" name="pickup" value="${punto.nombre}" class="pickup-radio" id="pickup-${punto._id}">
            <div class="pickup-details">
                <h3>${punto.nombre}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${punto.direccion}</p>
                ${punto.descripcion ? `<p><i class="fas fa-info-circle"></i> ${punto.descripcion}</p>` : ''}
            </div>
        `;
        
        option.addEventListener('click', () => {
            selectPickupPoint(punto.nombre);
        });
        
        pickupList.appendChild(option);
    });
}

function selectPickupPoint(nombrePunto) {
    selectedPickupPoint = nombrePunto;
    
    // Actualizar UI
    document.querySelectorAll('.pickup-option').forEach(opt => {
        opt.classList.remove('selected');
        const radio = opt.querySelector('.pickup-radio');
        if (radio) radio.checked = false;
    });
    
    const selectedOption = document.querySelector(`[data-punto-nombre="${nombrePunto}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        const radio = selectedOption.querySelector('.pickup-radio');
        if (radio) radio.checked = true;
    }
    
    validateForm();
}

function validateForm() {
    const horario = document.getElementById('horario-retiro').value;
    const submitBtn = document.getElementById('submit-order-btn');
    
    if (selectedPickupPoint && horario) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

async function handleSubmitOrder(e) {
    e.preventDefault();
    
    const horario = document.getElementById('horario-retiro').value;
    
    if (!selectedPickupPoint || !horario) {
        showAlert('Por favor selecciona un punto de retiro y un horario', 'error');
        return;
    }
    
    const cart = window.cartManager.getCart();
    const token = localStorage.getItem('token');
    
    if (!cart || cart.items.length === 0) {
        showAlert('Tu carrito está vacío', 'error');
        return;
    }
    
    // Obtener commerceId del primer producto del carrito
    let commerceId = cart.items[0].user_id;
    
    // 🔧 FIX: Si no tiene user_id (carrito antiguo), obtenerlo de la API
    if (!commerceId) {
        console.log('⚠️ Carrito antiguo detectado, obteniendo user_id desde API...');
        
        try {
            const firstProductId = cart.items[0].id;
            const response = await fetch(`${API_URL}/productos/${firstProductId}`);
            
            if (!response.ok) {
                throw new Error('No se pudo obtener información del producto');
            }
            
            const product = await response.json();
            
            // Extraer solo el ID del objeto user_id (puede ser objeto poblado o string)
            if (typeof product.user_id === 'object' && product.user_id !== null) {
                commerceId = product.user_id._id || product.user_id.id;
            } else {
                commerceId = product.user_id;
            }
            
            if (!commerceId) {
                throw new Error('El producto no tiene comerciante asociado');
            }
            
            console.log('✓ commerceId obtenido desde API:', commerceId);
            
        } catch (error) {
            console.error('Error al obtener commerceId:', error);
            
            // Mostrar mensaje amigable con opción de solución
            showAlert('Tu carrito tiene productos antiguos. Haz clic en "Aceptar" para vaciar el carrito y volver a agregar productos.', 'warning');
            
            // Ofrecer solución automática
            setTimeout(() => {
                if (confirm('¿Deseas vaciar el carrito y volver a la tienda?\n\n(Los productos antiguos no son compatibles con el nuevo sistema)')) {
                    window.cartManager.clearCart();
                    window.notify.success('Carrito vaciado. Ahora puedes agregar productos nuevamente.');
                    setTimeout(() => {
                        window.location.href = './vista-producto-user.html';
                    }, 2000);
                }
            }, 1000);
            
            return;
        }
    }
    
    // Validar que todos los productos sean del mismo comerciante
    // (Usar commerceId obtenido, ya sea del carrito o de la API)
    const todosMismoComerciante = cart.items.every(item => {
        const itemCommerceId = item.user_id || commerceId; // Fallback al obtenido
        return itemCommerceId === commerceId;
    });
    
    if (!todosMismoComerciante) {
        showAlert('Error: Todos los productos deben ser del mismo comerciante', 'error');
        return;
    }
    
    // Preparar datos del pedido
    const total = cart.items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    
    const pedidoData = {
        comercianteId: commerceId,
        puntoRetiro: selectedPickupPoint,
        horarioRetiro: horario,
        totalVenta: total,
        productos: cart.items.map(item => ({
            productoId: item.id,
            cantidad: item.quantity,
            precioEnElMomento: item.precio
        }))
    };
    
    console.log('Enviando pedido:', pedidoData); // Debug
    
    // Enviar pedido
    try {
        const submitBtn = document.getElementById('submit-order-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        const response = await fetch(`${API_URL}/pedidos/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pedidoData)
        });
        
        const result = await response.json();
        
        console.log('Respuesta del servidor:', result); // Debug
        
        if (response.ok && result.success) {
            // Vaciar carrito
            window.cartManager.clearCart();
            
            // Mostrar mensaje de éxito
            showAlert(result.message || 'Pedido creado exitosamente', 'success');
            
            // Redirigir a mis pedidos después de 2 segundos
            setTimeout(() => {
                window.location.href = './consumidor.mis-pedidos.html';
            }, 2000);
        } else {
            // Mostrar el error específico del backend
            const errorMsg = result.message || 'Error al crear el pedido';
            console.error('Error del servidor:', result);
            throw new Error(errorMsg);
        }
        
    } catch (error) {
        console.error('Error completo:', error);
        
        // Mensaje más descriptivo según el tipo de error
        let errorMessage = 'Error al procesar el pedido';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        }
        
        showAlert(errorMessage, 'error');
        
        const submitBtn = document.getElementById('submit-order-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Realizar Pedido';
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    
    const alertClass = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
