// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================
const API_URL = 'http://localhost:3000/api';
let misProductos = [];
let cargarYMostrarProductosGlobal = null; // Referencia global a la función
let productoAEliminar = null; // Guardar el ID del producto a eliminar

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================
function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    };
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// ========================================
// FUNCIONES DE API - PRODUCTOS
// ========================================
async function obtenerMisProductos() {
    try {
        if (!checkAuth()) return [];

        console.log(' Obteniendo mis productos...');
        const response = await fetch(`${API_URL}/productos/my/productos`, {
            headers: getAuthHeaders()
        });

        console.log(' Respuesta:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.log(' Token inválido');
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return [];
            }
            throw new Error('Error al obtener los productos');
        }

        const data = await response.json();
        console.log(' Productos obtenidos:', data);
        
        // Mapear los nombres de las propiedades del backend a los del frontend
        return data.map(p => ({
            id: p._id || p.id,
            nombre: p.nombre_producto,
            descripcion: p.descripcion,
            precioOriginal: p.precio_original,
            precioOferta: p.precio_descuento,
            stock: p.cantidad_disponible,
            imagen: p.foto_url ? `${API_URL.replace('/api', '')}/uploads/${p.foto_url}` : 'assets/imgs/default.jpg',
            categoria: p.categoria
        }));
    } catch (error) {
        console.error(' Error al obtener productos:', error);
        alert('Error al cargar tus productos. Por favor recarga la página.');
        return [];
    }
}

async function eliminarProducto(id) {
    try {
        if (!checkAuth()) return;

        console.log(' Eliminando producto:', id);
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        console.log(' Respuesta del servidor:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(' Error del servidor:', errorData);
            throw new Error(errorData.message || 'Error al eliminar el producto');
        }

        const data = await response.json();
        console.log(' Producto eliminado:', data);
        
        // Cerrar el modal
        document.getElementById('eliminar-modal').style.display = 'none';
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito('Producto eliminado correctamente');
        
        // Recargar la lista de productos usando la referencia global
        if (cargarYMostrarProductosGlobal) {
            await cargarYMostrarProductosGlobal();
        }
    } catch (error) {
        console.error(' Error al eliminar producto:', error);
        // Cerrar el modal
        document.getElementById('eliminar-modal').style.display = 'none';
        mostrarMensajeError('Error al eliminar el producto: ' + error.message);
    }
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4cd309;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    mensajeDiv.textContent = '✓ ' + mensaje;
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => mensajeDiv.remove(), 300);
    }, 3000);
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    mensajeDiv.textContent = '✗ ' + mensaje;
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => mensajeDiv.remove(), 300);
    }, 4000);
}

