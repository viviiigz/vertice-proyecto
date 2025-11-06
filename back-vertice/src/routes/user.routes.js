// routes/userRoutes.js
import express from "express";
import multer from "multer";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controllers.js";
import { validateRegister } from "../middlewares/validations/user.validator.js";

const routerUser = express.Router();

// Configuración simple de multer: guardar en uploads/
const upload = multer({ dest: 'uploads/' });

// Ruta de registro
// Si el usuario es un banco, el formulario debe enviar el campo 'documento' con el PDF
routerUser.post("/register", upload.single('documento'), validateRegister, registerUser);
routerUser.post("/login", loginUser);
routerUser.post("/logout", logoutUser);

export default routerUser;
