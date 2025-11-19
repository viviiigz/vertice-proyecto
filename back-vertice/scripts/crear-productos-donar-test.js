import dotenv from 'dotenv/config';
import connectDB from '../src/config/database.js';
import UserModel from '../src/models/user.models.js';
import ProductModel from '../src/models/product.model.js';

async function crearProductosParaDonar() {
  try {
    await connectDB();
    
    console.log('\n📦 Creando productos para donar...\n');
    
    // Buscar comerciantes
    const comerciante1 = await UserModel.findOne({ email: 'comerciante@gmail.com' });
    const comerciante2 = await UserModel.findOne({ email: 'vivi@gmail.com' });
    
    if (!comerciante1 && !comerciante2) {
      console.log('❌ No hay comerciantes registrados');
      process.exit(0);
    }
    
    const productos = [];
    
    // Productos para comerciante 1 (algunos entregados, algunos disponibles)
    if (comerciante1) {
      productos.push(
        {
          user_id: comerciante1._id,
          nombre_producto: 'Pan del día anterior - DONADO',
          descripcion: 'Pan fresco del día anterior para donación',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 0, // YA ENTREGADO
          categoria: 'para-donar',
          tipo_producto: 'frescos',
          foto_url: null
        },
        {
          user_id: comerciante1._id,
          nombre_producto: 'Verduras frescas - DONADO',
          descripcion: 'Verduras frescas para donar',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 0, // YA ENTREGADO
          categoria: 'para-donar',
          tipo_producto: 'frescos',
          foto_url: null
        },
        {
          user_id: comerciante1._id,
          nombre_producto: 'Lácteos próximos a vencer - DONADO',
          descripcion: 'Productos lácteos para donación',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 0, // YA ENTREGADO
          categoria: 'para-donar',
          tipo_producto: 'lacteos',
          foto_url: null
        },
        {
          user_id: comerciante1._id,
          nombre_producto: 'Frutas disponibles para donar',
          descripcion: 'Frutas frescas disponibles',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 10, // DISPONIBLE
          categoria: 'para-donar',
          tipo_producto: 'frescos',
          foto_url: null
        }
      );
    }
    
    // Productos para comerciante 2
    if (comerciante2) {
      productos.push(
        {
          user_id: comerciante2._id,
          nombre_producto: 'Alimentos preparados - DONADO',
          descripcion: 'Comida preparada para donación',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 0, // YA ENTREGADO
          categoria: 'para-donar',
          tipo_producto: 'bebidas',
          foto_url: null
        },
        {
          user_id: comerciante2._id,
          nombre_producto: 'Productos lácteos - DONADO',
          descripcion: 'Productos lácteos para donar',
          precio_original: 0,
          precio_descuento: 0,
          cantidad_disponible: 0, // YA ENTREGADO
          categoria: 'para-donar',
          tipo_producto: 'lacteos',
          foto_url: null
        }
      );
    }
    
    // Crear productos
    for (const prod of productos) {
      await ProductModel.create(prod);
      console.log(`✅ Creado: ${prod.nombre_producto} (disponible: ${prod.cantidad_disponible})`);
    }
    
    console.log(`\n✨ ${productos.length} productos para donar creados!\n`);
    
    // Recalcular donaciones
    console.log('🔄 Recalculando donaciones totales...\n');
    
    const comercios = await UserModel.find({ role: 'comercio' });
    
    for (const comercio of comercios) {
      const donacionesRealizadas = await ProductModel.countDocuments({
        user_id: comercio._id,
        categoria: 'para-donar',
        cantidad_disponible: 0
      });
      
      await UserModel.findByIdAndUpdate(comercio._id, {
        donacionesTotales: donacionesRealizadas
      });
      
      console.log(`✅ ${comercio.username}: ${donacionesRealizadas} donaciones`);
    }
    
    console.log('\n✨ Proceso completado!\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

crearProductosParaDonar();
