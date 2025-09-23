document.addEventListener('DOMContentLoaded', async () => {

    // Gráfica de ventas
    const ctx = document.getElementById('ventasChart');
    if (ctx) {
        async function obtenerDatosVentas() {
            try {
                const response = await fetch('/api/ventas');
                if (!response.ok) throw new Error('No se pudieron obtener los datos de ventas.');
                return await response.json();
            } catch (error) {
                console.error(error);
                return { labels: [], datasets: [{ data: [] }] };
            }
        }
        const datosVentas = await obtenerDatosVentas();
        new Chart(ctx, {
            type: 'bar',
            data: datosVentas,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Monto de Ventas' } },
                    x: { title: { display: true, text: 'Mes' } }
                },
                plugins: { legend: { display: true, position: 'top' }, title: { display: false } }
            }
        });
    }
});

// Lógica de Productos
document.addEventListener('DOMContentLoaded', () => {

    const productTableBody = document.getElementById('product-table-body');
    const formNuevoProducto = document.getElementById('form-nuevo-producto');
    const token = localStorage.getItem('token'); // JWT del usuario logueado
    const userId = localStorage.getItem('user_id'); // Guardar el ID del usuario logueado

    async function obtenerProductos() {
        try {
            const res = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al obtener productos');
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function eliminarProducto(id) {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar producto');
            aplicarFiltros();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar el producto');
        }
    }

    if (productTableBody) {
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

        filtroBtn.addEventListener('click', () => filtroModal.style.display = 'block');
        document.querySelector('.close-modal').addEventListener('click', () => filtroModal.style.display = 'none');
        window.addEventListener('click', (event) => { if (event.target == filtroModal) filtroModal.style.display = 'none'; });

        disponibilidadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                disponibilidadBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                disponibilidadActiva = btn.id.split('-')[0];
            });
        });

        async function aplicarFiltros() {
            let productos = await obtenerProductos();
            if (disponibilidadActiva === 'en') productos = productos.filter(p => p.cantidad_disponible > 0);
            else if (disponibilidadActiva === 'sin') productos = productos.filter(p => p.cantidad_disponible <= 0);

            if (categoriaSelect && categoriaSelect.value !== 'todas') productos = productos.filter(p => p.categoria === categoriaSelect.value);

            switch (ordenSelect.value) {
                case 'a-z': productos.sort((a, b) => a.nombre_producto.localeCompare(b.nombre_producto)); break;
                case 'z-a': productos.sort((a, b) => b.nombre_producto.localeCompare(a.nombre_producto)); break;
                case 'menor-precio': productos.sort((a, b) => parseFloat(a.precio_original) - parseFloat(b.precio_original)); break;
                case 'mayor-precio': productos.sort((a, b) => parseFloat(b.precio_original) - parseFloat(a.precio_original)); break;
                case 'mas-nuevos': productos.sort((a, b) => b.id - a.id); break;
                case 'mas-viejos': productos.sort((a, b) => a.id - b.id); break;
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
            obtenerProductos().then(productos => {
                const productosFiltrados = productos.filter(producto =>
                    producto.nombre_producto.toLowerCase().includes(searchTerm)
                );
                mostrarProductos(productosFiltrados);
            });
        }

        searchBtn.addEventListener('click', buscarProductos);
        searchInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') buscarProductos(); });
        searchInput.addEventListener('input', () => { if (searchInput.value.trim() === '') aplicarFiltros(); });

        function mostrarProductos(productos) {
            productTableBody.innerHTML = '';
            if (productos.length > 0) {
                productos.forEach(producto => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                    <td class="product-info">
                       <img src="${producto.foto_url || 'https://via.placeholder.com/50'}" alt="${producto.nombre_producto}">
                       <span>${producto.nombre_producto}</span>
                    </td>
                    <td>${producto.cantidad_disponible}</td>
                    <td>$${producto.precio_original}</td>
                    <td>$${producto.precio_descuento || '-'}</td>
                    <td class="actions-buttons">
                    <a href="./comercio.nuevo-producto.html?id=${producto.id}" class="btn-icon-sm">
                       <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn-icon-sm" data-id="${producto.id}"><i class="fas fa-trash"></i></button>
                    </td>`;
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

    // Página de Nuevo Producto
    if (formNuevoProducto) {
        const fileUploadBox = document.getElementById('file-upload-box');
        const inputFile = document.getElementById('imagen');
        const fileNameSpan = document.getElementById('file-name');
        const previewImg = document.getElementById('preview-img');

        fileUploadBox.addEventListener('click', () => inputFile.click());

        inputFile.addEventListener('change', () => {
            if (inputFile.files.length > 0) {
                const file = inputFile.files[0];
                fileNameSpan.textContent = file.name;

                // Mostrar preview
                const reader = new FileReader();
                reader.onload = e => {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
                previewImg.style.display = 'none';
            }
        });

        // Al enviar el formulario
        formNuevoProducto.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const descripcion = document.getElementById('descripcion').value;
            const stock = document.getElementById('stock').value;
            const precioOriginal = document.getElementById('precio-original').value;
            const precioOferta = document.getElementById('precio-oferta').value;
            const categoria = document.getElementById('categoria-input').value;
            const imagenFile = inputFile.files[0];

            const formData = new FormData();
            formData.append('nombre_producto', nombre);
            formData.append('descripcion', descripcion);
            formData.append('cantidad_disponible', stock);
            formData.append('precio_original', precioOriginal);
            formData.append('precio_descuento', precioOferta);
            formData.append('categoria', categoria);
            if (imagenFile) {
                formData.append('foto_url', imagenFile);
            }

            try {
                const res = await fetch('/api/productos', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }, // NO pongas Content-Type aquí
                    body: formData
                });

                // Leer respuesta cruda
                const text = await res.text();
                let body;
                try { body = JSON.parse(text); } catch (e) { body = text; }

                if (!res.ok) {
                    console.error('RESPUESTA ERROR DEL SERVIDOR:', res.status, body);
                    // muestra al usuario un mensaje claro
                    const serverMsg = (body && (body.message || body.error || (Array.isArray(body) ? JSON.stringify(body) : body))) || `HTTP ${res.status}`;
                    alert('Error al guardar el producto: ' + serverMsg);
                    return;
                }

                console.log('Producto creado correctamente:', body);
                window.location.href = './comercio.producto.html';
            } catch (err) {
                console.error('FALLÓ FETCH /api/productos:', err);
                alert('Error conectando con el servidor: ' + (err.message || err));
            }
        });
    }
});