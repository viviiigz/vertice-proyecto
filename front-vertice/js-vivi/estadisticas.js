document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Inicializando script de estadísticas...');

    const API_URL = 'http://localhost:3000/api';
    const token = localStorage.getItem('token');

    // Elementos del DOM para las tarjetas de estadísticas
    const totalVentasEl = document.getElementById('total-ventas');
    const productosVendidosEl = document.getElementById('productos-vendidos');
    const nuevosPedidosEl = document.getElementById('nuevos-pedidos');
    const ticketPromedioEl = document.getElementById('ticket-promedio');

    // Contexto para el gráfico de Chart.js
    const ctx = document.getElementById('ventasChart').getContext('2d');
    let ventasChart;

    // Función para obtener las estadísticas desde el backend
    async function cargarEstadisticas() {
        if (!token) {
            console.error('No se encontró token de autenticación.');
            window.location.href = 'login.html';
            return;
        }

        try {
            console.log('🔄 Cargando estadísticas desde la API...');
            const response = await fetch(`${API_URL}/comercio/estadisticas`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success) {
                console.log('✅ Estadísticas recibidas:', resultado.data);
                actualizarDashboard(resultado.data);
            } else {
                throw new Error(resultado.message || 'No se pudieron cargar las estadísticas.');
            }
        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
            // Aquí podrías mostrar un mensaje de error en la UI
        }
    }

    // Función para actualizar el DOM con los datos recibidos
    function actualizarDashboard(data) {
        // Formatear números como moneda
        const formatCurrency = (value) => `$${(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Actualizar tarjetas
        if (totalVentasEl) totalVentasEl.textContent = formatCurrency(data.totalVentas);
        if (productosVendidosEl) productosVendidosEl.textContent = data.productosVendidos || 0;
        if (nuevosPedidosEl) nuevosPedidosEl.textContent = data.nuevosPedidos || 0;

        // Calcular y mostrar ticket promedio (totalVentas / totalPedidosCompletados)
        const totalPedidosCompletados = data.ventasPorMes.reduce((acc, mes) => acc + (mes.total > 0 ? 1 : 0), 0); // Esto es una aproximación, necesitaríamos el conteo real de pedidos.
        const ticketPromedio = data.totalVentas > 0 && totalPedidosCompletados > 0 ? data.totalVentas / totalPedidosCompletados : 0;
        if (ticketPromedioEl) ticketPromedioEl.textContent = formatCurrency(ticketPromedio);


        // Actualizar gráfico
        renderizarGraficoVentas(data.ventasPorMes);
    }

    // Función para renderizar el gráfico de ventas mensuales
    function renderizarGraficoVentas(ventasPorMes) {
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dataPoints = ventasPorMes.map(item => item.total);

        if (ventasChart) {
            ventasChart.destroy(); // Destruir gráfico anterior si existe
        }

        ventasChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: dataPoints,
                    backgroundColor: 'rgba(76, 211, 9, 0.2)',
                    borderColor: 'rgba(76, 211, 9, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    hoverBackgroundColor: 'rgba(76, 211, 9, 0.4)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Cargar los datos al iniciar
    cargarEstadisticas();
});
