// controllers/user.controllers.js
import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";

// Registrar usuario
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Verificar si el email ya existe
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Devolver respuesta sin la contraseña
        const userResponse = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            fecha_registro: newUser.fecha_registro
        };

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: userResponse
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error registrando usuario" });
    }
};
