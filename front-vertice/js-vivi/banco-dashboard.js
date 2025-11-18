document.addEventListener('DOMContentLoaded', () => {
    // 1. ADAPTACIÓN VISUAL DEL HEADER
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.placeholder = "Buscar donaciones por lote...";
    
    // 2. CARGAR DATOS (Aquí es donde conectarás tu Backend)
    cargarDonacionesDesdeBackend();
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
        // EJEMPLO DE CÓMO SERÍA LA CONEXIÓN (Descomentar cuando tengas la API):
        
        // const response = await fetch('/api/donaciones/disponibles');
        // donacionesData = await response.json();
        
        // Por ahora, si no hay backend conectado, el array sigue vacío.
        console.log("Esperando conexión con base de datos...");

        // Una vez recibidos los datos, renderizamos:
        renderDonaciones();
        actualizarMetricas();

    } catch (error) {
        console.error("Error al cargar donaciones:", error);
        const grid = document.getElementById('donaciones-grid');
        grid.innerHTML = '<p class="text-danger text-center">Error de conexión con el servidor.</p>';
    }
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
        if(filtro === 'urgente') return item.urgente === true; // Asumiendo que tu BD devuelve booleano
        if(filtro === 'secos') return item.tipo === 'secos'; // Asumiendo campo 'tipo'
        return true;
    });

    datosFiltrados.forEach(item => {
        // HTML de la Tarjeta Dinámica
        // Nota: Asegúrate de que los nombres de las propiedades (item.producto, item.img, etc.)
        // coincidan con los que vienen de tu Base de Datos.
        const card = `
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
                    
                    <button class="btn btn-solicitar btn-sm" onclick="solicitarDonacion(${item.id})">
                        Solicitar Asignación
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Función al hacer clic en "Solicitar"
function solicitarDonacion(id) {
    const item = donacionesData.find(d => d.id === id);
    
    if (!item) return;

    // Evitar duplicados en el frontend
    if(solicitudesActivas.some(s => s.id === id)) {
        alert("Ya has solicitado este lote.");
        return;
    }

    // AQUÍ TAMBIÉN DEBERÍAS HACER UN FETCH POST AL BACKEND PARA GUARDAR LA SOLICITUD
    // await fetch('/api/solicitar', { method: 'POST', body: JSON.stringify({ id }) });

    solicitudesActivas.push(item);
    
    alert(`✅ Solicitud Confirmada para: ${item.producto}`);
    
    actualizarTracking();
    actualizarMetricas();
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
    renderDonaciones(criterio);
}