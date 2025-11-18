/**
 * mis-pedidos-consumidor.js - Vista de pedidos del consumidor
 */

const API_URL = 'http://localhost:3000/api';
let allPedidos = [];
let currentFilter = 'todos';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPedidos();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.notify.error('Debes iniciar sesión para ver tus pedidos');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    }
}

function setupEventListeners() {
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            setActiveFilter(filter);
            filterPedidos(filter);
        });
    });
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-filter="${filter}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

async function loadPedidos() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/pedidos/consumidor`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar pedidos');
        }
        
        const data = await response.json();
        allPedidos = data.data || [];
        
        document.getElementById('loading').style.display = 'none';
        
        if (allPedidos.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
        } else {
            displayPedidos(allPedidos);
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        window.notify.error('Error al cargar tus pedidos. Por favor intenta de nuevo.');
    }
}

function filterPedidos(filter) {
    let filtered = allPedidos;
    
    if (filter !== 'todos') {
        filtered = allPedidos.filter(pedido => pedido.estado === filter);
    }
    
    displayPedidos(filtered);
}

function displayPedidos(pedidos) {
    const pedidosList = document.getElementById('pedidos-list');
    const emptyState = document.getElementById('empty-state');
    
    if (pedidos.length === 0) {
        pedidosList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    pedidosList.style.display = 'flex';
    pedidosList.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const pedidoCard = createPedidoCard(pedido);
        pedidosList.appendChild(pedidoCard);
    });
}

function createPedidoCard(pedido) {
    const card = document.createElement('div');
    card.className = 'pedido-card';
    card.dataset.pedidoId = pedido._id;
    
    const fecha = new Date(pedido.createdAt).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const estadoClass = `estado-${pedido.estado}`;
    const estadoText = {
        'pendiente': 'Pendiente',
        'aceptado': 'Aceptado',
        'rechazado': 'Rechazado',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    }[pedido.estado] || pedido.estado;
    
    // Información del comerciante
    const comerciante = pedido.comercianteId || {};
    
    // Manejar fotoPerfil correctamente
    let comercianteAvatar = './assets/imgs/placeholder-user.png';
    if (comerciante.fotoPerfil) {
        // Si ya tiene el path completo, usarlo directo, sino agregar /uploads/
        if (comerciante.fotoPerfil.startsWith('http')) {
            comercianteAvatar = comerciante.fotoPerfil;
        } else if (comerciante.fotoPerfil.startsWith('/uploads/') || comerciante.fotoPerfil.startsWith('uploads/')) {
            comercianteAvatar = `http://localhost:3000/${comerciante.fotoPerfil.replace(/^\//, '')}`;
        } else {
            comercianteAvatar = `http://localhost:3000/uploads/${comerciante.fotoPerfil}`;
        }
    }
    
    // Productos
    let productosHTML = '';
    if (pedido.productos && pedido.productos.length > 0) {
        productosHTML = pedido.productos.map(item => {
            const producto = item.productoId || {};
            const imagenUrl = producto.foto_url 
                ? `http://localhost:3000/uploads/${producto.foto_url}` 
                : './assets/imgs/placeholder.png';
            
            return `
                <div class="producto-item">
                    <img src="${imagenUrl}" alt="${producto.nombre_producto || 'Producto'}" class="producto-imagen" />
                    <div class="producto-detalles">
                        <div class="producto-nombre">${producto.nombre_producto || 'Producto'}</div>
                        <div class="producto-cantidad">Cantidad: ${item.cantidad}</div>
                    </div>
                    <div class="producto-precio">$${item.precioEnElMomento.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
    
    // Acciones según el estado
    let actionsHTML = '';
    if (pedido.estado === 'aceptado') {
        actionsHTML = `
            <button class="btn btn-primary" onclick="marcarComoEntregado('${pedido._id}')">
                <i class="fas fa-check"></i> Marcar como Entregado
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="pedido-header-card">
            <div>
                <div class="pedido-id">Pedido #${pedido._id.slice(-8)}</div>
                <small style="color: #7f8c8d;">${fecha}</small>
            </div>
            <span class="pedido-estado ${estadoClass}">${estadoText}</span>
        </div>
        
        <div class="comerciante-info">
            <img src="${comercianteAvatar}" alt="${comerciante.username}" class="comerciante-avatar" />
            <div class="comerciante-detalles">
                <h4>${comerciante.username || 'Comerciante'}</h4>
                <p><i class="fas fa-envelope"></i> ${comerciante.email || ''}</p>
                ${comerciante.telefono ? `<p><i class="fas fa-phone"></i> ${comerciante.telefono}</p>` : ''}
            </div>
        </div>
        
        <div class="pedido-info">
            <div class="info-item">
                <span class="info-label">Punto de Retiro</span>
                <span class="info-value"><i class="fas fa-map-marker-alt"></i> ${pedido.puntoDeRetiro}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Horario</span>
                <span class="info-value"><i class="fas fa-clock"></i> ${pedido.horarioRetiro}</span>
            </div>
        </div>
        
        <div class="pedido-productos">
            <h4><i class="fas fa-box"></i> Productos</h4>
            ${productosHTML}
        </div>
        
        <div class="pedido-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">$${pedido.totalVenta.toFixed(2)}</span>
        </div>
        
        ${actionsHTML ? `<div class="pedido-actions">${actionsHTML}</div>` : ''}
    `;
    
    return card;
}

async function marcarComoEntregado(pedidoId) {
    if (!confirm('¿Confirmas que recibiste este pedido?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/pedidos/entregar/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            window.notify.success('¡Pedido marcado como entregado!');
            loadPedidos(); // Recargar
        } else {
            throw new Error(result.message || 'Error al actualizar el pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        window.notify.error(error.message || 'Error al actualizar el pedido');
    }
}

// Make function available globally
window.marcarComoEntregado = marcarComoEntregado;
