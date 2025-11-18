/**
 * Sistema de Notificaciones Bonitas para Vértice
 * Reemplaza los alert() nativos con notificaciones estilizadas
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones si no existe
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createContainer();
            });
        } else {
            this.createContainer();
        }
    }

    createContainer() {
        // Verificar si ya existe
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }

        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            this.injectStyles();
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease-out;
                pointer-events: auto;
                min-width: 300px;
                border-left: 4px solid #4cd309;
                position: relative;
                overflow: hidden;
            }

            .notification::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                animation: progress 5s linear;
            }

            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }

            .notification.success {
                border-left-color: #4cd309;
            }

            .notification.success::before {
                background: #4cd309;
            }

            .notification.error {
                border-left-color: #dc3545;
            }

            .notification.error::before {
                background: #dc3545;
            }

            .notification.warning {
                border-left-color: #ffc107;
            }

            .notification.warning::before {
                background: #ffc107;
            }

            .notification.info {
                border-left-color: #17a2b8;
            }

            .notification.info::before {
                background: #17a2b8;
            }

            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 14px;
            }

            .notification.success .notification-icon {
                background: #e6f7ea;
                color: #4cd309;
            }

            .notification.error .notification-icon {
                background: #ffe5e7;
                color: #dc3545;
            }

            .notification.warning .notification-icon {
                background: #fff9e6;
                color: #ffc107;
            }

            .notification.info .notification-icon {
                background: #e6f7fb;
                color: #17a2b8;
            }

            .notification-content {
                flex: 1;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
                line-height: 1.5;
                color: #333;
            }

            .notification-close {
                flex-shrink: 0;
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }

            .notification-close:hover {
                color: #333;
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

            .notification.hiding {
                animation: slideOutRight 0.3s ease-out forwards;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .notification {
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 5000) {
        if (!this.container) {
            this.createContainer();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Determinar icono según el tipo
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close" aria-label="Cerrar">×</button>
        `;

        // Agregar al contenedor
        this.container.appendChild(notification);

        // Evento para cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        // Auto-cerrar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    }

    hide(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    // Método para limpiar todas las notificaciones
    clearAll() {
        if (this.container) {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
    }
}

// Crear instancia global
const notificationManager = new NotificationManager();

// Exponer globalmente para fácil acceso
window.showNotification = (message, type = 'info', duration = 5000) => {
    return notificationManager.show(message, type, duration);
};

window.notify = {
    success: (message, duration) => notificationManager.success(message, duration),
    error: (message, duration) => notificationManager.error(message, duration),
    warning: (message, duration) => notificationManager.warning(message, duration),
    info: (message, duration) => notificationManager.info(message, duration),
    clear: () => notificationManager.clearAll()
};

// Para compatibilidad con código existente
window.notificationManager = notificationManager;

console.log('✅ Sistema de notificaciones cargado');
