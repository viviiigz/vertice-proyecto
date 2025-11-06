// controllers/product.controllers.js
import Product from "../models/product.model.js";
import { validationResult } from "express-validator";

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
  console.log("Iniciando creación de producto...");
  console.log("Usuario autenticado:", req.user);
  console.log("Body recibido:", req.body);
  console.log("Archivo recibido:", req.file);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
  console.log("Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
  console.log("User ID:", userId);

    // Si se subió una imagen, guarda el nombre del archivo en foto_url
    let foto_url = null;
    if (req.file) {
      foto_url = req.file.filename;
  console.log("Imagen guardada como:", foto_url);
    }

    const productData = {
      ...req.body,
      user_id: userId,
      foto_url
    };
  console.log("Datos del producto a crear:", productData);

    const savedProduct = await Product.create(productData);
  console.log("Producto creado exitosamente:", savedProduct);

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
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
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
