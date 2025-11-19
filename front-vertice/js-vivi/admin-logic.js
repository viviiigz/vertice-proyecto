// CONFIGURACIÓN
const API_BASE = 'http://localhost:3000/api/admin'; // Ajusta si es necesario

// ELEMENTOS DOM
const solicitudesBody = document.getElementById('solicitudesBody');
const noDataRow = document.getElementById('noDataRow');
const previewFrame = document.getElementById('previewFrame');
const adminAlert = document.getElementById('adminAlert');

// BOOTSTRAP INSTANCES
let previewModal;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Modal
    const modalEl = document.getElementById('previewModal');
    if(modalEl) previewModal = new bootstrap.Modal(modalEl);

    // Cargar datos
    loadSolicitudes();

    // Configurar Logout
    setupLogout();
});

/**
 * Configuración del botón Cerrar Sesión
 */
function setupLogout() {
    const handleLogout = (e) => {
        e.preventDefault();
        if(confirm("¿Estás seguro de que quieres salir?")) {
            localStorage.removeItem('token');
            // Opcional: borrar datos de usuario
            localStorage.removeItem('user_data');
            // Redirigir al login
            window.location.href = '/login-admin.html'; // Cambia a tu ruta de login real
        }
    };

    const btnNav = document.getElementById('btnLogout');
    const btnSide = document.getElementById('btnSidebarLogout');

    if(btnNav) btnNav.addEventListener('click', handleLogout);
    if(btnSide) btnSide.addEventListener('click', handleLogout);
}

/**
 * Headers de Autenticación
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/**
 * Mostrar Alertas
 */
function showAdminAlert(message, type = 'warning') {
    adminAlert.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            ${type === 'danger' ? '<i class="fas fa-exclamation-circle me-2"></i>' : '<i class="fas fa-info-circle me-2"></i>'}
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}

/**
 * Cargar Solicitudes (Core Function)
 */
async function loadSolicitudes() {
    try {
        // Resetear tabla
        noDataRow.style.display = 'none';
        // Mostrar loader si quieres (opcional)

        const res = await fetch(`${API_BASE}/solicitudes/data`, { 
            method: 'GET',
            headers: getAuthHeaders() 
        });

        // MANEJO DE ERRORES HTTP
        if (res.status === 401 || res.status === 403) {
            showAdminAlert('Sesión expirada o no autorizada. Redirigiendo...', 'danger');
            setTimeout(() => window.location.href = '/login-admin.html', 2000);
            return;
        }

        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

        const data = await res.json();

        if (!data.success || !Array.isArray(data.solicitudes) || data.solicitudes.length === 0) {
            // Mostrar estado vacío
            noDataRow.style.display = 'table-row';
            // Actualizar badge del sidebar
            updateSidebarCount(0);
            return;
        }

        // Limpiar filas viejas (menos el noDataRow)
        while (solicitudesBody.lastElementChild && solicitudesBody.lastElementChild.id !== 'noDataRow') {
            solicitudesBody.removeChild(solicitudesBody.lastElementChild);
        }

        // Renderizar filas
        data.solicitudes.forEach(s => appendRow(s));
        updateSidebarCount(data.solicitudes.length);

    } catch (err) {
        console.error(err);
        // Si falla la conexión, mostramos alerta (O cargamos MOCK para desarrollo)
        showAdminAlert('No se pudo conectar con el servidor. Verifica tu conexión.', 'danger');
    }
}

/**
 * Crear Fila HTML
 */
function appendRow(solicitud) {
    const tr = document.createElement('tr');
    
    // Columna Nombre
    const tdName = document.createElement('td');
    tdName.className = "ps-4 fw-bold";
    tdName.innerHTML = `<div class="d-flex align-items-center">
                            <div class="bg-light rounded-circle p-2 me-2 text-success"><i class="fas fa-building"></i></div>
                            ${solicitud.username || solicitud.nombre || 'Sin Nombre'}
                        </div>`;

    // Columna Email
    const tdEmail = document.createElement('td');
    tdEmail.innerHTML = `<a href="mailto:${solicitud.email}" class="text-decoration-none text-secondary">${solicitud.email}</a>`;

    // Columna Documento
    const tdDoc = document.createElement('td');
    if (solicitud.documentoVerificacion) {
        const backendURL = 'http://localhost:3000';
        const pdfURL = `${backendURL}/uploads/${solicitud.documentoVerificacion}`;
        
        const btnDoc = document.createElement('button');
        btnDoc.className = 'btn btn-sm btn-outline-dark rounded-pill px-3';
        btnDoc.innerHTML = '<i class="fas fa-eye me-1"></i> Ver PDF';
        btnDoc.onclick = () => {
            previewFrame.src = pdfURL;
            previewModal.show();
        };
        tdDoc.appendChild(btnDoc);
    } else {
        tdDoc.innerHTML = '<span class="text-muted fst-italic small">No adjuntado</span>';
    }

    // Columna Estado (Badge)
    const tdStatus = document.createElement('td');
    tdStatus.innerHTML = '<span class="badge bg-warning text-dark">Pendiente</span>';

    // Columna Acciones
    const tdActions = document.createElement('td');
    tdActions.className = "text-end pe-4";

    const btnAccept = document.createElement('button');
    btnAccept.className = 'btn btn-success btn-sm me-2 text-white';
    btnAccept.innerHTML = '<i class="fas fa-check"></i>';
    btnAccept.title = "Aprobar";
    btnAccept.onclick = () => handleAction(solicitud, 'aceptar', tr);

    const btnReject = document.createElement('button');
    btnReject.className = 'btn btn-danger btn-sm';
    btnReject.innerHTML = '<i class="fas fa-times"></i>';
    btnReject.title = "Rechazar";
    btnReject.onclick = () => handleAction(solicitud, 'rechazar', tr);

    tdActions.appendChild(btnAccept);
    tdActions.appendChild(btnReject);

    tr.appendChild(tdName);
    tr.appendChild(tdEmail);
    tr.appendChild(tdDoc);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    solicitudesBody.appendChild(tr);
}

