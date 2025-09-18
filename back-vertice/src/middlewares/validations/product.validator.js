//middleware de productos
//import Product from "../../models/product.model.js";
import { body, validationResult } from "express-validator";

export const validateProduct = [
  body("nombre_producto")
    .notEmpty()
    .withMessage("El nombre del producto es obligatorio")
    .isLength({ max: 50 })
    .withMessage("El nombre del producto no debe exceder los 50 caracteres"),
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser una cadena de texto"),
    body("precio_descuento")
    .notEmpty()
    .withMessage("El precio con descuento es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El precio con descuento debe ser un número mayor que 0"),
  body("fecha_caducidad_cercana")
    .optional()
    .isISO8601()
    .withMessage("La fecha de caducidad debe ser una fecha válida"),
  body("cantidad_disponible")
    .notEmpty()
    .withMessage("La cantidad disponible es obligatoria")
    .isInt({ min: 0 })
    .withMessage("La cantidad disponible debe ser un número entero no negativo"),
    body("foto_url")
    .optional()
    .isURL()
    .withMessage("La URL de la foto debe ser una URL válida"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
]; 

//este middleware valida los datos de entrada para la creación o actualización de productos, 
// asegurando que los campos requeridos estén presentes y tengan el formato correcto.