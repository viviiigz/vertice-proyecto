import express from 'express';
import {
    crearPedido,
    getPedidosByComerciante,
    getPedidosByConsumidor,
    cancelarPedido,
    completarPedido,
    aceptarPedido,
    rechazarPedido,
    entregarPedido,
    getPuntosRetiroPublicos
} from '../controllers/pedidoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = express.Router();

// Ruta pública para obtener puntos de retiro
router.get('/puntos-retiro', getPuntosRetiroPublicos);

// Rutas para consumidores y bancos
router.post('/crear', authMiddleware, authRole(['consumidor', 'banco']), crearPedido);
router.get('/consumidor', authMiddleware, authRole(['consumidor', 'banco']), getPedidosByConsumidor);

// Rutas para comerciantes
router.get('/comerciante', authMiddleware, authRole(['comercio']), getPedidosByComerciante);
router.put('/aceptar/:id', authMiddleware, authRole(['comercio']), aceptarPedido);
router.put('/rechazar/:id', authMiddleware, authRole(['comercio']), rechazarPedido);
router.put('/cancelar/:id', authMiddleware, authRole(['comercio']), cancelarPedido);
router.put('/completar/:id', authMiddleware, authRole(['comercio']), completarPedido);

// Ruta compartida para marcar como entregado (comerciante o consumidor)
router.put('/entregar/:id', authMiddleware, authRole(['comercio', 'consumidor']), entregarPedido);

export default router;