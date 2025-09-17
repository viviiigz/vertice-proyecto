// controllers/user.controllers.js
import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el email ya existe
    const existingEmail = await UserModel.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Verificar si el username ya existe (agregue nuevamente el unique por razones de coherencia)
    const existingUsername = await UserModel.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
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

    // Responde  sin contraseña:D
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    // Capturamos errores de restricción única de Sequelize por si algo se escapó
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El nombre de usuario o email ya está en uso" });
    }

    console.error(err);
    res.status(500).json({ error: "Error registrando usuario" });
  }
};