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

// Configuración de CORS más permisiva para desarrollo
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origin (como Postman) o desde cualquier origen en desarrollo
        const allowedOrigins = [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // En desarrollo, permitir todo
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Logger middleware - Ver todas las peticiones
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Aumentamos el límite por defecto porque algunas peticiones contienen imágenes en base64 (fotoPerfil)
// Ajusta este valor según el tamaño máximo esperado (p. ej. 5mb, 10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar EJS como motor de vistas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos de la carpeta uploads con headers correctos para PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline'); // Para que se muestre en el navegador, no descargue
        }
    }
}));

// Servir la carpeta front-vertice como estática en la raíz para que los HTML se sirvan desde el mismo origen
// front-vertice está en el directorio padre del back-vertice
const frontPath = path.join(__dirname, '..', 'front-vertice');
app.get('/', (req, res) => {
  res.redirect('/vertice.html');
});
app.use('/front-vertice', express.static(frontPath));
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
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
  });
})();
