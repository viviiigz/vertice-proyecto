// Script para crear puntos de retiro públicos iniciales
// Ejecutar con: node scripts/create-pickup-points.js

import mongoose from 'mongoose';
import dotenv from 'dotenv/config';
import { PuntoRetiroPublico } from '../src/models/PuntoRetiroPublico.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vertice';

const puntosRetiro = [
  {
    nombre: "Plaza San Martín (Centro)",
    direccion: "Plaza San Martín, Centro, Formosa",
    latitud: -26.185145,
    longitud: -58.174520,
    descripcion: "Punto de retiro en el centro de la ciudad",
    activo: true
  },
  {
    nombre: "Cruz del Norte Formosa",
    direccion: "Cruz del Norte, Formosa",
    latitud: -26.197596,
    longitud: -58.212465,
    descripcion: "Punto de retiro en Cruz del Norte",
    activo: true
  },
  {
    nombre: "Monumento a la Virgen del Carmen",
    direccion: "Monumento a la Virgen del Carmen, Formosa",
    latitud: -26.157044,
    longitud: -58.185414,
    descripcion: "Punto de retiro en el monumento",
    activo: true
  }
];

async function crearPuntosRetiro() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Verificar si ya existen puntos
    const existentes = await PuntoRetiroPublico.countDocuments();
    
    if (existentes > 0) {
      console.log(`Ya existen ${existentes} puntos de retiro.`);
      console.log('¿Deseas eliminarlos y crear nuevos? (Ctrl+C para cancelar)');
      
      // Esperar 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Eliminando puntos existentes...');
      await PuntoRetiroPublico.deleteMany({});
      console.log('✓ Puntos eliminados');
    }

    console.log('Creando puntos de retiro...');
    const resultado = await PuntoRetiroPublico.insertMany(puntosRetiro);
    
    console.log(`✓ ${resultado.length} puntos de retiro creados exitosamente:`);
    resultado.forEach(punto => {
      console.log(`  - ${punto.nombre} (${punto.direccion})`);
    });

    console.log('\n✓ Proceso completado');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
    process.exit(0);
  }
}

crearPuntosRetiro();
