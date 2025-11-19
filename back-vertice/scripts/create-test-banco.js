import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import UserModel from '../src/models/user.models.js';
import bcrypt from 'bcryptjs';

async function createTestBanco() {
  try {
    await connectDB();
    
    const existing = await UserModel.findOne({ email: 'banco.test@vertice.com' });
    if (existing) {
      console.log('✅ Ya existe un banco de prueba:', existing.email);
      console.log('Estado:', existing.estadoVerificacion);
      process.exit(0);
    }

    const hashed = await bcrypt.hash('Banco123!', 10);
    const banco = await UserModel.create({
      username: 'Banco Test',
      email: 'banco.test@vertice.com',
      password: hashed,
      role: 'banco',
      telefono: '555-0123',
      direccion: 'Calle Test 123',
      estadoVerificacion: 'pendiente',
      documentoVerificacion: 'test-documento.pdf'
    });

    console.log('✅ Banco de prueba creado:', banco.email);
    console.log('Estado:', banco.estadoVerificacion);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creando banco:', err);
    process.exit(1);
  }
}

createTestBanco();
