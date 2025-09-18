import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controllers.js';
import { validateProduct } from '../middlewares/validations/product.validator.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = Router();

// Público
router.get('/', getProducts);
router.get('/:id', getProductById);

// Privado (solo comercios pueden crear productos)
router.post(
  '/',
  authMiddleware,
  authRole(['comercio']), // solo comercios
  validateProduct,
  createProduct
);

// Actualizar y eliminar igual
router.put(
  '/:id',
  authMiddleware,
  authRole(['comercio']),
  validateProduct,
  updateProduct
);
router.delete(
  '/:id',
  authMiddleware,
  authRole(['comercio']),
  deleteProduct
);

export default router;
