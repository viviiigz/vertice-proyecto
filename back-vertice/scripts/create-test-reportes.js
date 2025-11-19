import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import ReporteModel from '../src/models/reporte.model.js';
import UserModel from '../src/models/user.models.js';

async function createTestReportes() {
  try {
    await connectDB();
    
    // Buscar un usuario banco para asociar los reportes
    let bancoUser = await UserModel.findOne({ role: 'banco' });
    
    if (!bancoUser) {
      console.log('⚠️ No hay usuarios banco, creando uno de prueba...');
      bancoUser = await UserModel.create({
        username: 'Banco Test Reportes',
        email: 'banco.reportes@test.com',
        password: 'test123',
        role: 'banco',
        estadoVerificacion: 'aprobado'
      });
      console.log('✅ Usuario banco creado');
    }

    console.log(`\n📊 Creando reportes de prueba para: ${bancoUser.username}\n`);

    const reportes = [
      {
        usuario_id: bancoUser._id,
        username: bancoUser.username,
        email: bancoUser.email,
        tipo: 'recoleccion',
        asunto: 'Comercio cerrado al momento de recolección',
        descripcion: 'Llegamos al comercio "Panadería San Juan" a las 19:00 según lo acordado, pero estaba cerrado. No hubo aviso previo. Los alimentos perecederos no pudieron ser recolectados.',
        prioridad: 'alta',
        estado: 'pendiente',
        lote_id: 'LOTE-4532'
      },
      {
        usuario_id: bancoUser._id,
        username: bancoUser.username,
        email: bancoUser.email,
        tipo: 'calidad',
        asunto: 'Alimentos en mal estado recibidos',
        descripcion: 'Al revisar el lote #3421 de productos lácteos, encontramos 5 unidades con fecha de vencimiento ya superada. Esto pone en riesgo la seguridad alimentaria.',
        prioridad: 'critica',
        estado: 'en_proceso',
        lote_id: 'LOTE-3421'
      },
      {
        usuario_id: bancoUser._id,
        username: bancoUser.username,
        email: bancoUser.email,
        tipo: 'voluntarios',
        asunto: 'Necesitamos más personal para el sábado',
        descripcion: 'El próximo sábado tenemos una jornada de distribución masiva y necesitamos al menos 10 voluntarios adicionales. ¿Pueden ayudarnos con la coordinación?',
        prioridad: 'normal',
        estado: 'pendiente',
        lote_id: null
      },
      {
        usuario_id: bancoUser._id,
        username: bancoUser.username,
        email: bancoUser.email,
        tipo: 'tecnico',
        asunto: 'Error al cargar fotografías en la app',
        descripcion: 'Desde hace 2 días no podemos subir fotos de los alimentos recibidos. La aplicación muestra error "Upload failed" constantemente.',
        prioridad: 'alta',
        estado: 'pendiente',
        lote_id: null
      },
      {
        usuario_id: bancoUser._id,
        username: bancoUser.username,
        email: bancoUser.email,
        tipo: 'recoleccion',
        asunto: 'Horario de recolección ya resuelto',
        descripcion: 'Habíamos reportado problema con el horario del comercio XYZ. Ya fue coordinado nuevamente y todo está funcionando correctamente.',
        prioridad: 'normal',
        estado: 'resuelto',
        lote_id: 'LOTE-2910',
        fecha_resolucion: new Date()
      }
    ];

    for (const reporte of reportes) {
      await ReporteModel.create(reporte);
      console.log(`✅ Creado: ${reporte.asunto}`);
    }

    console.log(`\n✨ ${reportes.length} reportes de prueba creados exitosamente!\n`);
    
    // Mostrar resumen
    const total = await ReporteModel.countDocuments();
    const pendientes = await ReporteModel.countDocuments({ estado: 'pendiente' });
    const urgentes = await ReporteModel.countDocuments({ prioridad: { $in: ['alta', 'critica'] }, estado: { $ne: 'resuelto' } });
    const resueltos = await ReporteModel.countDocuments({ estado: 'resuelto' });

    console.log('📈 Resumen:');
    console.log(`   Total: ${total}`);
    console.log(`   Pendientes: ${pendientes}`);
    console.log(`   Urgentes (sin resolver): ${urgentes}`);
    console.log(`   Resueltos: ${resueltos}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createTestReportes();
