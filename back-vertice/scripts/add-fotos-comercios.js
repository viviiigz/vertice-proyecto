import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import UserModel from '../src/models/user.models.js';

async function addFotosToComercios() {
  try {
    await connectDB();
    
    // Obtener todos los comercios
    const comercios = await UserModel.find({ role: 'comercio' });
    
    console.log(`\n📊 Comercios encontrados: ${comercios.length}\n`);
    
    if (comercios.length === 0) {
      console.log('❌ No hay comercios en la base de datos');
      process.exit(0);
    }
    
    // Mostrar estado actual
    comercios.forEach((c, index) => {
      console.log(`${index + 1}. ${c.username} (${c.email})`);
      console.log(`   fotoPerfil actual: ${c.fotoPerfil || 'NO TIENE'}`);
      console.log('');
    });
    
    // Asignar fotos de prueba (usando archivos que ya existen en uploads)
    const fotosDisponibles = [
      '2109268e0b00065f30acb160fb0d222a',
      '4e70a1408e5f5646dc90381fe1ad613d',
      '726bd38c41520cbbfd38114f2706883b',
      '64367795b502804ceb8daa338cf876c8'
    ];
    
    console.log('🔄 Actualizando fotos de perfil...\n');
    
    for (let i = 0; i < comercios.length; i++) {
      const comercio = comercios[i];
      const fotoIndex = i % fotosDisponibles.length;
      const nuevaFoto = fotosDisponibles[fotoIndex];
      
      await UserModel.findByIdAndUpdate(comercio._id, {
        fotoPerfil: nuevaFoto
      });
      
      console.log(`✅ ${comercio.username}: foto actualizada a ${nuevaFoto}`);
    }
    
    console.log('\n✨ ¡Todas las fotos han sido actualizadas!\n');
    
    // Verificar cambios
    const comerciosActualizados = await UserModel.find({ role: 'comercio' });
    console.log('📸 Verificación final:');
    comerciosActualizados.forEach(c => {
      console.log(`   - ${c.username}: ${c.fotoPerfil}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addFotosToComercios();
