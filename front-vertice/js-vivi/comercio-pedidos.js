// archivo: js/comercio-pedidos.js

// 1. URL DE TU API (La ruta que devuelve los pedidos del comerciante)
const API_URL = '/api/pedidos/comerciante'; 

/**
 * Función principal que se ejecuta cuando el HTML está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();
    configurarBotonesDeAccion();
});

/**
 * Carga los pedidos desde la API y los muestra en la tabla
 */
async function cargarPedidos() {
    const tbody = document.getElementById('pedidos-tabla-body');
    if (!tbody) {
        console.error("Error: Elemento 'pedidos-tabla-body' no encontrado.");
        return;
    }

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
        const respuesta = await fetch(API_URL); 
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}: No se pudieron cargar los pedidos`);
        }

        const pedidos = await respuesta.json();
        tbody.innerHTML = ''; // Limpia el spinner

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No tienes pedidos pendientes.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const nombreCliente = pedido.consumidorId?.nombre || 'Cliente no disponible';
            
            // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
            // Leemos el String simple 'puntoDeRetiro'
            const puntoRetiro = pedido.puntoDeRetiro || 'Punto no especificado';
            // --- FIN DEL CAMBIO ---

            // Define el badge de estado
            let estadoBadge = '';
            if (pedido.estado === 'pendiente') {
                estadoBadge = '<span class="badge bg-warning text-dark">Pendiente</span>';
            } else if (pedido.estado === 'completado') {
                estadoBadge = '<span class="badge bg-success">Completado</span>';
            } else {
                estadoBadge = '<span class="badge bg-danger">Cancelado</span>';
            }

            // Define los botones de acción
            let botonesAccion = '';
            if (pedido.estado === 'pendiente') {
                botonesAccion = `
                    <button class="btn btn-success btn-sm btn-completar" title="Completar Pedido" data-id="${pedido._id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-cancelar" title="Cancelar Pedido" data-id="${pedido._id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }

            // Crea la nueva fila (tr)
            const fila = document.createElement('tr');
            fila.id = `pedido-${pedido._id}`;
            fila.innerHTML = `
                <td>${nombreCliente}</td>
                <td>${pedido.productos.length} productos</td>
                <td>$${pedido.totalVenta}</td>
                <td>${puntoRetiro}</td> <td>${pedido.horarioRetiro}</td>
                <td>${estadoBadge}</td>
                <td>${botonesAccion}</td>
            `;
            
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error('Error en cargarPedidos:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
}

/**
 * Agrega los 'listeners' a la tabla para los botones de acción
 */
function configurarBotonesDeAccion() {
    const tablaPedidos = document.getElementById('pedidos-tabla-body');

    if (tablaPedidos) {
        tablaPedidos.addEventListener('click', async (e) => {
            const botonCompletar = e.target.closest('.btn-completar');
            const botonCancelar = e.target.closest('.btn-cancelar');

            if (botonCompletar) {
                const id = botonCompletar.dataset.id;
                await manejarActualizacionPedido(id, 'completar');
            }

            if (botonCancelar) {
                const id = botonCancelar.dataset.id;
                await manejarActualizacionPedido(id, 'cancelar');
            }
        });
    }
}

/**
 * Llama a la API para actualizar el estado del pedido y actualiza la UI
 */
async function manejarActualizacionPedido(id, accion) {
    // accion debe ser 'completar' o 'cancelar'
    const url = `/api/pedidos/${accion}/${id}`;

    try {
        const respuesta = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!respuesta.ok) {
            throw new Error(`Error al ${accion} el pedido`);
        }

        // Actualiza la UI sin recargar la página
        const filaPedido = document.getElementById(`pedido-${id}`);
        if (filaPedido) {
            const celdaEstado = filaPedido.querySelector('td:nth-child(6)');
            const celdaAcciones = filaPedido.querySelector('td:nth-child(7)');

            if (accion === 'completar') {
                celdaEstado.innerHTML = '<span class="badge bg-success">Completado</span>';
            } else {
                celdaEstado.innerHTML = '<span class="badge bg-danger">Cancelado</span>';
            }
            
            celdaAcciones.innerHTML = ''; 
        }

    } catch (error) {
        console.error('Error en manejarActualizacionPedido:', error);
        alert(`Hubo un error al ${accion} el pedido.`);
    }
}