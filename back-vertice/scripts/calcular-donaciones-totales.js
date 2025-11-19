import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import UserModel from '../src/models/user.models.js';
import ProductModel from '../src/models/product.model.js';

async function agregarDonacionesTotales() {
  try {
    await connectDB();
    
    console.log('\n📊 Calculando donaciones totales para comerciantes...\n');
    
    // Obtener todos los comercios
    const comercios = await UserModel.find({ role: 'comercio' });
    
    if (comercios.length === 0) {
      console.log('❌ No hay comercios registrados');
      process.exit(0);
    }
    
    console.log(`✅ Comercios encontrados: ${comercios.length}\n`);
    
    for (const comercio of comercios) {
      // Contar productos para-donar que el comercio publicó
      // Asumimos que "entregados" = productos con cantidad_disponible = 0 (ya fueron recogidos)
      const donacionesRealizadas = await ProductModel.countDocuments({
        comercio_id: comercio._id,
        categoria: 'para-donar',
        cantidad_disponible: 0 // Ya fueron entregados/recogidos
      });
      
      // Actualizar el campo donacionesTotales en el usuario
      await UserModel.findByIdAndUpdate(comercio._id, {
        donacionesTotales: donacionesRealizadas
      });
      
      console.log(`✅ ${comercio.username}: ${donacionesRealizadas} donaciones realizadas`);
    }
    
    console.log('\n✨ Todos los comercios actualizados con donaciones totales!\n');
    
    // Mostrar resumen
    const comerciosConDonaciones = await UserModel.find({ 
      role: 'comercio',
      donacionesTotales: { $gt: 0 }
    });
    
    console.log('📈 Resumen:');
    console.log(`   Total comercios: ${comercios.length}`);
    console.log(`   Comercios con donaciones: ${comerciosConDonaciones.length}`);
    console.log(`   Total donaciones: ${comerciosConDonaciones.reduce((sum, c) => sum + (c.donacionesTotales || 0), 0)}\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

agregarDonacionesTotales();
