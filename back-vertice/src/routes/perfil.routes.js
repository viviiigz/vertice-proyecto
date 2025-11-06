import { Router } from 'express';
import { getPerfil, updatePerfil } from '../controllers/perfil.controllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authMiddleware);

// GET /api/perfil - Obtener datos del perfil
router.get('/', getPerfil);

// PUT /api/perfil - Actualizar perfil
router.put('/', updatePerfil);

export default router;
