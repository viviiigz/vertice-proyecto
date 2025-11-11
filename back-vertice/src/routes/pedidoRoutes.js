import express from 'express';
import {
    crearPedido,
    getPedidosByComerciante,
    cancelarPedido,
    completarPedido
} from '../controllers/pedidoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = express.Router();

// Ruta para que el consumidor cree un pedido
router.post('/crear', authMiddleware, authRole(['consumidor']), crearPedido);

// Rutas para que el comerciante gestione sus pedidos
router.get('/comerciante', authMiddleware, authRole(['comercio']), getPedidosByComerciante);
router.put('/cancelar/:id', authMiddleware, authRole(['comercio']), cancelarPedido);
router.put('/completar/:id', authMiddleware, authRole(['comercio']), completarPedido);

export default router;