import express from 'express';
import { getEstadisticasComerciante } from '../controllers/estadisticasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = express.Router();

// Esta ruta requiere autenticación y rol de 'comerciante'
router.get('/estadisticas', authMiddleware, authRole(['comercio']), getEstadisticasComerciante);

export default router;