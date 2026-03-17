// controllers/product.controllers.js
import Product from "../models/product.model.js";
import { normalizeProductType } from "../models/product.model.js";
import { validationResult } from "express-validator";

// Devuelve el valor de filtro MongoDB para tipo_producto según la categoria pedida.
// Maneja el alias frescos <-> frutas-y-verduras por compatibilidad con datos viejos.
const buildTipoProductoFilter = (categoria) => {
  if (!categoria || typeof categoria !== 'string' || !categoria.trim()) {
    return null;
  }
  const cat = normalizeProductType(categoria);
  if (cat === 'frutas-y-verduras' || cat === 'frescos') {
    // Productos antiguos usan 'frescos', nuevos usan 'frutas-y-verduras'
    return { $in: ['frutas-y-verduras', 'frescos'] };
  }
  return cat;
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    // Si se subió una imagen, guarda el nombre del archivo en foto_url
    let foto_url = null;
    if (req.file) {
      foto_url = req.file.filename;
    }

    const productData = {
      ...req.body,
      user_id: userId,
      foto_url
    };

    // Limpiar campos opcionales con string vacío para evitar error de validación de enum en Mongoose
    if (!productData.tipo_producto) delete productData.tipo_producto;
    if (!productData.categoria) delete productData.categoria;

    // Si la categoría es 'para-donar', asegurar que los precios sean 0
    if (productData.categoria === 'para-donar') {
      productData.precio_original = 0;
      productData.precio_descuento = 0;
      console.log('💚 Producto para-donar: Precios establecidos en 0');
    } else {
      // Para otras categorías, asegurar que tengan precio original
      if (!productData.precio_original || productData.precio_original === '0') {
        return res.status(400).json({ 
          message: 'El precio original es requerido para productos que no son donaciones' 
        });
      }
    }

    const savedProduct = await Product.create(productData);

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto", error: error.message });
  }
};

// GET /api/productos
// ?categoria=<tipo_producto>  → filtra exactamente por tipo_producto, excluye para-donar
// sin ?categoria              → devuelve TODOS los productos (excluye para-donar)
// ?q=<texto>                  → búsqueda textual adicional (acumulable)
// ?page=N  ?limit=N           → paginación
export const getProducts = async (req, res) => {
  try {
    const { tipo_producto, categoria, q, page = 1, limit = 50 } = req.query;

    // Acepta el param 'categoria' (nuevo) o 'tipo_producto' (legacy)
    const rawCategoria = (categoria || tipo_producto || '').trim();
    const tipoFilter = buildTipoProductoFilter(rawCategoria);

    // Base: siempre excluir productos de donación del marketplace
    let filter = { categoria: { $ne: 'para-donar' } };

    if (tipoFilter) {
      // Filtro específico de tipo_producto
      filter.tipo_producto = tipoFilter;
    }

    // Búsqueda textual opcional
    if (q && typeof q === 'string' && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // Integrar búsqueda OR sobre nombre y descripción manteniendo el filtro base
      filter = {
        $and: [ filter, { $or: [ { nombre_producto: regex }, { descripcion: regex } ] } ]
      };
    }

    // Convertir a número y validar paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 por página
    const skip = (pageNum - 1) * limitNum;

    // Obtener el total de productos que cumplen el filtro
    const total = await Product.countDocuments(filter);

    // Obtener productos paginados
    const products = await Product.find(filter)
      .populate('user_id', 'username email role')
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (process.env.NODE_ENV !== 'production') {
      console.log('[GET /api/productos] filter usado =>', JSON.stringify(filter));
      console.log(`[GET /api/productos] page=${pageNum}, limit=${limitNum}, total=${total}, devuelto=${products.length}`);
    }

    return res.status(200).json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + products.length < total
      }
    });
  } catch (error) {
    console.error('Error en getProducts:', error);
    return res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user_id', 'username email role');

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto" });
  }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar que el producto pertenece al usuario autenticado
    if (product.user_id.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este producto" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
  }
};

// Obtener todos los productos de un usuario específico
export const getProductsByUser = async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.params.userId }).populate('user_id', 'username email role');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos del usuario" });
  }
};

// Obtener todos los productos del usuario autenticado (mis productos)
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id; // Obtenido del token JWT mediante authMiddleware
    const products = await Product.find({ user_id: userId }).populate('user_id', 'username email role');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener mis productos:', error);
    res.status(500).json({ message: "Error al obtener tus productos" });
  }
};
