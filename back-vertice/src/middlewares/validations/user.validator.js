// middlewares/validations/user.validator.js
import { body, validationResult } from "express-validator";
import UserModel from "../../models/user.models.js";

export const validateRegister = [
  body("username")
    .notEmpty().withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 3, max: 20 }).withMessage("Debe tener entre 3 y 20 caracteres")
    .custom(async value => {
      const existingUser = await UserModel.findOne({ where: { username: value } });
      if (existingUser) throw new Error("El nombre de usuario ya está en uso");
      return true;
    }),

  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("Debe ser un email válido")
    .custom(async value => {
      const existingEmail = await UserModel.findOne({ where: { email: value } });
      if (existingEmail) throw new Error("El email ya está en uso");
      return true;
    }),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("role")
    .notEmpty().withMessage("Debe seleccionar un rol")
    .isIn(["consumidor", "comercio", "banco"]).withMessage("Rol inválido"),

  // Middleware para enviar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
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
