// archivo: models/Pedido.js

import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  // Quién compró
  consumidorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // A quién le compró
  comercianteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Qué productos compró
  productos: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      cantidad: { type: Number, required: true },
      precioEnElMomento: { type: Number, required: true } // Precio al que se vendió
    }
  ],
  
  // --- CAMBIOS CLAVE ---
  // El nombre del punto público que eligió el consumidor
  puntoDeRetiro: {
    type: String,
    required: true
  },
  // El horario que el consumidor eligió
  horarioRetiro: {
    type: String,
    required: true
  },
  // --- FIN DE CAMBIOS ---

  totalVenta: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aceptado', 'rechazado', 'entregado', 'cancelado'],
    default: 'pendiente'
  }
}, { timestamps: true }); // timestamps: true agrega createdAt y updatedAt

export const Pedido = mongoose.model('Pedido', pedidoSchema);