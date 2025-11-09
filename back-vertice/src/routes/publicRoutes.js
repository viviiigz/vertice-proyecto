// archivo: routes/publicRoutes.js

import express from 'express';
import { getPuntosDeRetiro } from '../controllers/publicController.js';

const router = express.Router();

// Ruta pública para que los consumidores vean las opciones
router.get('/puntos-publicos', getPuntosDeRetiro);

export default router;