//hola, es para no tener problemas como la otra vez
import express from 'express';
import cors from 'cors';
import "dotenv/config";
import  sequelize  from './src/config/database.js';
import UserModel from './src/models/user.model.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// inciar servidor

sequelize.sync({force:true}).then(() =>  {
  console.log("Base de datos sincronizada");
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});