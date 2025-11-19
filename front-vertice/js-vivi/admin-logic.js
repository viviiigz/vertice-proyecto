// CONFIGURACIÓN
const API_BASE = 'http://localhost:3000/api/admin'; // Ajusta si es necesario

// BOOTSTRAP INSTANCES
let previewModal;

/**
 * Configuración del botón Cerrar Sesión
 */
function setupLogout() {
    // Obtener elementos del modal
    const logoutModalEl = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    let logoutModal;

    // Inicializar modal de Bootstrap
    if (logoutModalEl) {
        logoutModal = new bootstrap.Modal(logoutModalEl);
    }

    const handleLogoutClick = (e) => {
        e.preventDefault();
        // Mostrar modal en lugar de confirm()
        if (logoutModal) {
            logoutModal.show();
        }
    };

    const performLogout = async () => {
        try {
            // Llamar al endpoint de logout en el backend
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('http://localhost:3000/api/user/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Error al hacer logout:', error);
        } finally {
            // Limpiar datos locales independientemente del resultado
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            // Cerrar modal si está abierto
            if (logoutModal) {
                logoutModal.hide();
            }
            // Redirigir al login
            window.location.href = '/login.html';
        }
    };

    // Event listeners para los botones de logout
    const btnNav = document.getElementById('btnLogout');
    const btnSide = document.getElementById('btnSidebarLogout');

    if(btnNav) btnNav.addEventListener('click', handleLogoutClick);
    if(btnSide) btnSide.addEventListener('click', handleLogoutClick);
    
    // Event listener para el botón de confirmación del modal
    if(confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', performLogout);
}

/**
 * Headers de Autenticación
 */
function getAuthHeaders() {
    let token = null;
    try {
        token = localStorage.getItem('token');
    } catch (error) {
        console.warn('⚠️ No se puede acceder a localStorage:', error);
        console.log('💡 Desactiva "Tracking Prevention" en Edge o usa otro navegador');
    }
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token encontrado y agregado a headers');
    } else {
        console.log('⚠️ No hay token disponible');
    }
    return headers;
}

/**
 * Mostrar Alertas
 */
