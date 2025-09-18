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

    // Verificar si el username ya existe
    const existingUsername = await UserModel.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }
    if (!role) return res.status(400).json({ error: "Debes seleccionar un rol" });

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role
    });

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
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El nombre de usuario o email ya está en uso" });
    }
    console.error(err);
    res.status(500).json({ error: "Error registrando usuario" });
  }
};


//login de usuariooo

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Obtener usuario como objeto plano
    const user = await UserModel.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'role', 'created_at', 'updated_at', 'deleted_at'] // <- importante
    });

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    // Enviar datos al front sin password
    const { password: _, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user;
    res.json({ user: userWithoutPassword });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};