/**
 * Manejar Acciones (Aceptar/Rechazar)
 */
async function handleAction(solicitud, accion, rowEl) {
    const confirmMsg = accion === 'aceptar' ? 'aprobar' : 'rechazar';
    if (!confirm(`¿Confirmas que deseas ${confirmMsg} a ${solicitud.username}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/solicitudes/${solicitud._id || solicitud.id}/${accion}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const json = await res.json();

        if (res.ok && json.success) {
            // Animación de salida
            rowEl.style.transition = 'all 0.5s';
            rowEl.style.opacity = '0';
            setTimeout(() => {
                rowEl.remove();
                // Verificar si queda vacío
                if (solicitudesBody.querySelectorAll('tr').length <= 1) { 
                    noDataRow.style.display = 'table-row';
                    updateSidebarCount(0);
                }
            }, 500);
            
            showAdminAlert(`Solicitud ${accion === 'aceptar' ? 'aprobada' : 'rechazada'} con éxito.`, 'success');
        } else {
            showAdminAlert('Error al procesar la solicitud.', 'danger');
        }
    } catch (err) {
        console.error(err);
        showAdminAlert('Error de conexión.', 'danger');
    }
}

function updateSidebarCount(count) {
    const badge = document.getElementById('sidebar-badge-count');
    if(badge) badge.innerText = count;
}

/**
 * Lógica Unificada del Panel de Administración
 */


document.addEventListener('DOMContentLoaded', () => {
    setupLogout();
    routePageLogic();
});

function routePageLogic() {
    const path = window.location.pathname;

    if (path.includes('admin-solicitudes')) {
        loadSolicitudes();
    } else if (path.includes('admin-dashboard')) {
        loadDashboardMetrics();
    } else if (path.includes('admin-comercios')) {
        loadComercios();
    } else if (path.includes('admin-reportes')) {
        loadReportes();
    }
}

// --- FUNCIONES DE CARGA (Fetch Data) ---

// 1. DASHBOARD
async function loadDashboardMetrics() {
    try {
        // Simulación de fetch a /api/admin/stats
        // const res = await fetch(...)
        // const data = await res.json()
        
        // Si no hay backend, se queda en 0 (HTML por defecto)
        console.log("Cargando métricas...");
    } catch (e) { console.error(e); }
}

// 2. SOLICITUDES (La lógica que ya tenías)
async function loadSolicitudes() {
    const body = document.getElementById('solicitudesBody');
    const noData = document.getElementById('noDataRow');
    if(!body) return;

    try {
        // Fetch real aquí...
        // Si falla o está vacío:
        if(body.children.length <= 1) noData.style.display = 'table-row';
    } catch (e) { console.error(e); }
}

// 3. COMERCIOS
async function loadComercios() {
    const body = document.getElementById('comerciosBody');
    const noData = document.getElementById('noDataComercios');
    if(!body) return;

    // Como pediste SIN datos simulados, mostramos el estado vacío por defecto
    // hasta que conectes el backend.
    noData.style.display = 'table-row'; 
}

// 4. REPORTES
async function loadReportes() {
    const body = document.getElementById('reportesBody');
    const noData = document.getElementById('noDataReportes');
    if(!body) return;

    // Estado vacío por defecto
    noData.style.display = 'table-row';
}

// --- UTILIDADES ---

function setupLogout() {
    const handleLogout = (e) => {
        e.preventDefault();
        if(confirm("¿Cerrar sesión?")) {
            localStorage.removeItem('token');
            window.location.href = '/login-admin.html';
        }
    };
    const btn = document.getElementById('btnSidebarLogout');
    if(btn) btn.addEventListener('click', handleLogout);
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}