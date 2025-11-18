import { Pedido } from '../models/Pedido.js';
import Product from '../models/product.model.js';
import { PickUpPoint } from '../models/PickUpPoint.js';
import { PuntoRetiroPublico } from '../models/PuntoRetiroPublico.js';
import UserModel from '../models/user.models.js';

// @desc    Crear un nuevo pedido (Reservar)
// @route   POST /api/pedidos/crear
// @access  Private (Consumidor)
export const crearPedido = async (req, res) => {
    try {
        const consumidorId = req.user.id;
        const { comercianteId, puntoRetiro, horarioRetiro, totalVenta, productos } = req.body;

        // Validación de datos de entrada
        if (!comercianteId || !puntoRetiro || !horarioRetiro || !totalVenta || !productos || productos.length === 0) {
            return res.status(400).json({ success: false, message: 'Faltan datos para crear el pedido.' });
        }

        // Verificar que el comerciante existe
        const comerciante = await UserModel.findById(comercianteId);
        if (!comerciante || comerciante.role !== 'comercio') {
            return res.status(404).json({ success: false, message: 'Comerciante no encontrado.' });
        }

        // Validar que todos los productos existan y pertenezcan al comerciante
        for (const item of productos) {
            const producto = await Product.findById(item.productoId);
            if (!producto) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Producto con ID ${item.productoId} no encontrado.` 
                });
            }
            if (producto.user_id.toString() !== comercianteId) {
                return res.status(400).json({ 
                    success: false, 
                    message: `El producto ${producto.nombre_producto} no pertenece a este comerciante.` 
                });
            }
            // Verificar stock disponible
            if (producto.cantidad_disponible < item.cantidad) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Stock insuficiente para ${producto.nombre_producto}. Disponible: ${producto.cantidad_disponible}` 
                });
            }
        }

        const nuevoPedido = new Pedido({
            consumidorId,
            comercianteId,
            productos,
            totalVenta,
            horarioRetiro,
            puntoDeRetiro: puntoRetiro,
            estado: 'pendiente'
        });

        await nuevoPedido.save();

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente. El comerciante debe confirmar tu pedido.',
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
        console.log('🔍 getPedidosByComerciante - Usuario:', req.user);
        const comercianteId = req.user.id;
        console.log('🔍 Buscando pedidos para comercianteId:', comercianteId);
        
        const pedidos = await Pedido.find({ comercianteId: comercianteId })
            .populate({
                path: 'consumidorId',
                select: 'username email telefono',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'productos.productoId',
                select: 'nombre_producto precio_original precio_descuento',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        console.log('✓ Pedidos encontrados:', pedidos.length);

        res.status(200).json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        console.error('❌ Error al obtener los pedidos del comerciante:', error);
        console.error('❌ Stack trace:', error.stack);
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

// @desc    Obtener todos los pedidos de un consumidor
// @route   GET /api/pedidos/consumidor
// @access  Private (Consumidor)
export const getPedidosByConsumidor = async (req, res) => {
    try {
        console.log('🔍 getPedidosByConsumidor - Usuario:', req.user);
        const consumidorId = req.user.id;
        console.log('🔍 Buscando pedidos para consumidorId:', consumidorId);
        
        const pedidos = await Pedido.find({ consumidorId: consumidorId })
            .populate({
                path: 'comercianteId',
                select: 'username email telefono direccion fotoPerfil',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'productos.productoId',
                select: 'nombre_producto foto_url',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });

        console.log('✓ Pedidos encontrados:', pedidos.length);
        
        res.status(200).json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        console.error('❌ Error al obtener los pedidos del consumidor:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Aceptar un pedido
// @route   PUT /api/pedidos/aceptar/:id
// @access  Private (Comerciante)
export const aceptarPedido = async (req, res) => {
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
            return res.status(400).json({ 
                success: false, 
                message: `No se puede aceptar un pedido en estado '${pedido.estado}'.` 
            });
        }

        pedido.estado = 'aceptado';
        await pedido.save();

        res.status(200).json({
            success: true,
            message: 'Pedido aceptado exitosamente.',
            data: pedido
        });
    } catch (error) {
        console.error('Error al aceptar el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Rechazar un pedido
// @route   PUT /api/pedidos/rechazar/:id
// @access  Private (Comerciante)
export const rechazarPedido = async (req, res) => {
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
            return res.status(400).json({ 
                success: false, 
                message: `No se puede rechazar un pedido en estado '${pedido.estado}'.` 
            });
        }

        pedido.estado = 'rechazado';
        await pedido.save();

        res.status(200).json({
            success: true,
            message: 'Pedido rechazado.',
            data: pedido
        });
    } catch (error) {
        console.error('Error al rechazar el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Entregar un pedido (marcar como entregado)
// @route   PUT /api/pedidos/entregar/:id
// @access  Private (Comerciante o Consumidor para verificar)
export const entregarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
        }

        // Puede ser actualizado por comerciante o consumidor
        const esComercianteMod = pedido.comercianteId.toString() === userId;
        const esConsumidor = pedido.consumidorId.toString() === userId;

        if (!esComercianteMod && !esConsumidor) {
            return res.status(403).json({ success: false, message: 'No autorizado para modificar este pedido.' });
        }

        if (pedido.estado !== 'aceptado') {
            return res.status(400).json({ 
                success: false, 
                message: `Solo se pueden marcar como entregados los pedidos aceptados. Estado actual: '${pedido.estado}'.` 
            });
        }

        pedido.estado = 'entregado';
        await pedido.save();

        // Si el pedido se marca como entregado, actualizar stock
        const stockUpdatePromises = pedido.productos.map(item => {
            return Product.findByIdAndUpdate(
                item.productoId,
                { $inc: { cantidad_disponible: -item.cantidad } },
                { new: true, runValidators: true }
            );
        });

        await Promise.all(stockUpdatePromises);

        res.status(200).json({
            success: true,
            message: 'Pedido marcado como entregado y stock actualizado.',
            data: pedido
        });
    } catch (error) {
        console.error('Error al entregar el pedido:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Obtener puntos de retiro públicos
// @route   GET /api/pedidos/puntos-retiro
// @access  Public
export const getPuntosRetiroPublicos = async (req, res) => {
    try {
        const puntos = await PuntoRetiroPublico.find({ activo: true });
        res.status(200).json({
            success: true,
            count: puntos.length,
            data: puntos
        });
    } catch (error) {
        console.error('Error al obtener puntos de retiro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};