import mongoose from 'mongoose';

export const PRODUCT_STATUS_CATEGORIES = ['comida-por-caducarse', 'desperfecto-fisico', 'para-donar'];

export const PRODUCT_TYPE_CATEGORY_ALIASES = {
  frescos: 'frutas-y-verduras',
  'frutas y verduras': 'frutas-y-verduras',
  'frutas/verduras': 'frutas-y-verduras',
  'carniceria y polleria': 'carniceria-polleria',
  'desayuno/merienda': 'desayuno-merienda'
};

export const PRODUCT_TYPE_CATEGORIES = [
  'lacteos',
  'frutas-y-verduras',
  'carniceria-polleria',
  'congelados',
  'panaderia',
  'dietetica',
  'snack',
  'desayuno-merienda',
  'bebidas'
];

const ALLOWED_PRODUCT_TYPE_VALUES = [...new Set([
  ...PRODUCT_TYPE_CATEGORIES,
  ...Object.keys(PRODUCT_TYPE_CATEGORY_ALIASES)
])];

export const normalizeProductType = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  return PRODUCT_TYPE_CATEGORY_ALIASES[normalizedValue] || normalizedValue;
};

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
    required: false,
    default: 0
  },
  precio_descuento: {
    type: Number,
    required: false,
    default: 0
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
    required: false,
    enum: PRODUCT_STATUS_CATEGORIES
  },
  tipo_producto: {
    type: String,
    required: false,
    enum: ALLOWED_PRODUCT_TYPE_VALUES,
    set: normalizeProductType
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
productSchema.index({ tipo_producto: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;