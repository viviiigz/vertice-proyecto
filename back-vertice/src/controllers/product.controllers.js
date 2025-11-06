// controllers/product.controllers.js
import Product from "../models/product.model.js";
import { validationResult } from "express-validator";

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

    const savedProduct = await Product.create(productData);

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto", error: error.message });
  }
};

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('user_id', 'username email role');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos" });
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
