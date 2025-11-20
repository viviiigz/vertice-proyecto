document.addEventListener('DOMContentLoaded', () => {
    // 0. VERIFICAR ROL DEL USUARIO
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const tokenParts = token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('👤 Usuario:', payload.email, '- Rol:', payload.role);
            
            if (payload.role !== 'banco') {
                console.warn('⚠️ Usuario no es banco, pero permitiendo acceso a vista de donaciones');
                // No redirigir, solo advertir, ya que cualquier usuario puede ver donaciones
            }
        } catch (e) {
            console.error('Error al verificar token:', e);
        }
    }
    
    // 1. ADAPTACIÓN VISUAL DEL HEADER
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.placeholder = "Buscar donaciones por lote...";
    
    // 2. CARGAR DATOS (Aquí es donde conectarás tu Backend)
    cargarDonacionesDesdeBackend();
    
    // 3. ACTUALIZAR CONTADOR DEL CARRITO
    actualizarContadorCarrito();
    
    // 4. AGREGAR EVENT LISTENER AL BOTÓN DEL CARRITO
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', abrirModalCarrito);
    }
});

// Variables globales para almacenar los datos reales
let donacionesData = []; 
let solicitudesActivas = [];

/**
 * FUNCIÓN PARA CONECTAR CON TU BACKEND
 * Aquí deberás hacer el fetch() a tu base de datos real.
 */
async function cargarDonacionesDesdeBackend() {
    try {
        const response = await fetch('http://localhost:3000/api/productos/para-donar');
        
        if (!response.ok) {
            throw new Error('Error al cargar donaciones');
        }

        const result = await response.json();
        
        if (result.success && result.productos) {
            // Transformar los productos al formato esperado por el frontend
            donacionesData = result.productos.map(producto => {
                // Construir URL completa de la imagen
                const imgUrl = producto.foto_url 
                    ? `http://localhost:3000/uploads/${producto.foto_url}` 
                    : null;
                
                return {
                    id: producto._id || producto.id,
                    producto: producto.nombre_producto || producto.nombre,
                    img: imgUrl,
                    donante: producto.user_id?.username || 'Comercio',
                    cantidad: `${producto.cantidad_disponible || 0} ${producto.unidad_medida || 'unidades'}`,
                    urgente: calcularUrgencia(producto.fecha_vencimiento),
                    tipo: producto.tipo_producto,
                    fecha_vencimiento: producto.fecha_vencimiento,
                    categoria: producto.categoria
                };
            });

            console.log(` ${donacionesData.length} donaciones cargadas desde la base de datos`);
        } else {
            donacionesData = [];
        }

        // Una vez recibidos los datos, renderizamos:
        renderDonaciones();
        actualizarMetricas();

    } catch (error) {
        console.error("Error al cargar donaciones:", error);
        const grid = document.getElementById('donaciones-grid');
        grid.innerHTML = '<p class="text-danger text-center">Error de conexión con el servidor.</p>';
    }
}

// Función para calcular si un producto es urgente (vence hoy o mañana)
function calcularUrgencia(fechaVencimiento) {
    if (!fechaVencimiento) return false;
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1; // Urgente si vence hoy o mañana
}

