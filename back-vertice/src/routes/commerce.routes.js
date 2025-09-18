import { Router } from "express";
import { createComercio, getComercioById, updateComercio, deleteComercio } from "../controllers/commerce.controller.js";
import { validateComercio } from "../middlewares/commerce.validator.js";
import { validator } from "../middlewares/validator.js";
// import { authorizeRole } from "../middlewares/role.middleware.js"; //se supone que tiene que existir esto
// import { authenticateToken } from "../middlewares/auth.middleware.js";//se supone que tiene que existir esto

const router = Router();

// Ruta para crear un nuevo comercio (acceso privado, solo para usuarios autenticados)
router.post("/", validateComercio, validator, createComercio);

// Ruta para obtener la información de un comercio por su ID (acceso público)
router.get("/:id", getComercioById);

// Ruta para actualizar la información de un comercio (acceso privado, solo para el dueño del comercio)
router.put("/", validateComercio, validator, updateComercio);

// Ruta para eliminar un comercio (acceso privado, solo para el dueño del comercio)
router.delete("/", deleteComercio); //aca suponemos que el id del comercio se obtiene del token

export default router;