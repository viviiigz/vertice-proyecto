//este es el js para la pagina de estadisticas
document.addEventListener('DOMContentLoaded', async () => {

    const ctx = document.getElementById('ventasChart');

    if (!ctx) {
        console.error('No se encontró el elemento canvas con el ID "ventasChart".');
        return;
    }
    
    // Función para obtener los datos de ventas de tu servidor
    async function obtenerDatosVentas() {
        try {
            // Reemplaza esta URL con la ruta real de tu API para ventas
            const response = await fetch('/api/ventas');

            if (!response.ok) {
                // Si la respuesta no es 200 OK, lanzamos un error
                throw new Error('No se pudieron obtener los datos de ventas.');
            }

            const datos = await response.json();
            return datos;
        } catch (error) {
            console.error('Error al obtener los datos de ventas:', error);
            // Devuelve un array vacío en caso de error para que la gráfica no falle
            return { labels: [], datasets: [{ data: [] }] };
        }
    }

    // Obtenemos los datos y configuramos la gráfica
    const datosVentas = await obtenerDatosVentas();

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

    // Crea la gráfica con los datos obtenidos del servidor
    new Chart(ctx, {
        type: 'bar',
        data: datosVentas,
        options: opcionesGrafico
    });
});

// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Datos de la gráfica: etiquetas (meses) pero con todos los valores en 0
    const datosVentasVacios = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], // Meses
        datasets: [{
            label: 'Ventas Mensuales ($)',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Todos los datos en cero
            backgroundColor: 'rgba(76, 211, 9, 0.5)', // Color verde de Vértice
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

    const ctx = document.getElementById('ventasChart');

    if (ctx) { // Asegúrate de que el canvas exista antes de intentar crear el gráfico
        // Crea la gráfica con los datos de simulación vacíos
        new Chart(ctx, {
            type: 'bar',
            data: datosVentasVacios,
            options: opcionesGrafico
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const productTableBody = document.getElementById('product-table-body');
    const formNuevoProducto = document.getElementById('form-nuevo-producto');

    // Funciones de utilidad para manejar los datos
    function obtenerProductos() {
        const productos = localStorage.getItem('productos');
        return productos ? JSON.parse(productos) : [];
    }

    // NUEVA FUNCIÓN: Obtener un producto por su ID
    function obtenerProductoPorId(id) {
        const productos = obtenerProductos();
        return productos.find(p => p.id == id);
    }
    
    // FUNCIÓN MODIFICADA: Ahora actualiza si el producto ya tiene un ID, o lo crea si no lo tiene
    function guardarProducto(producto) {
        let productos = obtenerProductos();
        
        // Si el producto ya tiene un ID, lo actualizamos
        if (producto.id) {
            productos = productos.map(p => p.id === producto.id ? producto : p);
        } else {
            // Si no tiene un ID, es un producto nuevo
            producto.id = Date.now();
            productos.push(producto);
        }
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    function eliminarProducto(id) {
        let productos = obtenerProductos();
        productos = productos.filter(producto => producto.id != id);
        localStorage.setItem('productos', JSON.stringify(productos));
        
        if (productTableBody) {
            aplicarFiltros(); 
        }
    }

    // Lógica para la página de Productos
    if (productTableBody) {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        // Referencias a los elementos del filtro
        const filtroBtn = document.getElementById('filtro-btn');
        const filtroModal = document.getElementById('filtro-modal');
        const aplicarFiltrosBtn = document.getElementById('aplicar-filtros-btn');
        const quitarFiltrosBtn = document.getElementById('quitar-filtros-btn');
        const ordenSelect = document.getElementById('orden-select');
        const categoriaSelect = document.getElementById('categoria-select');
        const disponibilidadBtns = document.querySelectorAll('.availability-buttons button');
        let disponibilidadActiva = 'todos';

        // Lógica para el modal de filtros
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

        function aplicarFiltros() {
            let productos = obtenerProductos();

            if (disponibilidadActiva === 'en') {
                productos = productos.filter(p => p.stock > 0);
            } else if (disponibilidadActiva === 'sin') {
                productos = productos.filter(p => p.stock <= 0);
            }

            if (categoriaSelect && categoriaSelect.value !== 'todas') {
                productos = productos.filter(p => p.categoria === categoriaSelect.value);
            }

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
            mostrarProductos(productos);
            filtroModal.style.display = 'none';
        }

        aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
        quitarFiltrosBtn.addEventListener('click', () => {
            ordenSelect.value = 'mas-nuevos';
            categoriaSelect.value = 'todas';
            disponibilidadBtns.forEach(btn => btn.classList.remove('active'));
            document.getElementById('todos-btn').classList.add('active');
            disponibilidadActiva = 'todos';
            aplicarFiltros();
        });

        function buscarProductos() {
            const searchTerm = searchInput.value.toLowerCase();
            const productos = obtenerProductos();
            const productosFiltrados = productos.filter(producto => {
                return producto.nombre.toLowerCase().includes(searchTerm);
            });
            mostrarProductos(productosFiltrados);
        }

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

        function mostrarProductos(productos) {
            productTableBody.innerHTML = '';
            if (productos.length > 0) {
                productos.forEach(producto => {
                    const fila = document.createElement('tr');
                    const precioOriginal = producto.precioOriginal ? `$${producto.precioOriginal}` : '-';
                    const precioOferta = producto.precioOferta ? `$${producto.precioOferta}` : '-';

                    // La parte más importante para el botón de editar
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
        <button class="btn-icon-sm" data-id="${producto.id}"><i class="fas fa-trash"></i></button>
    </td>
`;
                    productTableBody.appendChild(fila);
                });
            } else {
                productTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No hay productos que coincidan.</td></tr>`;
            }

            productTableBody.querySelectorAll('.fa-trash').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idProducto = e.target.closest('button').dataset.id;
                    eliminarProducto(idProducto);
                });
            });
        }
        aplicarFiltros();
    }
    
    // Lógica para la página de Nuevo Producto (el formulario)
    if (formNuevoProducto) {
        const fileUploadBox = document.getElementById('file-upload-box');
        const inputFile = document.getElementById('imagen');
        const fileNameSpan = document.getElementById('file-name');
        const formTitle = document.querySelector('h1');
        const saveBtn = document.getElementById('guardar-producto-btn');

        // Lógica para detectar si estamos editando o creando un nuevo producto
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (productId) {
            const producto = obtenerProductoPorId(productId);
            if (producto) {
                formTitle.textContent = 'Editar Producto';
                saveBtn.textContent = 'Guardar Cambios';

                // Llenamos el formulario con los datos del producto
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('descripcion').value = producto.descripcion;
                document.getElementById('stock').value = producto.stock;
                document.getElementById('precio-original').value = producto.precioOriginal;
                document.getElementById('precio-oferta').value = producto.precioOferta;
                // Asumiendo que tienes un input de categoría con el id 'categoria-input'
                document.getElementById('categoria-input').value = producto.categoria;
                fileNameSpan.textContent = "Imagen cargada"; 
                
                // Mantenemos el ID en el formulario para la actualización
                formNuevoProducto.dataset.productId = producto.id;
            }
        }

        fileUploadBox.addEventListener('click', () => inputFile.click());
        inputFile.addEventListener('change', () => {
            if (inputFile.files.length > 0) {
                fileNameSpan.textContent = inputFile.files[0].name;
            } else {
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
            }
        });

        formNuevoProducto.addEventListener('submit', (event) => {
            event.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const descripcion = document.getElementById('descripcion').value;
            const stock = document.getElementById('stock').value;
            const precioOriginal = document.getElementById('precio-original').value;
            const precioOferta = document.getElementById('precio-oferta').value;
            const categoria = document.getElementById('categoria-input').value; 
            const imagenFile = inputFile.files[0];
            const productoId = formNuevoProducto.dataset.productId;

            if (nombre && stock && precioOriginal) {
                const productoData = {
                    id: productoId ? parseInt(productoId) : null,
                    nombre: nombre,
                    stock: stock,
                    precioOriginal: precioOriginal,
                    precioOferta: precioOferta,
                    descripcion: descripcion,
                    categoria: categoria,
                };

                if (imagenFile) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        productoData.imagen = e.target.result;
                        guardarProducto(productoData);
                        window.location.href = './comercio.producto.html';
                    };
                    reader.readAsDataURL(imagenFile);
                } else {
                    // Si no se selecciona nueva imagen, mantén la anterior
                    if (productoId) {
                        const productoExistente = obtenerProductoPorId(productoId);
                        productoData.imagen = productoExistente.imagen;
                    } else {
                        productoData.imagen = 'https://via.placeholder.com/50';
                    }
                    guardarProducto(productoData);
                    window.location.href = './comercio.producto.html';
                }
            }
        });
    }
});