import mongoose from 'mongoose';

const DonationProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  weight: { type: Number }, // kg
  expiryDate: { type: Date },
  estimatedValue: { type: Number, min: 0 }
}, { _id: false });

const ImpactMetricsSchema = new mongoose.Schema({
  co2Saved: { type: Number, default: 0 },
  mealsProvided: { type: Number, default: 0 },
  waterSaved: { type: Number, default: 0 },
  landSaved: { type: Number, default: 0 }
}, { _id: false });

const LogisticsSchema = new mongoose.Schema({
  vehicleRequired: { type: Boolean, default: false },
  specialHandling: { type: String },
  contactPerson: { type: String },
  phone: { type: String }
}, { _id: false });

const DonationSchema = new mongoose.Schema({
  commerce: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: { type: [DonationProductSchema], required: true },
  totalWeight: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'matched', 'scheduled', 'collected', 'delivered'], default: 'available' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' },
  matchedFoodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupWindow: { from: Date, to: Date },
  impactMetrics: { type: ImpactMetricsSchema, default: () => ({}) },
  logistics: { type: LogisticsSchema, default: () => ({}) }
}, { timestamps: true });

DonationSchema.index({ commerce: 1, status: 1, createdAt: -1 });

export default mongoose.model('Donation', DonationSchema);
