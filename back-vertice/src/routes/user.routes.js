// routes/userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controllers.js";
import { validateRegister } from "../middlewares/validations/user.validator.js";

const routerUser = express.Router();

// Configuración de multer con storage personalizado para preservar la extensión del archivo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generar nombre único: timestamp + nombre original sanitizado
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Obtener extensión (.pdf)
        const nameWithoutExt = path.basename(file.originalname, ext);
        // Sanitizar el nombre (eliminar caracteres especiales)
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, safeName + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Solo aceptar PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Error al subir archivo: ' + err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Ruta de registro
// Si el usuario es un banco, el formulario debe enviar el campo 'documento' con el PDF
routerUser.post("/register", upload.single('documento'), handleMulterError, validateRegister, registerUser);
routerUser.post("/login", loginUser);
routerUser.post("/logout", logoutUser);

export default routerUser;
