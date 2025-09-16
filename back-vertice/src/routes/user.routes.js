// routes/userRoutes.js
import express from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { validateRegister } from "../middlewares/validations/user.validator.js";

const routerUser = express.Router();

// Ruta de registro
routerUser.post("/register", validateRegister, registerUser);

export default routerUser;
