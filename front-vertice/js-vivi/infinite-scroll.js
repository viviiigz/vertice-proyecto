// Archivo: js-vivi/infinite-scroll.js
// Módulo reutilizable para implementar scroll infinito en cualquier página

export class InfiniteScroll {
    /**
     * @param {Object} config - Configuración del scroll infinito
     * @param {string} config.containerId - ID del contenedor donde se renderizan los productos
     * @param {string} config.apiUrl - URL base del endpoint (ej: 'http://localhost:3000/api/productos')
     * @param {Object} config.queryParams - Parámetros adicionales para el query string (ej: {tipo_producto: 'lacteos', categoria: 'comida-por-caducarse'})
     * @param {Function} config.renderItem - Función que recibe un producto y retorna el HTML (como string o elemento DOM)
     * @param {number} config.limit - Cantidad de items por página (default: 10)
     * @param {number} config.threshold - Píxeles desde el bottom para activar carga (default: 300px)
     */
    constructor(config) {
        this.container = document.getElementById(config.containerId);
        if (!this.container) {
            throw new Error(`Container con ID "${config.containerId}" no encontrado`);
        }

        this.apiUrl = config.apiUrl;
        this.queryParams = config.queryParams || {};
        this.renderItem = config.renderItem;
        this.limit = config.limit || 10;
        this.threshold = config.threshold || 300;

        // Estado interno
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMore = true;
        this.products = []; // Mantener lista de productos ya cargados
        this.abortController = null;

        // Elementos UI
        this.loader = this._createLoader();
        this.endMessage = this._createEndMessage();

        // Bind para mantener contexto
        this._handleScroll = this._handleScroll.bind(this);
    }

    /**
     * Inicializa el scroll infinito: carga primera página y activa listener de scroll
     */
    async init() {
        // Asegurar que no se dupliquen listeners al reinicializar
        this._detachScrollListener();
        this._cancelPendingRequest();

        this.container.innerHTML = ''; // Limpiar contenedor
        this.container.appendChild(this.loader);
        await this.loadMore();
        this._attachScrollListener();
    }

    /**
     * Carga la siguiente página de productos
     */
    async loadMore() {
        if (this.isLoading || !this.hasMore) return;

        this.isLoading = true;
        this._showLoader();
        this._cancelPendingRequest();
        this.abortController = new AbortController();

        try {
            const url = this._buildUrl();
            console.log(`[InfiniteScroll] Cargando página ${this.currentPage} => ${url}`);
            
            const response = await fetch(url, {
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Backend ahora devuelve {products: [...], pagination: {...}}
            const products = data.products || [];
            const pagination = data.pagination || {};

            console.log(`[InfiniteScroll] Recibidos ${products.length} productos. Total: ${pagination.total}, hasMore: ${pagination.hasMore}`);

            if (products.length === 0 && this.currentPage === 1) {
                this._showEmptyMessage();
                this.hasMore = false;
                return;
            }

            // Renderizar productos
            products.forEach(product => {
                const element = this.renderItem(product);
                if (typeof element === 'string') {
                    // Si devuelve HTML string, crear contenedor
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = element;
                    this.container.insertBefore(wrapper.firstElementChild, this.loader);
                } else {
                    // Si devuelve elemento DOM
                    this.container.insertBefore(element, this.loader);
                }
            });

            this.products.push(...products);
            this.hasMore = pagination.hasMore || false;
            this.currentPage++;

            if (!this.hasMore) {
                this._showEndMessage();
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('[InfiniteScroll] Error al cargar productos:', error);
            this._showErrorMessage(error.message);
        } finally {
            this.abortController = null;
            this.isLoading = false;
            this._hideLoader();
        }
    }

    /**
     * Resetea el estado y recarga desde la página 1
     */
    async reset() {
        this._cancelPendingRequest();
        this.currentPage = 1;
        this.hasMore = true;
        this.products = [];
        this.isLoading = false;
        this.container.innerHTML = '';
        this.container.appendChild(this.loader);
        await this.loadMore();
    }

    /**
     * Actualiza query params, resetea paginación y recarga desde página 1
     * @param {Object} queryParams
     */
    async applyQueryParams(queryParams = {}) {
        this.queryParams = queryParams || {};
        await this.reset();
    }

    /**
     * Destruye el scroll infinito y limpia listeners
     */
    destroy() {
        this._cancelPendingRequest();
        this._detachScrollListener();
        this.container.innerHTML = '';
    }

    // ==================== Métodos privados ====================

    _buildUrl() {
        const sanitizedQueryParams = Object.entries(this.queryParams || {}).reduce((acc, [key, value]) => {
            if (value === undefined || value === null || value === '') {
                return acc;
            }
            acc[key] = String(value);
            return acc;
        }, {});

        const params = new URLSearchParams({
            ...sanitizedQueryParams,
            page: String(this.currentPage),
            limit: String(this.limit)
        });
        return `${this.apiUrl}?${params.toString()}`;
    }

    _cancelPendingRequest() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    _handleScroll() {
        if (this.isLoading || !this.hasMore) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        // Si estamos cerca del bottom (threshold), cargar más
        if (pageHeight - scrollPosition < this.threshold) {
            this.loadMore();
        }
    }

    _attachScrollListener() {
        window.addEventListener('scroll', this._handleScroll);
        // También escuchar resize por si el contenido es muy pequeño
        window.addEventListener('resize', this._handleScroll);
    }

    _detachScrollListener() {
        window.removeEventListener('scroll', this._handleScroll);
        window.removeEventListener('resize', this._handleScroll);
    }

    _createLoader() {
        const loader = document.createElement('div');
        loader.className = 'infinite-scroll-loader';
        loader.style.cssText = 'text-align: center; padding: 20px; display: none;';
        loader.innerHTML = `
            <div class="spinner-border text-success" role="status">
                <span class="sr-only">Cargando...</span>
            </div>
            <p style="margin-top: 10px; color: #666;">Cargando más productos...</p>
        `;
        return loader;
    }

    _createEndMessage() {
        const end = document.createElement('div');
        end.className = 'infinite-scroll-end';
        end.style.cssText = 'text-align: center; padding: 20px; color: #999; display: none;';
        end.innerHTML = '<p>✓ Has visto todos los productos disponibles</p>';
        return end;
    }

    _showLoader() {
        this.loader.style.display = 'block';
    }

    _hideLoader() {
        this.loader.style.display = 'none';
    }

    _showEndMessage() {
        this._hideLoader();
        if (!this.container.contains(this.endMessage)) {
            this.container.appendChild(this.endMessage);
        }
        this.endMessage.style.display = 'block';
    }

    _showEmptyMessage() {
        this._hideLoader();
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align: center; padding: 40px; color: #888;';
        empty.innerHTML = '<p>No hay productos disponibles en esta categoría por el momento.</p>';
        this.container.appendChild(empty);
    }

    _showErrorMessage(message) {
        this._hideLoader();
        const error = document.createElement('div');
        error.style.cssText = 'text-align: center; padding: 20px; color: #dc3545; background: #ffe6e6; margin: 10px 0; border-radius: 5px;';
        error.innerHTML = `<p><strong>Error:</strong> ${message}</p><p>Por favor, intenta recargar la página.</p>`;
        this.container.insertBefore(error, this.loader);
    }
}
