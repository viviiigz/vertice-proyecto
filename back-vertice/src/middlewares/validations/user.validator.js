import { body, param } from 'express-validator';
//import { UserModel } from '../models/user.models.js';
 
// validators/userValidator.js
import { check, validationResult } from "express-validator";

// Reglas de validación para register
export const validateRegister = [
  check("username")
    .notEmpty().withMessage("El nombre de usuario es obligatorio"),
  check("email")
    .isEmail().withMessage("Debe ser un email válido"),
  check("password")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  check("role")
    .isIn(["consumidor", "comercio", "banco"]).withMessage("Rol inválido"),
  
  // Middleware final para revisar resultados
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // todo OK → pasa al controlador
  }
];

//ESTE ES PARA VALIDAR EL PARAMETRO ID EN RUTAS QUE LO REQUIERAN
/*export const userIdParamValidation = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(async (value) => {
            const existUser = await User.findByPk(value);
            if (!existUser) {
                throw new Error('El usuario no existe');
            }
            return true;
        }),
];*/
