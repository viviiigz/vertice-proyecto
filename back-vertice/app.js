import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import sequelize from './src/config/database.js';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
//rutas de la API
app.use('/api', routes);  

sequelize.sync()
  .then(() => {
    console.log('base de datos conectadas correctamente');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
  });
