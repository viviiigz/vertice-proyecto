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

// Obtener productos para donar (banco de alimentos)
router.get('/para-donar', async (req, res) => {
  try {
    const ProductModel = (await import('../models/product.model.js')).default;
    
    const productosParaDonar = await ProductModel.find({
      categoria: 'para-donar',
      cantidad_disponible: { $gt: 0 } // Solo productos con stock disponible
    })
    .populate('user_id', 'username email foto_perfil')
    .sort({ fecha_vencimiento: 1 }); // Ordenar por fecha de vencimiento (más próximos primero)

    console.log(`📦 Productos para donar encontrados: ${productosParaDonar.length}`);

    return res.status(200).json({
      success: true,
      productos: productosParaDonar,
      total: productosParaDonar.length
    });
  } catch (error) {
    console.error('Error al obtener productos para donar:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener productos para donación'
    });
  }
});

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