function showAdminAlert(message, type = 'warning') {
    const adminAlert = document.getElementById('adminAlert');
    if (!adminAlert) return;
    
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
    console.log('📝 Iniciando loadSolicitudes()');
    
    const solicitudesBody = document.getElementById('solicitudesBody');
    const noDataRow = document.getElementById('noDataRow');
    
    console.log('🔍 Elementos encontrados:', {
        solicitudesBody: !!solicitudesBody,
        noDataRow: !!noDataRow
    });
    
    if (!solicitudesBody || !noDataRow) {
        console.error('❌ Elementos de solicitudes no encontrados');
        return;
    }

    // Inicializar modal si no está inicializado
    const modalEl = document.getElementById('previewModal');
    if(modalEl && !previewModal) {
        previewModal = new bootstrap.Modal(modalEl);
        console.log('✅ Modal inicializado');
    }

    try {
        // Resetear tabla
        noDataRow.style.display = 'none';
        
        const headers = getAuthHeaders();
        const hasToken = headers['Authorization'] !== undefined;
        
        // Si no hay token, usar endpoint de debug (solo desarrollo)
        const endpoint = hasToken 
            ? `${API_BASE}/solicitudes/data`
            : `${API_BASE}/solicitudes/debug`;
        
        console.log('📡 Haciendo petición a:', endpoint);
        console.log('🔑 Usando autenticación:', hasToken);

        const res = await fetch(endpoint, { 
            method: 'GET',
            headers: hasToken ? headers : { 'Content-Type': 'application/json' }
        });

        console.log('✅ Respuesta recibida:', res.status);

        // MANEJO DE ERRORES HTTP
        if (res.status === 401 || res.status === 403) {
            showAdminAlert('Sesión expirada o no autorizada. Redirigiendo...', 'danger');
            setTimeout(() => window.location.href = '/login.html', 2000);
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
    const solicitudesBody = document.getElementById('solicitudesBody');
    const previewFrame = document.getElementById('previewFrame');
    
    if (!solicitudesBody) return;
    
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
            if (previewFrame && previewModal) {
                previewFrame.src = pdfURL;
                previewModal.show();
            }
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
    // Mostrar modal de confirmación
    showConfirmActionModal(solicitud, accion, rowEl);
}

/**
 * Mostrar modal de confirmación para aprobar/rechazar
 */
function showConfirmActionModal(solicitud, accion, rowEl) {
    const modalEl = document.getElementById('confirmActionModal');
    const modal = new bootstrap.Modal(modalEl);
    
    const actionIcon = document.getElementById('actionIcon');
    const actionTitle = document.getElementById('actionTitle');
    const actionIconLarge = document.getElementById('actionIconLarge');
    const actionMessage = document.getElementById('actionMessage');
    const actionBanco = document.getElementById('actionBanco');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const confirmText = document.getElementById('confirmActionText');
    
    // Configurar modal según la acción
    if (accion === 'aceptar') {
        actionIcon.className = 'fas fa-check-circle me-2 text-success';
        actionTitle.textContent = 'Aprobar Solicitud';
        actionIconLarge.innerHTML = '<i class="fas fa-check-circle fa-3x text-success"></i>';
        actionMessage.textContent = '¿Confirmas que deseas aprobar esta solicitud?';
        confirmBtn.className = 'btn btn-success';
        confirmText.textContent = 'Sí, aprobar';
    } else {
        actionIcon.className = 'fas fa-times-circle me-2 text-danger';
        actionTitle.textContent = 'Rechazar Solicitud';
        actionIconLarge.innerHTML = '<i class="fas fa-times-circle fa-3x text-danger"></i>';
        actionMessage.textContent = '¿Confirmas que deseas rechazar esta solicitud?';
        confirmBtn.className = 'btn btn-danger';
        confirmText.textContent = 'Sí, rechazar';
    }
    
    actionBanco.textContent = `Banco: ${solicitud.username || 'Sin nombre'}`;
    
    // Configurar botón de confirmación
    confirmBtn.onclick = async () => {
        modal.hide();
        await performAction(solicitud, accion, rowEl);
    };
    
    modal.show();
}

/**
 * Ejecutar la acción de aprobar/rechazar
 */
async function performAction(solicitud, accion, rowEl) {
    const solicitudesBody = document.getElementById('solicitudesBody');
    const noDataRow = document.getElementById('noDataRow');
    
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
                if (solicitudesBody && solicitudesBody.querySelectorAll('tr:not(#noDataRow)').length === 0) { 
                    if (noDataRow) noDataRow.style.display = 'table-row';
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
    console.log('🚀 Admin Logic cargado');
    setupLogout();
    routePageLogic();
});

function routePageLogic() {
    const url = window.location.href;
    const path = window.location.pathname;
    console.log('📍 URL completa:', url);
    console.log('📍 Pathname:', path);

    // Priorizar detección por orden específico (más específico primero)
    if (url.includes('admin-comercios') || path.includes('admin-comercios')) {
        console.log('✅ Cargando comercios...');
        loadComercios();
        setupComerciosSearch();
    } else if (url.includes('admin-dashboard') || path.includes('admin-dashboard')) {
        console.log('✅ Cargando dashboard...');
        loadDashboardMetrics();
    } else if (url.includes('admin-reportes') || path.includes('admin-reportes')) {
        console.log('✅ Cargando reportes...');
        loadReportes('todos');
        setupReportesFiltros();
    } else if (url.includes('vista-adminVERTICE') || url.includes('admin-solicitudes') || path.includes('vista-adminVERTICE') || path.includes('admin-solicitudes')) {
        console.log('✅ Cargando solicitudes...');
        loadSolicitudes();
    } else {
        console.log('⚠️ Página no reconocida:', url);
    }
}

// --- FUNCIONES DE CARGA (Fetch Data) ---

// 1. DASHBOARD
async function loadDashboardMetrics() {
    try {
        const res = await fetch(`${API_BASE}/stats`, { 
            method: 'GET',
            headers: getAuthHeaders() 
        });

        if (res.status === 401 || res.status === 403) {
            console.error('No autorizado');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return;
        }

        if (!res.ok) {
            console.error(`Error del servidor: ${res.status}`);
            return;
        }

        const data = await res.json();

        if (data.success && data.stats) {
            // Actualizar los KPIs en el dashboard
            const kpiDonaciones = document.getElementById('kpi-donaciones');
            const kpiPendientes = document.getElementById('kpi-pendientes');

            if (kpiDonaciones) {
                kpiDonaciones.textContent = data.stats.donacionesActivas || 0;
            }
            if (kpiPendientes) {
                kpiPendientes.textContent = data.stats.bancosPendientes || 0;
            }
        }
    } catch (e) { 
        console.error('Error cargando métricas:', e); 
    }
}

// 3. COMERCIOS
async function loadComercios() {
    const body = document.getElementById('comerciosBody');
    const noData = document.getElementById('noDataComercios');
    if(!body) {
        console.log('No se encontró el elemento comerciosBody');
        return;
    }

    console.log('Cargando comercios...');
    try {
        const res = await fetch(`${API_BASE}/comercios`, { 
            method: 'GET',
            headers: getAuthHeaders() 
        });

        console.log('Response status:', res.status);

        if (res.status === 401 || res.status === 403) {
            console.error('No autorizado');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return;
        }

        if (!res.ok) {
            console.error(`Error del servidor: ${res.status}`);
            noData.style.display = 'table-row';
            return;
        }

        const data = await res.json();
        console.log('Datos recibidos:', data);

        if (!data.success || !Array.isArray(data.comercios) || data.comercios.length === 0) {
            console.log('No hay comercios o datos inválidos');
            noData.style.display = 'table-row';
            return;
        }

        console.log('Comercios encontrados:', data.comercios.length);

        // Limpiar filas viejas
        while (body.lastElementChild && body.lastElementChild.id !== 'noDataComercios') {
            body.removeChild(body.lastElementChild);
        }

        // Renderizar cada comercio
        data.comercios.forEach(comercio => {
            const tr = document.createElement('tr');
            
            // Columna Nombre con foto
            const tdNombre = document.createElement('td');
            tdNombre.className = "ps-4";
            
            // Construir URL de foto de perfil
            let fotoPerfil = '/assets/imgs/kiosko.png'; // Imagen por defecto
            
            if (comercio.fotoPerfil) {
                // Si es una imagen base64, usarla directamente
                if (comercio.fotoPerfil.startsWith('data:image')) {
                    fotoPerfil = comercio.fotoPerfil;
                }
                // Si ya tiene http/https, usar directamente
                else if (comercio.fotoPerfil.startsWith('http')) {
                    fotoPerfil = comercio.fotoPerfil;
                } 
                // Si empieza con /uploads/, agregar solo el dominio
                else if (comercio.fotoPerfil.startsWith('/uploads/')) {
                    fotoPerfil = `http://localhost:3000${comercio.fotoPerfil}`;
                } 
                // Si es solo el nombre del archivo
                else {
                    fotoPerfil = `http://localhost:3000/uploads/${comercio.fotoPerfil}`;
                }
            }
            
            tdNombre.innerHTML = `
                <div class="d-flex align-items-center" style="cursor: pointer;" onclick="verPerfilComercio('${comercio.id}')">
                    <img src="${fotoPerfil}" alt="${comercio.username}" 
                         class="rounded-circle me-3" 
                         style="width: 50px; height: 50px; object-fit: cover; border: 2px solid #6fbf23; background: #f0f0f0;"
                         onerror="this.src='/assets/imgs/kiosko.png';">
                    <div>
                        <p class="mb-0 fw-bold">${comercio.username}</p>
                        <small class="text-muted">${comercio.email}</small>
                    </div>
                </div>
            `;

            // Columna Donaciones
            const tdDonaciones = document.createElement('td');
            const donaciones = comercio.donacionesTotales || 0;
            tdDonaciones.innerHTML = `<span class="badge bg-success">${donaciones}</span>`;

            // Columna Estado
            const tdEstado = document.createElement('td');
            let estadoBadge = '';
            if (comercio.estadoVerificacion === 'aprobado') {
                estadoBadge = '<span class="badge bg-success">Activo</span>';
            } else if (comercio.estadoVerificacion === 'pendiente') {
                estadoBadge = '<span class="badge bg-warning text-dark">Pendiente</span>';
            } else {
                estadoBadge = '<span class="badge bg-secondary">Inactivo</span>';
            }
            tdEstado.innerHTML = estadoBadge;

            // Columna Acciones
            const tdAcciones = document.createElement('td');
            tdAcciones.className = "text-end pe-4";
            tdAcciones.innerHTML = `
                <button class="btn btn-sm btn-outline-primary" onclick="verPerfilComercio('${comercio.id}')" title="Ver perfil">
                    <i class="fas fa-eye"></i>
                </button>
            `;

            tr.appendChild(tdNombre);
            tr.appendChild(tdDonaciones);
            tr.appendChild(tdEstado);
            tr.appendChild(tdAcciones);

            body.appendChild(tr);
        });

    } catch (e) { 
        console.error('Error cargando comercios:', e);
        noData.style.display = 'table-row';
    }
}

// Función para ver perfil del comercio (modal)
async function verPerfilComercio(comercioId) {
    try {
        const res = await fetch(`${API_BASE}/comercios/${comercioId}`, { 
            method: 'GET',
            headers: getAuthHeaders() 
        });

        if (!res.ok) {
            console.error(`Error al obtener perfil: ${res.status}`);
            return;
        }

        const data = await res.json();

        if (data.success && data.comercio) {
            const comercio = data.comercio;
            
            // Construir URL de foto de perfil
            let fotoPerfil = '/assets/imgs/kiosko.png'; // Imagen por defecto
            if (comercio.fotoPerfil) {
                // Si es una imagen base64, usarla directamente
                if (comercio.fotoPerfil.startsWith('data:image')) {
                    fotoPerfil = comercio.fotoPerfil;
                }
                else if (comercio.fotoPerfil.startsWith('http')) {
                    fotoPerfil = comercio.fotoPerfil;
                } else if (comercio.fotoPerfil.startsWith('/uploads/')) {
                    fotoPerfil = `http://localhost:3000${comercio.fotoPerfil}`;
                } else {
                    fotoPerfil = `http://localhost:3000/uploads/${comercio.fotoPerfil}`;
                }
            }
            
            document.getElementById('modalFotoPerfil').src = fotoPerfil;
            document.getElementById('modalFotoPerfil').onerror = function() {
                this.src = '/assets/imgs/kiosko.png';
            };
            document.getElementById('modalNombreComercio').textContent = comercio.username || 'Sin nombre';
            document.getElementById('modalEmail').textContent = comercio.email || 'No especificado';
            document.getElementById('modalTelefono').textContent = comercio.telefono || 'No especificado';
            document.getElementById('modalDireccion').textContent = comercio.direccion || 'No especificada';
            document.getElementById('modalTotalProductos').textContent = data.totalProductos || 0;
            
            // Estado
            const estadoBadge = document.getElementById('modalEstadoBadge');
            if (comercio.estadoVerificacion === 'aprobado') {
                estadoBadge.className = 'badge bg-success';
                estadoBadge.textContent = 'Activo';
            } else if (comercio.estadoVerificacion === 'pendiente') {
                estadoBadge.className = 'badge bg-warning text-dark';
                estadoBadge.textContent = 'Pendiente';
            } else {
                estadoBadge.className = 'badge bg-secondary';
                estadoBadge.textContent = 'Inactivo';
            }

            // Fecha de registro
            if (comercio.created_at) {
                const fecha = new Date(comercio.created_at);
                document.getElementById('modalFechaRegistro').textContent = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                document.getElementById('modalFechaRegistro').textContent = 'No disponible';
            }

            // Mostrar modal
            const modalEl = document.getElementById('comercioPerfilModal');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }

    } catch (error) {
        console.error('Error al cargar perfil del comercio:', error);
    }
}

// Hacer la función global para que pueda ser llamada desde onclick
window.verPerfilComercio = verPerfilComercio;

// Función de búsqueda de comercios
function setupComerciosSearch() {
    const searchInput = document.getElementById('searchComercioInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#comerciosBody tr:not(#noDataComercios)');
        let visibleCount = 0;

        rows.forEach(row => {
            const nombreText = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
            if (nombreText.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        const noData = document.getElementById('noDataComercios');
        if (visibleCount === 0 && searchTerm !== '') {
            if (noData) {
                noData.style.display = 'table-row';
                noData.querySelector('td').innerHTML = `<p class="text-muted mb-0">No se encontraron comercios con "${searchTerm}"</p>`;
            }
        } else if (visibleCount === 0 && searchTerm === '') {
            if (noData) {
                noData.style.display = 'table-row';
                noData.querySelector('td').innerHTML = `<p class="text-muted mb-0">No se encontraron comercios registrados.</p>`;
            }
        } else {
            if (noData) noData.style.display = 'none';
        }
    });
}

// 4. REPORTES
let filtroActualReportes = 'todos';

async function loadReportes(filtro = 'todos') {
    console.log(`📊 Cargando reportes con filtro: ${filtro}`);
    filtroActualReportes = filtro;
    
    const body = document.getElementById('reportesBody');
    const noData = document.getElementById('noDataReportes');
    if (!body) return;

    try {
        // Usar directamente endpoint debug (sin autenticación)
        console.log('⚠️ Usando endpoint debug de reportes');
        const res = await fetch(`http://localhost:3000/api/admin/reportes/debug?filtro=${filtro}`, {
            method: 'GET'
        });

        console.log(`Response status: ${res.status}`);

        if (!res.ok) {
            console.error(`Error al cargar reportes: ${res.status}`);
            noData.style.display = 'table-row';
            return;
        }

        const data = await res.json();
        console.log('Datos recibidos:', data);

        if (data.success && data.reportes && data.reportes.length > 0) {
            noData.style.display = 'none';
            body.innerHTML = '';

            data.reportes.forEach(reporte => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.onclick = () => verDetalleReporte(reporte.id);

                // Ticket ID
                const tdTicket = document.createElement('td');
                tdTicket.className = 'ps-4';
                tdTicket.innerHTML = `<span class="badge bg-secondary">#${reporte.id.slice(-4)}</span>`;
                tr.appendChild(tdTicket);

                // Reportado por
                const tdUsuario = document.createElement('td');
                tdUsuario.textContent = reporte.username || 'Usuario';
                tr.appendChild(tdUsuario);

                // Asunto
                const tdAsunto = document.createElement('td');
                const tipoLabels = {
                    'recoleccion': 'Recolección',
                    'calidad': 'Calidad',
                    'voluntarios': 'Voluntarios',
                    'tecnico': 'Técnico',
                    'otro': 'Otro'
                };
                tdAsunto.innerHTML = `
                    <div>
                        <strong>${tipoLabels[reporte.tipo] || reporte.tipo}</strong>
                        <div class="text-muted small">${reporte.asunto.substring(0, 50)}${reporte.asunto.length > 50 ? '...' : ''}</div>
                    </div>
                `;
                tr.appendChild(tdAsunto);

                // Prioridad
                const tdPrioridad = document.createElement('td');
                const prioridadClass = {
                    'normal': 'bg-secondary',
                    'alta': 'bg-warning text-dark',
                    'critica': 'bg-danger'
                };
                const prioridadText = {
                    'normal': 'Normal',
                    'alta': 'Alta',
                    'critica': 'Crítica'
                };
                tdPrioridad.innerHTML = `<span class="badge ${prioridadClass[reporte.prioridad] || 'bg-secondary'}">${prioridadText[reporte.prioridad] || reporte.prioridad}</span>`;
                tr.appendChild(tdPrioridad);

                // Estado
                const tdEstado = document.createElement('td');
                const estadoClass = {
                    'pendiente': 'bg-warning text-dark',
                    'en_proceso': 'bg-info text-white',
                    'resuelto': 'bg-success',
                    'cerrado': 'bg-secondary'
                };
                const estadoText = {
                    'pendiente': 'Pendiente',
                    'en_proceso': 'En Proceso',
                    'resuelto': 'Resuelto',
                    'cerrado': 'Cerrado'
                };
                tdEstado.innerHTML = `<span class="badge ${estadoClass[reporte.estado] || 'bg-secondary'}">${estadoText[reporte.estado] || reporte.estado}</span>`;
                tr.appendChild(tdEstado);

                // Acciones
                const tdAcciones = document.createElement('td');
                tdAcciones.className = 'text-end pe-4';
                tdAcciones.innerHTML = `
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); verDetalleReporte('${reporte.id}')" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
                tr.appendChild(tdAcciones);

                body.appendChild(tr);
            });

            console.log(`✅ ${data.reportes.length} reportes cargados`);
        } else {
            console.log('No hay reportes');
            noData.style.display = 'table-row';
            body.innerHTML = '';
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        noData.style.display = 'table-row';
        body.innerHTML = '';
    }
}

async function verDetalleReporte(reporteId) {
    console.log(`Ver detalle del reporte: ${reporteId}`);
    try {
        // Usar directamente endpoint debug
        console.log('⚠️ Usando endpoint debug para detalle');
        const res = await fetch(`http://localhost:3000/api/admin/reportes/debug/${reporteId}`, {
            method: 'GET'
        });

        if (!res.ok) {
            console.error(`Error al obtener detalle: ${res.status}`);
            return;
        }

        const data = await res.json();

        if (data.success && data.reporte) {
            mostrarModalReporte(data.reporte);
        }
    } catch (error) {
        console.error('Error al obtener detalle del reporte:', error);
    }
}

function mostrarModalReporte(reporte) {
    const modal = document.getElementById('reporteDetalleModal');
    if (!modal) return;

    // Llenar datos del modal
    document.getElementById('modalReporteTicketId').textContent = `#${reporte.id.slice(-4)}`;
    document.getElementById('modalReporteUsuario').textContent = reporte.username || 'Usuario';
    document.getElementById('modalReporteEmail').textContent = reporte.email || 'No especificado';
    
    const tipoLabels = {
        'recoleccion': 'Problema con Recolección',
        'calidad': 'Reportar Calidad de Alimento',
        'voluntarios': 'Solicitar Voluntarios',
        'tecnico': 'Falla Técnica',
        'otro': 'Otro'
    };
    document.getElementById('modalReporteTipo').textContent = tipoLabels[reporte.tipo] || reporte.tipo;
    document.getElementById('modalReporteAsunto').textContent = reporte.asunto;
    document.getElementById('modalReporteDescripcion').textContent = reporte.descripcion;
    
    const prioridadText = {
        'normal': 'Normal',
        'alta': 'Alta',
        'critica': 'Crítica'
    };
    document.getElementById('modalReportePrioridad').textContent = prioridadText[reporte.prioridad] || reporte.prioridad;
    
    const estadoText = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'resuelto': 'Resuelto',
        'cerrado': 'Cerrado'
    };
    document.getElementById('modalReporteEstado').textContent = estadoText[reporte.estado] || reporte.estado;
    
    const fecha = new Date(reporte.created_at);
    document.getElementById('modalReporteFecha').textContent = fecha.toLocaleString('es-AR');
    
    const loteContainer = document.getElementById('modalReporteLote').parentElement;
    if (reporte.lote_id) {
        document.getElementById('modalReporteLoteId').textContent = reporte.lote_id;
        loteContainer.style.display = 'block';
    } else {
        loteContainer.style.display = 'none';
    }

    // Mostrar respuestas
    const respuestasContainer = document.getElementById('modalReporteRespuestas');
    if (reporte.respuestas && reporte.respuestas.length > 0) {
        respuestasContainer.innerHTML = '';
        reporte.respuestas.forEach(resp => {
            const respFecha = new Date(resp.fecha);
            respuestasContainer.innerHTML += `
                <div class="border-start border-3 border-success ps-3 mb-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <strong>${resp.admin_username}</strong>
                        <small class="text-muted">${respFecha.toLocaleString('es-AR')}</small>
                    </div>
                    <p class="mb-0 mt-1">${resp.mensaje}</p>
                </div>
            `;
        });
    } else {
        respuestasContainer.innerHTML = '<p class="text-muted">Sin respuestas aún</p>';
    }

    // Guardar ID del reporte actual para acciones
    window.currentReporteId = reporte.id;
    window.currentReporteEstado = reporte.estado;

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

async function cambiarEstadoReporte(nuevoEstado) {
    if (!window.currentReporteId) return;

    try {
        const res = await fetch(`${API_BASE}/reportes/${window.currentReporteId}/estado`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!res.ok) {
            console.error(`Error al cambiar estado: ${res.status}`);
            showAdminAlert('Error al cambiar el estado', 'danger');
            return;
        }

        const data = await res.json();

        if (data.success) {
            showAdminAlert(`Estado cambiado a: ${nuevoEstado}`, 'success');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('reporteDetalleModal'));
            if (modal) modal.hide();

            // Recargar lista
            loadReportes(filtroActualReportes);
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        showAdminAlert('Error al cambiar el estado', 'danger');
    }
}

async function responderReporte() {
    if (!window.currentReporteId) return;

    const textarea = document.getElementById('respuestaReporte');
    const mensaje = textarea.value.trim();

    if (mensaje.length === 0) {
        showAdminAlert('Escribe un mensaje antes de enviar', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/reportes/${window.currentReporteId}/responder`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensaje })
        });

        if (!res.ok) {
            console.error(`Error al responder: ${res.status}`);
            showAdminAlert('Error al enviar respuesta', 'danger');
            return;
        }

        const data = await res.json();

        if (data.success) {
            showAdminAlert('Respuesta enviada exitosamente', 'success');
            textarea.value = '';
            
            // Cerrar modal y recargar
            const modal = bootstrap.Modal.getInstance(document.getElementById('reporteDetalleModal'));
            if (modal) modal.hide();

            loadReportes(filtroActualReportes);
        }
    } catch (error) {
        console.error('Error al responder:', error);
        showAdminAlert('Error al enviar respuesta', 'danger');
    }
}

function setupReportesFiltros() {
    const btnTodos = document.getElementById('btnFiltroTodos');
    const btnUrgentes = document.getElementById('btnFiltroUrgentes');
    const btnResueltos = document.getElementById('btnFiltroResueltos');

    if (btnTodos) {
        btnTodos.onclick = () => {
            btnTodos.classList.add('active');
            if (btnUrgentes) btnUrgentes.classList.remove('active');
            if (btnResueltos) btnResueltos.classList.remove('active');
            loadReportes('todos');
        };
    }

    if (btnUrgentes) {
        btnUrgentes.onclick = () => {
            if (btnTodos) btnTodos.classList.remove('active');
            btnUrgentes.classList.add('active');
            if (btnResueltos) btnResueltos.classList.remove('active');
            loadReportes('urgentes');
        };
    }

    if (btnResueltos) {
        btnResueltos.onclick = () => {
            if (btnTodos) btnTodos.classList.remove('active');
            if (btnUrgentes) btnUrgentes.classList.remove('active');
            btnResueltos.classList.add('active');
            loadReportes('resueltos');
        };
    }
}

// --- UTILIDADES ---

// setupLogout ya está definido arriba, esta es una versión duplicada que se puede eliminar

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}