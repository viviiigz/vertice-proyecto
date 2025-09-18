import { Router } from 'express';
<<<<<<< HEAD
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
=======
import { getProducts, getProductById } from '../controllers/product.controllers.js';

const router = Router();

// Ruta para obtener todos los productos (público)
router.get('/', getProducts);

// Ruta para obtener un solo producto por su ID (público)
router.get('/:id', getProductById);

export default router;
>>>>>>> 046f3377b3068214d458d38aece19cb8bd84e8bc