// Función para abrir el modal de confirmación
function abrirModalEliminar(producto) {
    productoAEliminar = producto;
    const modal = document.getElementById('eliminar-modal');
    const infoDiv = document.getElementById('producto-info-eliminar');
    
    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${producto.imagen}" alt="${producto.nombre}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #333;">${producto.nombre}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Precio: $${producto.precioOriginal}
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Stock: ${producto.stock} unidades
                </p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando comercio.js');

    // ===============================
    // Mostrar mensaje post-redirección (producto creado)
    // ===============================
    try {
        const flag = sessionStorage.getItem('productoCreado');
        if (flag) {
            const dataFlag = JSON.parse(flag);
            console.log(' Flag productoCreado detectado:', dataFlag);
            sessionStorage.removeItem('productoCreado');
            // Reutilizar función de éxito pero sin auto cierre prematuro
            const mensajeDiv = document.createElement('div');
            mensajeDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4cd309;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-weight: 500;
                animation: slideIn 0.3s ease-out;
            `;
            const nombreProd = dataFlag.nombre ? ` (${dataFlag.nombre})` : '';
            mensajeDiv.textContent = `✓ ${dataFlag.texto}${nombreProd}`;
            document.body.appendChild(mensajeDiv);
            setTimeout(() => {
                mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => mensajeDiv.remove(), 300);
            }, 3000);
        } else {
            console.log('ℹ No hay flag productoCreado en sessionStorage');
        }
    } catch (eMsg) {
        console.warn('⚠ Error procesando flag productoCreado:', eMsg);
    }

    // ========================================
    // GRÁFICO DE ESTADÍSTICAS
    // ========================================
    const ctx = document.getElementById('ventasChart');
    
    if (ctx) {
        console.log(' Inicializando gráfico de ventas');
        const datosVentasVacios = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ventas Mensuales ($)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(76, 211, 9, 0.5)',
                borderColor: 'rgba(76, 211, 9, 1)',
                borderWidth: 1
            }]
        };

        const opcionesGrafico = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Monto de Ventas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: false,
                }
            }
        };

        new Chart(ctx, {
            type: 'bar',
            data: datosVentasVacios,
            options: opcionesGrafico
        });
    }

    // ========================================
    // TABLA DE PRODUCTOS
    // ========================================
    const productTableBody = document.getElementById('product-table-body');
    
    if (productTableBody) {
        console.log(' Inicializando tabla de productos');
        
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const filtroBtn = document.getElementById('filtro-btn');
        const filtroModal = document.getElementById('filtro-modal');
        const aplicarFiltrosBtn = document.getElementById('aplicar-filtros-btn');
        const quitarFiltrosBtn = document.getElementById('quitar-filtros-btn');
        const ordenSelect = document.getElementById('orden-select');
        const categoriaSelect = document.getElementById('categoria-select');
        const disponibilidadBtns = document.querySelectorAll('.availability-buttons button');
        let disponibilidadActiva = 'todos';

        // ========================================
        // EVENTOS DEL MODAL DE FILTROS
        // ========================================
        filtroBtn.addEventListener('click', () => {
            filtroModal.style.display = 'block';
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            filtroModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == filtroModal) {
                filtroModal.style.display = 'none';
            }
        });

        disponibilidadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                disponibilidadBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                disponibilidadActiva = btn.id.split('-')[0];
            });
        });

        // ========================================
        // EVENTOS DEL MODAL DE ELIMINACIÓN
        // ========================================
        const eliminarModal = document.getElementById('eliminar-modal');
        const closeEliminarModal = document.getElementById('close-eliminar-modal');
        const cancelarEliminarBtn = document.getElementById('cancelar-eliminar-btn');
        const confirmarEliminarBtn = document.getElementById('confirmar-eliminar-btn');

        closeEliminarModal.addEventListener('click', () => {
            eliminarModal.style.display = 'none';
            productoAEliminar = null;
        });

        cancelarEliminarBtn.addEventListener('click', () => {
            eliminarModal.style.display = 'none';
            productoAEliminar = null;
        });

        confirmarEliminarBtn.addEventListener('click', async () => {
            if (productoAEliminar) {
                await eliminarProducto(productoAEliminar.id);
                productoAEliminar = null;
            }
        });

        window.addEventListener('click', (event) => {
            if (event.target == eliminarModal) {
                eliminarModal.style.display = 'none';
                productoAEliminar = null;
            }
        });

        // ========================================
        // FUNCIONES DE FILTRADO Y ORDENAMIENTO
        // ========================================
        function aplicarFiltros() {
            console.log(' Aplicando filtros...');
            let productos = [...misProductos];

            // Filtrar por disponibilidad
            if (disponibilidadActiva === 'en') {
                productos = productos.filter(p => p.stock > 0);
            } else if (disponibilidadActiva === 'sin') {
                productos = productos.filter(p => p.stock <= 0);
            }

            // Filtrar por categoría
            if (categoriaSelect && categoriaSelect.value !== 'todas') {
                productos = productos.filter(p => p.categoria === categoriaSelect.value);
            }

            // Ordenar
            const orden = ordenSelect.value;
            switch (orden) {
                case 'a-z':
                    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    break;
                case 'z-a':
                    productos.sort((a, b) => b.nombre.localeCompare(a.nombre));
                    break;
                case 'menor-precio':
                    productos.sort((a, b) => parseFloat(a.precioOriginal) - parseFloat(b.precioOriginal));
                    break;
                case 'mayor-precio':
                    productos.sort((a, b) => parseFloat(b.precioOriginal) - parseFloat(a.precioOriginal));
                    break;
                case 'mas-nuevos':
                    productos.sort((a, b) => b.id - a.id);
                    break;
                case 'mas-viejos':
                    productos.sort((a, b) => a.id - b.id);
                    break;
            }
            
            console.log(` ${productos.length} productos después de filtrar`);
            mostrarProductos(productos);
            filtroModal.style.display = 'none';
        }

        function buscarProductos() {
            const searchTerm = searchInput.value.toLowerCase();
            console.log(' Buscando:', searchTerm);
            const productosFiltrados = misProductos.filter(producto => {
                return producto.nombre.toLowerCase().includes(searchTerm);
            });
            mostrarProductos(productosFiltrados);
        }

        function mostrarProductos(productos) {
            console.log(' Mostrando productos:', productos.length);
            productTableBody.innerHTML = '';
            
            if (productos.length > 0) {
                productos.forEach(producto => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td class="product-info">
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                            <span>${producto.nombre}</span>
                        </td>
                        <td>${producto.stock}</td>
                        <td>$${producto.precioOriginal}</td>
                        <td>${producto.precioOferta ? `$${producto.precioOferta}` : '-'}</td>
                        <td class="actions-buttons">
                            <a href="./comercio.nuevo-producto.html?id=${producto.id}" class="btn-icon-sm">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn-icon-sm btn-delete" data-id="${producto.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    productTableBody.appendChild(fila);
                });

                // Agregar eventos de eliminar
                productTableBody.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const idProducto = e.currentTarget.dataset.id;
                        const producto = misProductos.find(p => p.id === idProducto);
                        if (producto) {
                            abrirModalEliminar(producto);
                        }
                    });
                });
            } else {
                productTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No hay productos que coincidan.</td></tr>`;
            }
        }

        // ========================================
        // EVENTOS DE BÚSQUEDA Y FILTROS
        // ========================================
        aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
        
        quitarFiltrosBtn.addEventListener('click', () => {
            ordenSelect.value = 'mas-nuevos';
            categoriaSelect.value = 'todas';
            disponibilidadBtns.forEach(btn => btn.classList.remove('active'));
            document.getElementById('todos-btn').classList.add('active');
            disponibilidadActiva = 'todos';
            aplicarFiltros();
        });

        searchBtn.addEventListener('click', buscarProductos);
        
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                buscarProductos();
            }
        });
        
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                aplicarFiltros();
            }
        });

        // ========================================
        // CARGAR PRODUCTOS AL INICIAR
        // ========================================
        async function cargarYMostrarProductos() {
            console.log(' Cargando productos del usuario...');
            misProductos = await obtenerMisProductos();
            console.log(' Productos cargados:', misProductos.length);
            aplicarFiltros();
        }

        // Asignar la función a la variable global para que sea accesible desde eliminarProducto
        cargarYMostrarProductosGlobal = cargarYMostrarProductos;

        // INICIAR CARGA
        await cargarYMostrarProductos();
    }
});
