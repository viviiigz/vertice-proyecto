import mongoose from 'mongoose';

const reporteSchema = new mongoose.Schema({
  // Usuario que creó el reporte (banco de alimentos)
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  
  // Información del reporte
  tipo: {
    type: String,
    required: true,
    enum: [
      'recoleccion',           // Problema con Recolección (Comercio Cerrado)
      'calidad',               // Reportar Calidad de Alimento
      'voluntarios',           // Solicitar Voluntarios Extra
      'tecnico',               // Falla Técnica App
      'otro'                   // Otros
    ]
  },
  asunto: {
    type: String,
    required: true,
    maxlength: 200
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Prioridad y Estado
  prioridad: {
    type: String,
    required: true,
    enum: ['normal', 'alta', 'critica'],
    default: 'normal'
  },
  estado: {
    type: String,
    required: true,
    enum: ['pendiente', 'en_proceso', 'resuelto', 'cerrado'],
    default: 'pendiente'
  },
  
  // Referencias opcionales
  lote_id: {
    type: String,
    default: null
  },
  comercio_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Respuestas del admin
  respuestas: [{
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admin_username: String,
    mensaje: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Admin asignado
  asignado_a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Fechas
  fecha_resolucion: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Índices para búsquedas eficientes
reporteSchema.index({ usuario_id: 1, created_at: -1 });
reporteSchema.index({ estado: 1, prioridad: -1 });
reporteSchema.index({ tipo: 1 });

// Normalizar salida JSON
reporteSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

reporteSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const ReporteModel = mongoose.model('Reporte', reporteSchema);

export default ReporteModel;
