import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre_producto: {
    type: String,
    required: true,
    maxlength: 50
  },
  descripcion: {
    type: String,
    required: false
  },
  precio_original: {
    type: Number,
    required: true
  },
  precio_descuento: {
    type: Number,
    required: true
  },
  fecha_caducidad_cercana: {
    type: Date,
    required: false
  },
  cantidad_disponible: {
    type: Number,
    required: true,
    default: 0
  },
  foto_url: {
    type: String,
    required: false
  },
  categoria: {
    type: String,
    required: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Normalizar salida JSON/Objeto: exponer id en lugar de _id
productSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

productSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

// Crear índices para búsquedas más eficientes
productSchema.index({ user_id: 1 });
productSchema.index({ categoria: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;