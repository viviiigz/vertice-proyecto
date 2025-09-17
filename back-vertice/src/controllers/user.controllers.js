// controllers/user.controllers.js
import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//registro de usuarioo
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

//login de usuariooo

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email o contraseña incorrectos" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Email o contraseña incorrectos" });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // tiempo de expiración
    );

    // Guardar token en cookie (httpOnly para seguridad)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // solo HTTPS en prod
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    // Respuesta exitosa
    res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el login" });
  }
};