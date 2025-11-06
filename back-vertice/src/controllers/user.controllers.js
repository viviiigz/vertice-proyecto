// controllers/user.controllers.js
import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//registro de usuarioo
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el email ya existe
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Verificar si el username ya existe
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }
    if (!role) return res.status(400).json({ error: "Debes seleccionar un rol" });

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Si el rol es 'banco', aceptar un archivo subido (multer) y guardar su ruta/nombre
    let documentoPath = null;
    if (role === 'banco' && req.file) {
      // Almacenamos el filename para poder servirlo desde /uploads
      documentoPath = req.file.filename || req.file.path || null;
    }

    // Crear el usuario (incluyendo estadoVerificacion y documentoVerificacion si aplica)
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
      // Solo los bancos requieren verificación; los demás se marcan como aprobados automáticamente
      estadoVerificacion: role === 'banco' ? 'pendiente' : 'aprobado',
      documentoVerificacion: documentoPath
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at,
        estadoVerificacion: newUser.estadoVerificacion
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      // Error de duplicado en MongoDB
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
    // Obtener usuario
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    // Generar token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // If the user is a 'banco' and not approved, prevent login
    if (user.role === 'banco' && user.estadoVerificacion !== 'aprobado') {
      const msg = user.estadoVerificacion === 'pendiente'
        ? 'PENDIENTE APROBACIÓN. En el caso de banco de alimentos debemos seguir un protocolo de verificación. El admin verificará su veracidad y aceptará o rechazará su solicitud de registro como BANCO DE ALIMENTOS. Espere pacientemente entre 6 a 12hs. Desde ya gracias.'
        : 'Su solicitud ha sido rechazada. Contacte con soporte.';
      return res.status(403).json({ error: msg, estadoVerificacion: user.estadoVerificacion });
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    // Enviar datos al front sin password
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    res.json({ 
      token,
      user: userWithoutPassword
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};