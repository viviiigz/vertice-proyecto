// banco-mis-pedidos.js - Gestión de solicitudes de donación para bancos de alimentos

const API_URL = 'http://localhost:3000';
let allPedidos = [];
let currentFilter = 'todos';

// Cargar pedidos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏦 Iniciando vista de solicitudes de banco...');
    await cargarPedidos();
    setupFilterButtons();
    actualizarContadorCarrito();
});

// Configurar botones de filtro
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-tab');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover active de todos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar active al clickeado
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;
            renderPedidos(filter);
        });
    });
}

// Cargar pedidos desde el backend
async function cargarPedidos() {
    const loadingEl = document.getElementById('loading');
    const emptyStateEl = document.getElementById('empty-state');
    const pedidosListEl = document.getElementById('pedidos-list');

    try {
        loadingEl.style.display = 'block';
        emptyStateEl.style.display = 'none';
        pedidosListEl.style.display = 'none';

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No hay token de autenticación');
            window.location.href = './login.html';
            return;
        }

        const response = await fetch(`${API_URL}/api/pedidos/consumidor`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Pedidos recibidos:', data);

        allPedidos = data.data || data.pedidos || [];
        console.log('📦 Total de solicitudes:', allPedidos.length);
        
        // Debug: Ver estructura de pedidos
        if (allPedidos.length > 0) {
            console.log('🔍 Primer pedido completo:', allPedidos[0]);
            console.log('🔍 Campos pickup:', {
                punto_pickup_nombre: allPedidos[0].punto_pickup_nombre,
                puntoDeRetiro: allPedidos[0].puntoDeRetiro,
                horario_retiro: allPedidos[0].horario_retiro,
                horarioRetiro: allPedidos[0].horarioRetiro
            });
        }
        
        loadingEl.style.display = 'none';

        if (allPedidos.length === 0) {
            emptyStateEl.style.display = 'block';
        } else {
            pedidosListEl.style.display = 'flex';
            renderPedidos(currentFilter);
        }

    } catch (error) {
        console.error('❌ Error al cargar pedidos:', error);
        loadingEl.style.display = 'none';
        emptyStateEl.style.display = 'block';
        
        // Mostrar error más amigable
        emptyStateEl.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #f39c12; margin-bottom: 1.5rem;"></i>
            <h2 style="color: #2c3e50; margin-bottom: 1rem;">Error al cargar solicitudes</h2>
            <p style="color: #7f8c8d; margin-bottom: 2rem;">Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.</p>
            <button class="btn btn-primary" onclick="location.reload()" style="padding: 12px 30px; border-radius: 25px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s;">
                <i class="fas fa-sync-alt me-2"></i> Reintentar Conexión
            </button>
        `;
    }
}

// Renderizar pedidos según filtro
function renderPedidos(filter = 'todos') {
    const pedidosListEl = document.getElementById('pedidos-list');
    
    let pedidosFiltrados = allPedidos;
    
    if (filter !== 'todos') {
        pedidosFiltrados = allPedidos.filter(pedido => {
            const estado = pedido.estado.toLowerCase();
            return estado === filter.toLowerCase();
        });
    }

    console.log(`🔍 Mostrando ${pedidosFiltrados.length} pedidos con filtro: ${filter}`);

    if (pedidosFiltrados.length === 0) {
        pedidosListEl.innerHTML = `
            <div class="empty-state w-100">
                <i class="fas fa-filter" style="font-size: 3rem; color: #bdc3c7;"></i>
                <h3>No hay solicitudes ${filter !== 'todos' ? `en estado "${filter}"` : ''}</h3>
                <p>Prueba con otro filtro o realiza una nueva solicitud.</p>
            </div>
        `;
        return;
    }

    pedidosListEl.innerHTML = pedidosFiltrados.map(pedido => createPedidoCard(pedido)).join('');
}

// Crear tarjeta de pedido
function createPedidoCard(pedido) {
    const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const estadoClass = `estado-${pedido.estado.toLowerCase()}`;
    const estadoTexto = pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1);

    // Información del comercio (donante)
    // El backend puede devolver comercio_id o comercianteId
    const comercio = pedido.comercianteId || pedido.comercio_id || {};
    const comercioNombre = comercio.username || comercio.nombre || 'Comercio';
    const comercioEmail = comercio.email || '';

    // Información de pickup
    const pickup = pedido.punto_pickup_id || {};
    
    // PRIORIDAD: Usar punto_pickup_nombre primero (es el nombre legible)
    // puntoDeRetiro contiene el ID, NO el nombre
    const pickupNombre = pedido.punto_pickup_nombre || pickup.nombre || 'No especificado';
    const pickupDireccion = pedido.punto_pickup_direccion || pickup.direccion || '';

    // Total de productos
    const totalProductos = pedido.productos.reduce((sum, p) => sum + p.cantidad, 0);

    return `
        <div class="pedido-card">
            <div class="pedido-header-card">
                <div>
                    <div class="pedido-id">Solicitud #${pedido._id.slice(-8).toUpperCase()}</div>
                    <small class="text-muted"><i class="fas fa-calendar-alt me-1"></i>${fecha}</small>
                </div>
                <span class="pedido-estado ${estadoClass}">
                    ${getEstadoIcon(pedido.estado)} ${estadoTexto}
                </span>
            </div>

            <div class="comerciante-info">
                <div class="comerciante-avatar bg-success text-white d-flex align-items-center justify-content-center fw-bold">
                    <i class="fas fa-store"></i>
                </div>
                <div class="comerciante-detalles flex-grow-1">
                    <h4 class="mb-1">${comercioNombre}</h4>
                    <p class="mb-0"><i class="fas fa-envelope me-1"></i> ${comercioEmail}</p>
                </div>
            </div>

            <div class="pedido-info">
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-box me-1"></i>Total Productos</span>
                    <span class="info-value">${totalProductos} productos</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-map-marker-alt me-1"></i>Punto de Recolección</span>
                    <span class="info-value">${pickupNombre}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-clock me-1"></i>Horario</span>
                    <span class="info-value">${pedido.horario_retiro || pedido.horarioRetiro || 'Por coordinar'}</span>
                </div>
            </div>

            <div class="pedido-productos">
                <h4><i class="fas fa-list-ul me-2"></i>Productos Solicitados</h4>
                ${pedido.productos.map(producto => createProductoItem(producto)).join('')}
            </div>

            ${pedido.notas ? `
                <div class="alert alert-info">
                    <i class="fas fa-sticky-note me-2"></i>
                    <strong>Notas:</strong> ${pedido.notas}
                </div>
            ` : ''}

            <div class="d-flex gap-2 justify-content-end mt-3">
                <button class="btn btn-outline-secondary btn-sm" onclick="verDetallePedido('${pedido._id}')">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
                ${pedido.estado === 'pendiente' ? `
                    <button class="btn btn-outline-danger btn-sm" onclick="cancelarPedido('${pedido._id}')">
                        <i class="fas fa-times"></i> Cancelar Solicitud
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Crear item de producto
function createProductoItem(producto) {
    const productoData = producto.producto_id || {};
    const nombre = productoData.nombre_producto || 'Producto';
    const imagen = productoData.foto_url 
        ? `${API_URL}/uploads/${productoData.foto_url}` 
        : './assets/imgs/alimentos.jpg';

    return `
        <div class="producto-item">
            <img src="${imagen}" alt="${nombre}" class="producto-imagen" onerror="this.src='./assets/imgs/alimentos.jpg'">
            <div class="producto-detalles">
                <div class="producto-nombre">${nombre}</div>
                <div class="producto-cantidad">
                    Cantidad: <strong>${producto.cantidad}</strong> ${productoData.unidad_medida || 'unidades'}
                </div>
            </div>
            <div class="text-success fw-bold">
                <i class="fas fa-hand-holding-heart"></i> Donación
            </div>
        </div>
    `;
}

// Obtener icono según estado
function getEstadoIcon(estado) {
    const icons = {
        pendiente: '<i class="fas fa-clock"></i>',
        aceptado: '<i class="fas fa-check-circle"></i>',
        aprobado: '<i class="fas fa-check-circle"></i>',
        rechazado: '<i class="fas fa-times-circle"></i>',
        entregado: '<i class="fas fa-box-check"></i>',
        completado: '<i class="fas fa-check-double"></i>',
        recolectado: '<i class="fas fa-truck"></i>',
        cancelado: '<i class="fas fa-ban"></i>'
    };
    return icons[estado.toLowerCase()] || '<i class="fas fa-info-circle"></i>';
}

// Ver detalle de pedido
function verDetallePedido(pedidoId) {
    console.log('👁️ Ver detalle del pedido:', pedidoId);
    // TODO: Implementar modal o página de detalle
    alert(`Ver detalle del pedido: ${pedidoId}`);
}

// Cancelar pedido
async function cancelarPedido(pedidoId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}/cancelar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cancelar pedido');
        }

        alert('✅ Solicitud cancelada correctamente');
        await cargarPedidos();

    } catch (error) {
        console.error('❌ Error al cancelar pedido:', error);
        alert('Error al cancelar la solicitud. Por favor, intenta nuevamente.');
    }
}

// Actualizar contador de carrito
function actualizarContadorCarrito() {
    const cart = JSON.parse(localStorage.getItem('donacionesCart') || '[]');
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Abrir carrito
function abrirCarrito() {
    window.location.href = './consumidor.carrito.html';
}

// Exportar funciones globales
window.verDetallePedido = verDetallePedido;
window.cancelarPedido = cancelarPedido;
window.abrirCarrito = abrirCarrito;
