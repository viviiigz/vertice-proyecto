import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByUser,
  getMyProducts
} from '../controllers/product.controllers.js';
import { validateProduct } from '../middlewares/validations/product.validator.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';
import multer from 'multer';

const router = Router();

// Público
router.get('/', getProducts);
router.get('/user/:userId', getProductsByUser); // IMPORTANTE: Esta ruta debe ir ANTES de /:id

// Obtener mis productos (usuario autenticado) - DEBE ir antes de /:id
router.get('/my/productos', authMiddleware, getMyProducts);

router.get('/:id', getProductById);

// Privado (solo comercios pueden crear productos)
const upload = multer({ dest: 'uploads/' });

router.post(
  '/',
  authMiddleware,
  authRole(['comercio']),
  upload.single('foto_url'), 
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
