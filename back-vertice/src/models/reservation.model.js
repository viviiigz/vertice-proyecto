import mongoose from 'mongoose';

const ReservationProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commerce: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: { type: [ReservationProductSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'], default: 'pending' },
  pickupTime: { type: Date },
  pickupWindow: {
    start: { type: Date },
    end: { type: Date }
  },
  pickupCode: { type: String, index: true, unique: true },
  actualPickupTime: { type: Date },
  paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'] },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  notes: { type: String }
}, { timestamps: true });

ReservationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Reservation', ReservationSchema);
