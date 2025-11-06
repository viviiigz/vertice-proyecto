import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import connectDB from './src/config/database.js';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index.routes.js';
import './src/models/associations.js'
import bcrypt from 'bcryptjs';
import UserModel from './src/models/user.models.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir credenciales (cookies) y servir el front desde el mismo origen para que las cookies funcionen
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Configurar EJS como motor de vistas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos de la carpeta uploads
// Servir archivos estáticos de la carpeta uploads (ruta absoluta)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir la carpeta front-vertice como estática en la raíz para que los HTML se sirvan desde el mismo origen
// front-vertice está en el directorio padre del back-vertice
const frontPath = path.join(__dirname, '..', 'front-vertice');
app.use('/', express.static(frontPath));

//rutas de la API
app.use('/api', routes);  


// Intentar conectar a MongoDB; si falla, arrancamos el servidor en modo degradado
(async () => {
  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;
    app.locals.dbConnected = true;
  } catch (err) {
    console.error('Error de conexión a la base de datos (continuando en modo degradado):', err.message || err);
    app.locals.dbConnected = false;
  }

  // Intentamos crear admin por defecto solo si la DB está conectada
  if (dbConnected) {
    (async () => {
      try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASS = process.env.ADMIN_PASS;
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

        if (ADMIN_EMAIL && ADMIN_PASS) {
          const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
          if (!existing) {
            const hashed = await bcrypt.hash(ADMIN_PASS, 10);
            await UserModel.create({
              username: ADMIN_USERNAME,
              email: ADMIN_EMAIL,
              password: hashed,
              role: 'admin',
              estadoVerificacion: 'aprobado'
            });
          }
        }
      } catch (err) {
        console.error('Error creando admin por defecto:', err);
      }
    })();
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
})();
