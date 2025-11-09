// Script para verificar productos en la base de datos
import mongoose from 'mongoose';
import Product from './src/models/product.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/vertice';

async function verificarProductos() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los productos
    const todosLosProductos = await Product.find({});
    console.log(`\n📦 Total de productos en BD: ${todosLosProductos.length}`);

    // Contar por categoría
    const conCategoria = await Product.countDocuments({ categoria: { $exists: true, $ne: null } });
    const sinCategoria = await Product.countDocuments({ $or: [{ categoria: { $exists: false } }, { categoria: null }] });
    
    console.log(`\n📊 Estadísticas de categoría:`);
    console.log(`   - Con categoría: ${conCategoria}`);
    console.log(`   - Sin categoría: ${sinCategoria}`);

    // Contar por tipo_producto
    const conTipo = await Product.countDocuments({ tipo_producto: { $exists: true, $ne: null } });
    const sinTipo = await Product.countDocuments({ $or: [{ tipo_producto: { $exists: false } }, { tipo_producto: null }] });
    
    console.log(`\n📊 Estadísticas de tipo_producto:`);
    console.log(`   - Con tipo_producto: ${conTipo}`);
    console.log(`   - Sin tipo_producto: ${sinTipo}`);

    // Mostrar ejemplos de productos
    console.log(`\n📝 Primeros 5 productos:`);
    const ejemplos = await Product.find({}).limit(5);
    ejemplos.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.nombre_producto}`);
      console.log(`      - categoria: ${p.categoria || 'NO DEFINIDA'}`);
      console.log(`      - tipo_producto: ${p.tipo_producto || 'NO DEFINIDO'}`);
      console.log(`      - precio_original: $${p.precio_original}`);
      console.log(`      - precio_descuento: $${p.precio_descuento}`);
    });

    // Contar productos "comida-por-caducarse"
    const caducarse = await Product.countDocuments({ categoria: 'comida-por-caducarse' });
    console.log(`\n🔍 Productos con categoria='comida-por-caducarse': ${caducarse}`);

    // Contar por tipo
    const lacteos = await Product.countDocuments({ tipo_producto: 'lacteos' });
    const bebidas = await Product.countDocuments({ tipo_producto: 'bebidas' });
    const frescos = await Product.countDocuments({ tipo_producto: 'frescos' });
    
    console.log(`\n🔍 Productos por tipo:`);
    console.log(`   - lacteos: ${lacteos}`);
    console.log(`   - bebidas: ${bebidas}`);
    console.log(`   - frescos: ${frescos}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

verificarProductos();
