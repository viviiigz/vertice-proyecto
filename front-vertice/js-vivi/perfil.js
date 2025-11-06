  // API Configuration
const API_URL = 'http://localhost:3000/api';

console.log('✅ perfil.js cargado correctamente');

// Función para obtener el token
function getToken() {
    return localStorage.getItem('token');
}

// Función para obtener headers con autorización
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    };
}

// Verificar autenticación
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Cargar datos del perfil desde el backend
async function cargarPerfil() {
    console.log('🔄 Cargando perfil...');
    
    if (!checkAuth()) {
        console.log('❌ Sin autenticación');
        return;
    }

    console.log('✅ Token encontrado:', getToken().substring(0, 20) + '...');

    try {
        const response = await fetch(`${API_URL}/perfil`, {
            headers: getAuthHeaders()
        });

        console.log('📡 Respuesta del servidor:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.log('❌ Token inválido, redirigiendo a login');
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al cargar perfil');
        }

        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        if (data.success) {
            mostrarDatosPerfil(data.user);
            return data.user;
        }
    } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
        mostrarAlerta('Error al cargar el perfil. Por favor recarga la página.', 'error');
    }
}

// Mostrar datos del perfil en el formulario
function mostrarDatosPerfil(user) {
    // Información básica (no editable)
    const usernameEl = document.getElementById('username') || 
                       document.getElementById('display-nombre') || 
                       document.getElementById('input-nombre');
    const emailEl = document.getElementById('email') || 
                    document.getElementById('display-email') ||
                    document.getElementById('email-comercio');
    
    if (usernameEl) {
        if (usernameEl.tagName === 'INPUT') {
            usernameEl.value = user.username;
            usernameEl.setAttribute('readonly', 'readonly');
        } else {
            usernameEl.textContent = user.username;
        }
    }
    
    if (emailEl) {
        if (emailEl.tagName === 'INPUT') {
            emailEl.value = user.email;
            emailEl.setAttribute('readonly', 'readonly');
        } else {
            emailEl.textContent = user.email;
        }
    }

    // Avatar inicial (primera letra del username)
    const avatarEl = document.getElementById('avatar-initial') || 
                     document.getElementById('profile-avatar');
    if (avatarEl) {
        avatarEl.textContent = user.username.charAt(0).toUpperCase();
    }

    // Foto de perfil
    const fotoPerfilEl = document.getElementById('profile-img-preview');
    if (fotoPerfilEl && user.fotoPerfil) {
        fotoPerfilEl.src = user.fotoPerfil;
    }

    // Campos editables del perfil
    const descripcionEl = document.getElementById('descripcion') || 
                          document.getElementById('input-slogan') ||
                          document.getElementById('descripcion-comercio');
    if (descripcionEl) {
        descripcionEl.value = user.descripcion || '';
        // También actualizar el display si existe
        const displaySlogan = document.getElementById('display-slogan');
        if (displaySlogan) {
            displaySlogan.textContent = user.descripcion || 'Slogan del comercio o una breve descripción';
        }
    }

    const telefonoEl = document.getElementById('telefono') || 
                       document.getElementById('input-telefono') ||
                       document.getElementById('telefono-comercio');
    if (telefonoEl) {
        // Mostrar el teléfono completo tal como está guardado
        telefonoEl.value = user.telefono || '';
    }

    // Campos específicos para comercios
    if (user.role === 'comercio') {
        const direccionEl = document.getElementById('direccion') || 
                            document.getElementById('input-direccion') ||
                            document.getElementById('direccion-comercio');
        const horariosEl = document.getElementById('horarios') || 
                           document.getElementById('input-horarios') ||
                           document.getElementById('horarios-comercio');
        
        if (direccionEl) {
            direccionEl.value = user.direccion || '';
        }
        
        if (horariosEl) {
            horariosEl.value = user.horarios || '';
        }
    }

    // Campo específico para bancos (documento de verificación)
    if (user.role === 'banco' && user.documentoVerificacion) {
        const docLinkEl = document.getElementById('doc-link');
        const bancoFieldsContainer = document.getElementById('banco-fields');
        
        if (docLinkEl) {
            docLinkEl.href = `${API_URL.replace('/api', '')}/uploads/${user.documentoVerificacion}`;
        }
        
        if (bancoFieldsContainer && bancoFieldsContainer.classList.contains('d-none')) {
            bancoFieldsContainer.classList.remove('d-none');
        }
    }

    // Badge de rol
    const roleBadgeEl = document.getElementById('profile-role');
    if (roleBadgeEl) {
        const roleMap = {
            'comercio': 'Comercio',
            'consumidor': 'Consumidor',
            'banco': 'Banco de Alimentos',
            'admin': 'Administrador'
        };
        roleBadgeEl.textContent = roleMap[user.role] || user.role;
    }
}

