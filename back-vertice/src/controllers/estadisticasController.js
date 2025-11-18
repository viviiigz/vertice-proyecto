import { Pedido } from '../models/Pedido.js';
import mongoose from 'mongoose';

// @desc    Obtener estadísticas para el dashboard del comerciante
// @route   GET /api/comercio/estadisticas
// @access  Private (Comerciante)
export const getEstadisticasComerciante = async (req, res) => {
    try {
        const comercianteId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Calcular métricas de pedidos 'entregado' (ambos marcaron como entregado)
        const completedOrdersStats = await Pedido.aggregate([
            {
                $match: {
                    comercianteId: comercianteId,
                    estado: 'entregado'
                }
            },
            {
                $group: {
                    _id: null,
                    totalVentas: { $sum: '$totalVenta' }
                }
            }
        ]);

        // 2. Calcular total de productos vendidos (solo pedidos entregados)
        const productosVendidosStats = await Pedido.aggregate([
            {
                $match: {
                    comercianteId: comercianteId,
                    estado: 'entregado'
                }
            },
            { $unwind: '$productos' },
            {
                $group: {
                    _id: null,
                    totalProductos: { $sum: '$productos.cantidad' }
                }
            }
        ]);

        // 3. Calcular ventas por mes (solo pedidos entregados)
        const ventasPorMes = await Pedido.aggregate([
            {
                $match: {
                    comercianteId: comercianteId,
                    estado: 'entregado'
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalVentaMes: { $sum: '$totalVenta' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // 4. Contar pedidos pendientes del día actual solamente
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Inicio del día siguiente

        const nuevosPedidos = await Pedido.countDocuments({
            comercianteId: comercianteId,
            estado: 'pendiente',
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Formatear resultados
        const totalVentas = completedOrdersStats.length > 0 ? completedOrdersStats[0].totalVentas : 0;
        const productosVendidos = productosVendidosStats.length > 0 ? productosVendidosStats[0].totalProductos : 0;
        
        const ventasMensualesFormato = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, total: 0 }));
        ventasPorMes.forEach(item => {
            const mesIndex = item._id - 1;
            if (mesIndex >= 0 && mesIndex < 12) {
                ventasMensualesFormato[mesIndex].total = item.totalVentaMes;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalVentas,
                productosVendidos,
                ventasPorMes: ventasMensualesFormato,
                nuevosPedidos
            }
        });

    } catch (error) {
        console.error('Error al calcular estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};