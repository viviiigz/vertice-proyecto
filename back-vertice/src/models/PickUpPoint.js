// models/PickUpPoint.js
import mongoose from 'mongoose';

const pickUpPointSchema = new mongoose.Schema({
  comercianteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombre: { type: String, required: true }, // Ej: "Local Central"
  direccion: { type: String, required: true },
  horarios: { type: String } // Ej: "Lunes a Viernes 9-18hs"
});

export const PickUpPoint = mongoose.model('PickUpPoint', pickUpPointSchema);