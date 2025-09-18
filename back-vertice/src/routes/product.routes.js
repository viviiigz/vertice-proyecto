import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/product.controllers.js';

const router = Router();

// Ruta para obtener todos los productos (público)
router.get('/', getProducts);

// Ruta para obtener un solo producto por su ID (público)
router.get('/:id', getProductById);

export default router;