// Función para pintar las tarjetas en el grid
function renderDonaciones(filtro = 'todos') {
    const grid = document.getElementById('donaciones-grid');
    grid.innerHTML = ''; 

    // Si no hay datos cargados
    if (donacionesData.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-5 w-100 col-12">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay donaciones disponibles en este momento.</p>
            </div>`;
        return;
    }

    // Filtrado
    const datosFiltrados = donacionesData.filter(item => {
        if(filtro === 'todos') return true;
        if(filtro === 'urgente') return item.urgente === true;
        if(filtro === 'frescos') return item.tipo === 'frescos';
        if(filtro === 'bebidas') return item.tipo === 'bebidas';
        if(filtro === 'lacteos') return item.tipo === 'lacteos';
        if(filtro === 'secos') return item.tipo === 'secos';
        return true;
    });

    datosFiltrados.forEach(item => {
        const card = `
            <div class="col-12 col-md-6 col-lg-6 mb-3">
                <div class="donation-card shadow-sm">
                    <span class="card-badge ${item.urgente ? 'badge-urgent' : 'badge-normal'}">
                        ${item.urgente ? '<i class="fas fa-exclamation-triangle"></i> Vence Hoy' : '<i class="fas fa-check"></i> Disponible'}
                    </span>
                    
                    <div class="donation-img-container">
                        ${item.img ? `<img src="${item.img}" alt="Donación">` : '<i class="fas fa-box-open fa-3x text-muted"></i>'}
                    </div>
                    
                    <div class="donation-body">
                        <h6 class="donation-title">${item.producto}</h6>
                        <div class="donation-data">
                            <div><i class="fas fa-warehouse text-muted me-2"></i> ${item.donante}</div>
                            <div class="fw-bold text-success"><i class="fas fa-weight-hanging me-2"></i> ${item.cantidad}</div>
                        </div>
                        
                        <button class="btn btn-solicitar btn-sm" onclick="solicitarDonacion('${item.id}')">
                            Solicitar Asignación
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Función al hacer clic en "Solicitar Asignación" - Agregar al carrito
function solicitarDonacion(id) {
    const item = donacionesData.find(d => d.id === id);
    
    if (!item) {
        console.error('❌ Producto no encontrado:', id);
        return;
    }

    // Obtener carrito actual del localStorage
    let cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');

    // Verificar si ya existe en el carrito
    const existeEnCarrito = cart.find(p => p.id === id);
    if (existeEnCarrito) {
        mostrarNotificacion('Este producto ya está en tu carrito', 'warning');
        return;
    }

    // Agregar al carrito
    cart.push({
        id: item.id,
        producto_id: item.id,
        nombre: item.producto,
        imagen: item.img,
        donante: item.donante,
        cantidad: 1, // Por defecto 1, luego el usuario puede modificar
        tipo: item.tipo,
        fecha_vencimiento: item.fecha_vencimiento,
        urgente: item.urgente
    });

    // Guardar en localStorage
    localStorage.setItem('donacionesCart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
    
    // Mostrar notificación elegante
    mostrarNotificacion(`${item.producto} agregado al carrito`, 'success');
    
    console.log('✅ Producto agregado al carrito:', item.producto);
}

// Mostrar notificación toast elegante
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                font-weight: 600;
                min-width: 300px;
            }
            .toast-success {
                border-left: 4px solid #008744;
                color: #008744;
            }
            .toast-warning {
                border-left: 4px solid #f39c12;
                color: #f39c12;
            }
            .toast-notification i {
                font-size: 1.3rem;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Actualiza la sidebar derecha (Logística)
function actualizarTracking() {
    const container = document.getElementById('tracking-list');
    const badgeHeader = document.getElementById('cart-count');
    
    // Actualizar contador header
    if(badgeHeader) badgeHeader.innerText = solicitudesActivas.length;
    
    if (solicitudesActivas.length === 0) {
        container.innerHTML = '<p class="text-muted small text-center fst-italic my-4">No tienes recolecciones programadas.</p>';
        return;
    }

    container.innerHTML = '';
    solicitudesActivas.forEach(req => {
        container.innerHTML += `
            <div class="tracking-item shadow-sm">
                <div class="status-line status-pending"></div>
                <div class="d-flex justify-content-between">
                    <h6 class="mb-1">${req.producto}</h6>
                    <small class="text-warning fw-bold">Pendiente</small>
                </div>
                <p class="mb-0 small text-muted"><i class="fas fa-map-marker-alt"></i> ${req.donante}</p>
                <div class="mt-2">
                    <button class="btn btn-outline-secondary btn-sm py-0" style="font-size: 0.7rem">Ver QR</button>
                </div>
            </div>
        `;
    });
}

// Actualiza las métricas del dashboard (KPIs)
function actualizarMetricas() {
    // 1. Solicitudes Activas
    const activeCountEl = document.getElementById('active-requests-count');
    if(activeCountEl) activeCountEl.innerText = solicitudesActivas.length;
    
    // 2. Kg Recuperados (Calculo real basado en datos, si existen)
    // Si tus datos tienen una propiedad numérica para el peso (ej: item.pesoInt), úsala aquí.
    // Por ahora lo dejamos en 0 hasta que traigas datos reales.
    const kgElement = document.getElementById('kg-recovered-month');
    if(kgElement) kgElement.innerText = "0 kg"; // Conectar con lógica real luego
    
    // 3. Contar urgentes disponibles
    const urgentes = donacionesData.filter(d => d.urgente === true).length;
    const urgentElement = document.getElementById('urgent-items-count');
    if(urgentElement) urgentElement.innerText = urgentes;
}

// Función global para los botones de filtro del HTML
window.filtrar = function(criterio) {
    console.log('🔍 Filtrando por:', criterio);
    console.log('📊 Productos disponibles:', donacionesData.map(d => ({ nombre: d.producto, tipo: d.tipo })));
    
    // Actualizar estado activo de los botones
    const botones = document.querySelectorAll('.btn-group .btn');
    botones.forEach(btn => btn.classList.remove('active'));
    event?.target?.classList.add('active');
    
    renderDonaciones(criterio);
}

// ============ FUNCIONES DEL MODAL DE CARRITO ============

function abrirModalCarrito() {
    const cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    
    console.log('🛒 Abriendo carrito con', cart.length, 'productos');
    
    // Crear modal si no existe
    let modal = document.getElementById('modal-carrito');
    if (!modal) {
        modal = crearModalCarrito();
        document.body.appendChild(modal);
    }
    
    // Renderizar contenido del carrito
    renderizarCarrito(cart);
    
    // Mostrar modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function crearModalCarrito() {
    const modal = document.createElement('div');
    modal.id = 'modal-carrito';
    modal.className = 'modal-carrito-overlay';
    modal.innerHTML = `
        <div class="modal-carrito-content">
            <div class="modal-carrito-header">
                <h3><i class="fas fa-box-open me-2"></i>Mi Carrito de Donaciones</h3>
                <button class="btn-cerrar-modal" onclick="cerrarModalCarrito()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-carrito-body" id="modal-carrito-body">
                <!-- Productos se cargan aquí -->
            </div>
            <div class="modal-carrito-footer">
                <button class="btn btn-secondary" onclick="cerrarModalCarrito()">
                    <i class="fas fa-arrow-left me-2"></i>Seguir Buscando
                </button>
                <button class="btn btn-success" onclick="finalizarSolicitud()" id="btn-finalizar-solicitud">
                    <i class="fas fa-check-circle me-2"></i>Finalizar Solicitud
                </button>
            </div>
        </div>
    `;
    
    // Agregar estilos del modal
    if (!document.getElementById('modal-carrito-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-carrito-styles';
        style.textContent = `
            .modal-carrito-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .modal-carrito-overlay.show {
                opacity: 1;
            }
            .modal-carrito-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 700px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease-out;
            }
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            .modal-carrito-header {
                padding: 20px 25px;
                border-bottom: 2px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-carrito-header h3 {
                margin: 0;
                color: #2c3e50;
                font-size: 1.4rem;
            }
            .btn-cerrar-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #7f8c8d;
                cursor: pointer;
                padding: 5px 10px;
                transition: color 0.2s;
            }
            .btn-cerrar-modal:hover {
                color: #2c3e50;
            }
            .modal-carrito-body {
                padding: 20px 25px;
                overflow-y: auto;
                flex: 1;
            }
            .carrito-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                margin-bottom: 15px;
                position: relative;
            }
            .carrito-item-img {
                width: 80px;
                height: 80px;
                object-fit: contain;
                border-radius: 8px;
                background: white;
                padding: 5px;
            }
            .carrito-item-info {
                flex: 1;
            }
            .carrito-item-nombre {
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            .carrito-item-donante {
                font-size: 0.9rem;
                color: #7f8c8d;
            }
            .carrito-item-urgente {
                display: inline-block;
                padding: 3px 8px;
                background: #ffebee;
                color: #c62828;
                border-radius: 5px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-top: 5px;
            }
            .btn-eliminar-item {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .btn-eliminar-item:hover {
                background: #c82333;
                transform: scale(1.1);
            }
            .carrito-vacio {
                text-align: center;
                padding: 40px 20px;
                color: #7f8c8d;
            }
            .carrito-vacio i {
                font-size: 4rem;
                margin-bottom: 15px;
                color: #bdc3c7;
            }
            .modal-carrito-footer {
                padding: 20px 25px;
                border-top: 2px solid #e9ecef;
                display: flex;
                gap: 15px;
                justify-content: space-between;
            }
            .modal-carrito-footer .btn {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 1rem;
            }
            .modal-carrito-footer .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .modal-carrito-footer .btn-secondary:hover {
                background: #5a6268;
            }
            .modal-carrito-footer .btn-success {
                background: #008744;
                color: white;
            }
            .modal-carrito-footer .btn-success:hover {
                background: #00562e;
            }
            .modal-carrito-footer .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    return modal;
}

function renderizarCarrito(cart) {
    const body = document.getElementById('modal-carrito-body');
    const btnFinalizar = document.getElementById('btn-finalizar-solicitud');
    
    if (cart.length === 0) {
        body.innerHTML = `
            <div class="carrito-vacio">
                <i class="fas fa-box-open"></i>
                <h4>Tu carrito está vacío</h4>
                <p>Agrega productos para donar desde el catálogo</p>
            </div>
        `;
        if (btnFinalizar) btnFinalizar.disabled = true;
        return;
    }
    
    if (btnFinalizar) btnFinalizar.disabled = false;
    
    body.innerHTML = cart.map((item, index) => `
        <div class="carrito-item">
            <img src="${item.imagen || './assets/imgs/alimentos.jpg'}" 
                 alt="${item.nombre}"
                 class="cart-item-image"
                 onerror="this.src='./assets/imgs/alimentos.jpg'">
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-donante">
                    <i class="fas fa-store me-1"></i>${item.donante}
                </div>
                ${item.urgente ? '<span class="carrito-item-urgente"><i class="fas fa-exclamation-triangle me-1"></i>Urgente</span>' : ''}
            </div>
            <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Agregar resumen
    body.innerHTML += `
        <div class="mt-3 p-3 bg-light rounded">
            <div class="d-flex justify-content-between align-items-center">
                <strong>Total de productos:</strong>
                <span class="badge bg-success" style="font-size: 1rem; padding: 8px 15px;">${cart.length}</span>
            </div>
        </div>
    `;
}

function cerrarModalCarrito() {
    const modal = document.getElementById('modal-carrito');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function eliminarDelCarrito(index) {
    let cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    
    if (index >= 0 && index < cart.length) {
        const productoEliminado = cart[index].nombre;
        cart.splice(index, 1);
        localStorage.setItem('donacionesCart', JSON.stringify(cart));
        
        // Actualizar vista
        renderizarCarrito(cart);
        actualizarContadorCarrito();
        
        mostrarNotificacion(`${productoEliminado} eliminado del carrito`, 'warning');
    }
}

function finalizarSolicitud() {
    const cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    
    if (cart.length === 0) {
        mostrarNotificacion('Tu carrito está vacío', 'warning');
        return;
    }
    
    console.log('✅ Procediendo a finalizar solicitud con', cart.length, 'productos');
    
    // Guardar el carrito en sessionStorage para usarlo en la siguiente página
    sessionStorage.setItem('solicitudEnProceso', JSON.stringify(cart));
    
    // Redirigir a la página de selección de pickup
    window.location.href = './banco.elegir-pickup.html';
}

// Exportar funciones globales
window.abrirModalCarrito = abrirModalCarrito;
window.cerrarModalCarrito = cerrarModalCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.finalizarSolicitud = finalizarSolicitud;