// Actualizar perfil en el backend
async function actualizarPerfil(datosFormulario) {
    if (!checkAuth()) return false;

    try {
        const response = await fetch(`${API_URL}/perfil`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(datosFormulario)
        });

        const data = await response.json();

        if (data.success) {
            mostrarAlerta('Perfil actualizado correctamente', 'success');
            // Actualizar la vista con los nuevos datos
            mostrarDatosPerfil(data.user);
            return true;
        } else {
            mostrarAlerta(data.message || 'Error al actualizar el perfil', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        mostrarAlerta('Error al actualizar el perfil. Inténtalo de nuevo.', 'error');
        return false;
    }
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = 'info') {
    // Intentar usar los elementos de alerta existentes
    let alertEl = document.getElementById(`alert-${tipo}`);
    
    if (!alertEl) {
        // Si no existe, crear una alerta temporal
        alertEl = document.createElement('div');
        alertEl.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        alertEl.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertEl.innerHTML = `
            <i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertEl);
        
        setTimeout(() => {
            alertEl.remove();
        }, 5000);
    } else {
        // Usar el elemento de alerta existente
        if (tipo === 'error') {
            const errorMessageEl = document.getElementById('error-message');
            if (errorMessageEl) {
                errorMessageEl.textContent = mensaje;
            }
        }
        alertEl.classList.remove('d-none');
        
        setTimeout(() => {
            alertEl.classList.add('d-none');
        }, tipo === 'error' ? 5000 : 3000);
    }
}

// Configurar el formulario de perfil
function setupPerfilForm() {
    const form = document.getElementById('form-perfil') || document.querySelector('form');
    const guardarBtn = document.getElementById('guardar-cambios-btn');
    
    // Si no hay formulario pero sí hay botón de guardar, conectar directamente al botón
    if (guardarBtn && !form) {
        guardarBtn.addEventListener('click', async () => {
            await guardarCambiosPerfil();
        });
        return;
    }

    if (!form) {
        console.warn('No se encontró formulario de perfil');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarCambiosPerfil();
    });
}

// Función para guardar cambios del perfil
async function guardarCambiosPerfil() {
    // Obtener valores del formulario (buscar por múltiples IDs posibles)
    const descripcion = (document.getElementById('descripcion') || 
                         document.getElementById('input-slogan') ||
                         document.getElementById('descripcion-comercio'))?.value || '';
    
    const telefono = (document.getElementById('telefono') || 
                      document.getElementById('input-telefono') ||
                      document.getElementById('telefono-comercio'))?.value || '';
    
    const direccion = (document.getElementById('direccion') || 
                       document.getElementById('input-direccion') ||
                       document.getElementById('direccion-comercio'))?.value || '';
    
    const horarios = (document.getElementById('horarios') || 
                      document.getElementById('input-horarios') ||
                      document.getElementById('horarios-comercio'))?.value || '';
    
    // Obtener foto de perfil (Data URL en base64)
    const fotoPerfilEl = document.getElementById('profile-img-preview');
    const fotoPerfil = fotoPerfilEl?.src || '';

    // Preparar datos
    const datosFormulario = {
        descripcion,
        telefono,
        direccion,
        horarios,
        fotoPerfil
    };

    console.log('Enviando datos al backend:', datosFormulario);

    // Actualizar perfil
    const exitoso = await actualizarPerfil(datosFormulario);
    
    // Si hay botones de modo edición, volver al modo visualización
    if (exitoso) {
        const isEditingVar = window.isEditing;
        if (typeof isEditingVar !== 'undefined' && isEditingVar) {
            if (typeof window.toggleEditMode === 'function') {
                window.toggleEditMode(false);
            }
        }
    }
    
    return exitoso;
}

// Configurar botón de cerrar sesión
async function setupCerrarSesion() {
    const cerrarSesionBtn = document.getElementById('cerrar-sesion-btn');
    
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', async () => {
            await cerrarSesion();
        });
    }
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        console.log(' Cerrando sesión...');
        
        const token = getToken();
        
        // Llamar al endpoint de logout
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(' Sesión cerrada en el servidor');
        } else {
            console.warn(' Error al cerrar sesión en el servidor:', data.error);
        }
    } catch (error) {
        console.error(' Error al llamar al logout:', error);
    } finally {
        // Limpiar localStorage SIEMPRE (incluso si el servidor falla)
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profileName');
        localStorage.removeItem('profileSlogan');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('editMode');
        
        console.log(' LocalStorage limpiado');
        
        // Redirigir a la landing o login (ruta absoluta desde la raíz)
        window.location.href = 'http://localhost:3000/vertice.html';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarPerfil();
    setupPerfilForm();
    setupCerrarSesion();
});

// Exportar funciones para uso global
window.PerfilAPI = {
    cargarPerfil,
    actualizarPerfil,
    cerrarSesion,
    mostrarAlerta,
    getToken,
    checkAuth
};
