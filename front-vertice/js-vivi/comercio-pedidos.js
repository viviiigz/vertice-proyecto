// archivo: js-vivi/comercio-pedidos.js

// URL DE TU API
const API_URL = 'http://localhost:3000/api';
let allPedidos = [];
let currentFilter = 'pendiente';

/**
 * Función principal que se ejecuta cuando el HTML está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    cargarPedidos();
    configurarBotonesDeAccion();
    configurarFiltros();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.notify.error('Debes iniciar sesión como comerciante');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    }
}

function configurarFiltros() {
    const filterButtons = document.querySelectorAll('.btn-group button');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones activos
            filterButtons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
            });
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-primary');
            
            // Determinar filtro
            const btnText = btn.textContent.trim().toLowerCase();
            if (btnText.includes('pendiente')) {
                currentFilter = 'pendiente';
            } else if (btnText.includes('completado')) {
                // "Completados" incluye: aceptado, entregado
                currentFilter = 'completado';
            } else if (btnText.includes('aceptado')) {
                currentFilter = 'aceptado';
            } else if (btnText.includes('cancelado')) {
                // "Cancelados" incluye: cancelado, rechazado
                currentFilter = 'cancelado';
            } else {
                currentFilter = 'todos';
            }
            
            filtrarPedidos();
        });
    });
}

/**
 * Carga los pedidos desde la API y los muestra en la tabla
 */
async function cargarPedidos() {
    const tbody = document.getElementById('pedidos-tabla-body');
    if (!tbody) {
        console.error("Error: Elemento 'pedidos-tabla-body' no encontrado.");
        return;
    }

    const token = localStorage.getItem('token');
    
    // Muestra un spinner de Bootstrap mientras carga
    const spinnerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Cargando pedidos...</p>
            </td>
        </tr>
    `;
    tbody.innerHTML = spinnerHTML;

    try {
        const respuesta = await fetch(`${API_URL}/pedidos/comerciante`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }); 
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}: No se pudieron cargar los pedidos`);
        }

        const data = await respuesta.json();
        allPedidos = data.data || [];
        tbody.innerHTML = ''; // Limpia el spinner

        if (allPedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No tienes pedidos.</td></tr>';
            return;
        }

        filtrarPedidos();

    } catch (error) {
        console.error('Error en cargarPedidos:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
}

function filtrarPedidos() {
    let filtered = allPedidos;
    
    if (currentFilter === 'completado') {
        // Completados: aceptado + entregado
        filtered = allPedidos.filter(pedido => 
            pedido.estado === 'aceptado' || pedido.estado === 'entregado'
        );
    } else if (currentFilter === 'cancelado') {
        // Cancelados: cancelado + rechazado
        filtered = allPedidos.filter(pedido => 
            pedido.estado === 'cancelado' || pedido.estado === 'rechazado'
        );
    } else if (currentFilter !== 'todos') {
        // Filtro específico
        filtered = allPedidos.filter(pedido => pedido.estado === currentFilter);
    }
    
    mostrarPedidos(filtered);
}

function mostrarPedidos(pedidos) {
    const tbody = document.getElementById('pedidos-tabla-body');
    tbody.innerHTML = '';
    
    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No hay pedidos con el filtro seleccionado.</td></tr>`;
        return;
    }
    
    pedidos.forEach(pedido => {
        const consumidor = pedido.consumidorId || {};
        const nombreCliente = consumidor.username || 'Cliente no disponible';
        const puntoRetiro = pedido.puntoDeRetiro || 'Punto no especificado';

        // Define el badge de estado
        let estadoBadge = '';
        if (pedido.estado === 'pendiente') {
            estadoBadge = '<span class="badge bg-warning text-dark">Pendiente</span>';
        } else if (pedido.estado === 'aceptado') {
            estadoBadge = '<span class="badge bg-info">Aceptado</span>';
        } else if (pedido.estado === 'entregado') {
            estadoBadge = '<span class="badge bg-success">Entregado</span>';
        } else if (pedido.estado === 'rechazado') {
            estadoBadge = '<span class="badge bg-danger">Rechazado</span>';
        } else if (pedido.estado === 'cancelado') {
            estadoBadge = '<span class="badge bg-secondary">Cancelado</span>';
        } else {
            estadoBadge = `<span class="badge bg-secondary">${pedido.estado}</span>`;
        }

        // Define los botones de acción
        let botonesAccion = '';
        if (pedido.estado === 'pendiente') {
            botonesAccion = `
                <button class="btn btn-success btn-sm btn-aceptar me-1" title="Aceptar Pedido" data-id="${pedido._id}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-rechazar" title="Rechazar Pedido" data-id="${pedido._id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (pedido.estado === 'aceptado') {
            botonesAccion = `
                <button class="btn btn-primary btn-sm btn-entregar me-1" title="Marcar como Entregado" data-id="${pedido._id}">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="btn btn-secondary btn-sm btn-cancelar" title="Cancelar Pedido" data-id="${pedido._id}">
                    <i class="fas fa-ban"></i>
                </button>
            `;
        }

        // Crea la nueva fila (tr)
        const fila = document.createElement('tr');
        fila.id = `pedido-${pedido._id}`;
        fila.innerHTML = `
            <td>${nombreCliente}<br><small class="text-muted">${consumidor.email || ''}</small></td>
            <td>#${pedido._id.slice(-6)}<br><small class="text-muted">${pedido.productos.length} producto(s)</small></td>
            <td><strong>$${pedido.totalVenta.toFixed(2)}</strong></td>
            <td>${puntoRetiro}</td>
            <td>${pedido.horarioRetiro}</td>
            <td>${estadoBadge}</td>
            <td>${botonesAccion}</td>
        `;
        
        tbody.appendChild(fila);
    });
}

/**
 * Agrega los 'listeners' a la tabla para los botones de acción
 */
function configurarBotonesDeAccion() {
    const tablaPedidos = document.getElementById('pedidos-tabla-body');

    if (tablaPedidos) {
        tablaPedidos.addEventListener('click', async (e) => {
            const botonAceptar = e.target.closest('.btn-aceptar');
            const botonRechazar = e.target.closest('.btn-rechazar');
            const botonCancelar = e.target.closest('.btn-cancelar');
            const botonEntregar = e.target.closest('.btn-entregar');

            if (botonAceptar) {
                const id = botonAceptar.dataset.id;
                await manejarActualizacionPedido(id, 'aceptar');
            }

            if (botonRechazar) {
                const id = botonRechazar.dataset.id;
                if (confirm('¿Estás seguro de rechazar este pedido?')) {
                    await manejarActualizacionPedido(id, 'rechazar');
                }
            }

            if (botonCancelar) {
                const id = botonCancelar.dataset.id;
                if (confirm('¿Estás seguro de cancelar este pedido?')) {
                    await manejarActualizacionPedido(id, 'cancelar');
                }
            }

            if (botonEntregar) {
                const id = botonEntregar.dataset.id;
                await manejarActualizacionPedido(id, 'entregar');
            }
        });
    }
}

/**
 * Llama a la API para actualizar el estado del pedido y actualiza la UI
 */
async function manejarActualizacionPedido(id, accion) {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/pedidos/${accion}/${id}`;

    try {
        const respuesta = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(result.message || `Error al ${accion} el pedido`);
        }

        window.notify.success(result.message || 'Pedido actualizado exitosamente');
        
        // Recargar pedidos
        await cargarPedidos();

    } catch (error) {
        console.error('Error en manejarActualizacionPedido:', error);
        window.notify.error(error.message || `Hubo un error al ${accion} el pedido.`);
    }
}