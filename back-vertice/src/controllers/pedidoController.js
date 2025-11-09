import { Pedido } from '../models/Pedido.js';
import Product from '../models/product.model.js';
import { PickUpPoint } from '../models/PickUpPoint.js';
import UserModel from '../models/user.models.js';

// @desc    Crear un nuevo pedido (Reservar)
// @route   POST /api/pedidos/crear
// @access  Private (Consumidor)
export const crearPedido = async (req, res) => {
    try {
        const consumidorId = req.user.id;
        const { comercianteId, pickUpPointId, horarioRetiro, totalVenta, productos } = req.body;

        // Validación de datos de entrada
        if (!comercianteId || !pickUpPointId || !horarioRetiro || !totalVenta || !productos || productos.length === 0) {
            return res.status(400).json({ success: false, message: 'Faltan datos para crear el pedido.' });
        }

        // Verificar que el comerciante y el punto de retiro existen
    const comerciante = await UserModel.findById(comercianteId);
        const pickUpPoint = await PickUpPoint.findById(pickUpPointId);

        if (!comerciante || comerciante.role !== 'comercio') {
            return res.status(404).json({ success: false, message: 'Comerciante no encontrado.' });
        }
        if (!pickUpPoint || pickUpPoint.comercianteId.toString() !== comercianteId) {
            return res.status(404).json({ success: false, message: 'Punto de retiro no válido para este comerciante.' });
        }

        // El schema de Pedido usa 'puntoDeRetiro' (string). Guardamos el nombre del punto.
        const nuevoPedido = new Pedido({
            consumidorId,
            comercianteId,
            productos,
            totalVenta,
            horarioRetiro,
            puntoDeRetiro: pickUpPoint?.nombre || 'Punto de retiro',
            estado: 'pendiente'
        });

        await nuevoPedido.save();

        res.status(201).json({
            success: true,
            message: 'Pedido creado (reservado) exitosamente.',
            data: nuevoPedido
        });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Obtener todos los pedidos de un comerciante
// @route   GET /api/pedidos/comerciante
// @access  Private (Comerciante)
export const getPedidosByComerciante = async (req, res) => {
    try {
        const comercianteId = req.user.id;
        const pedidos = await Pedido.find({ comercianteId: comercianteId })
            .populate('consumidorId', 'username email')
            // Nota: Pedido no guarda pickUpPointId; muestra puntoDeRetiro como string
            // .populate('productos.productoId', 'nombre_producto') // Solo si el ref coincide con el modelo
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        console.error('Error al obtener los pedidos del comerciante:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Cancelar un pedido
// @route   PUT /api/pedidos/cancelar/:id
// @access  Private (Comerciante)
export const cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const comercianteId = req.user.id;

        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
        }

        if (pedido.comercianteId.toString() !== comercianteId) {
            return res.status(403).json({ success: false, message: 'No autorizado para modificar este pedido.' });
        }

        if (pedido.estado !== 'pendiente') {
            return res.status(400).json({ success: false, message: `No se puede cancelar un pedido en estado '${pedido.estado}'.` });
        }

        pedido.estado = 'cancelado';
        await pedido.save();

        res.status(200).json({
            success: true,
            message: 'Pedido cancelado exitosamente.',
            data: pedido
        });
    } catch (error) {
        console.error('Error al cancelar el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Completar un pedido y actualizar stock
// @route   PUT /api/pedidos/completar/:id
// @access  Private (Comerciante)
export const completarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const comercianteId = req.user.id;

        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
        }

        if (pedido.comercianteId.toString() !== comercianteId) {
            return res.status(403).json({ success: false, message: 'No autorizado para modificar este pedido.' });
        }

        if (pedido.estado !== 'pendiente') {
            return res.status(400).json({ success: false, message: `No se puede completar un pedido en estado '${pedido.estado}'.` });
        }

        // --- Transacción para actualizar stock ---
        const stockUpdatePromises = pedido.productos.map(item => {
            return Product.findByIdAndUpdate(
                item.productoId,
                { $inc: { cantidad_disponible: -item.cantidad } },
                { new: true, runValidators: true }
            );
        });

        const updatedProducts = await Promise.all(stockUpdatePromises);

        // Verificar si alguna actualización de producto falló
        if (updatedProducts.some(p => p === null)) {
            return res.status(400).json({ success: false, message: 'Error al actualizar el stock de uno o más productos. No se completó el pedido.' });
        }

        // Si todo OK, cambiar estado del pedido
        pedido.estado = 'completado';
        await pedido.save();

        res.status(200).json({
            success: true,
            message: 'Pedido completado y stock actualizado.',
            data: pedido
        });
    } catch (error) {
        console.error('Error al completar el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};