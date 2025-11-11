import express from 'express';
import {
    createPickUpPoint,
    getPickUpPointsByComerciante,
    updatePickUpPoint,
    deletePickUpPoint
} from '../controllers/pickUpPointController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = express.Router();

// Todas las rutas aquí requieren autenticación y rol de 'comerciante'
router.use(authMiddleware, authRole(['comercio']));

router.route('/')
    .post(createPickUpPoint)
    .get(getPickUpPointsByComerciante);

router.route('/:id')
    .put(updatePickUpPoint)
    .delete(deletePickUpPoint);

export default router;