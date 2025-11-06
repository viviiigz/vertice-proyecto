/*
  Script para crear un usuario admin rápidamente.
  Uso (desde back-vertice):
    node scripts/create-admin.js
  Asegúrate de tener MONGODB_URI y JWT_SECRET en tu .env o variables de entorno.
*/
import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import UserModel from '../src/models/user.models.js';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vertice.local';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Admin123!';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

async function createAdmin() {
  try {
    await connectDB();
    const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Ya existe un usuario con ese email:', ADMIN_EMAIL);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    const admin = await UserModel.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      estadoVerificacion: 'aprobado'
    });

    console.log('Admin creado:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creando admin:', err);
    process.exit(1);
  }
}

createAdmin();
