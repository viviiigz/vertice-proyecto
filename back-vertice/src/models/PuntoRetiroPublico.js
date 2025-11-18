// models/PuntoRetiroPublico.js
// Puntos de retiro públicos fijos (no pertenecen a un comerciante específico)
import mongoose from 'mongoose';

const puntoRetiroPublicoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    unique: true 
  },
  direccion: { 
    type: String, 
    required: true 
  },
  latitud: { 
    type: Number, 
    required: true 
  },
  longitud: { 
    type: Number, 
    required: true 
  },
  descripcion: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

export const PuntoRetiroPublico = mongoose.model('PuntoRetiroPublico', puntoRetiroPublicoSchema);
