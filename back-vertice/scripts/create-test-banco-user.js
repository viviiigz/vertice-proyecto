// Script para crear un usuario banco de alimentos de prueba
// Ejecutar: node scripts/create-test-banco-user.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../src/models/user.models.js';

const createBancoUser = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/vertice');
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un usuario banco
        const existingBanco = await UserModel.findOne({ email: 'banco@test.com' });
        if (existingBanco) {
            console.log('⚠️ Ya existe un usuario banco con email: banco@test.com');
            console.log('Datos del usuario:');
            console.log({
                username: existingBanco.username,
                email: existingBanco.email,
                role: existingBanco.role,
                telefono: existingBanco.telefono
            });
            
            // Si el rol no es banco, actualizarlo
            if (existingBanco.role !== 'banco') {
                existingBanco.role = 'banco';
                await existingBanco.save();
                console.log('✅ Rol actualizado a "banco"');
            }
            
            mongoose.connection.close();
            return;
        }

        // Crear nuevo usuario banco
        const hashedPassword = await bcrypt.hash('banco123', 10);
        
        const bancoUser = new UserModel({
            username: 'BancoFormosa',
            email: 'banco@test.com',
            password: hashedPassword,
            role: 'banco',
            telefono: '+54 370 123-4567',
            direccion: 'Plaza San Martín, Centro, Formosa',
            horarios: 'Lunes a Viernes: 8:00 - 18:00',
            capacidad: 5000, // 5000 kg de capacidad
            descripcion: 'Banco de alimentos de prueba para desarrollo',
            verificado: true
        });

        await bancoUser.save();
        
        console.log('✅ Usuario banco creado exitosamente!');
        console.log('📧 Email: banco@test.com');
        console.log('🔑 Password: banco123');
        console.log('👤 Username:', bancoUser.username);
        console.log('🏦 Role:', bancoUser.role);
        
        mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

createBancoUser();
