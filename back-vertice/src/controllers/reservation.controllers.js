const Reservation = require('../models/reservation.model');
const Product = require('../models/product.model');
const User = require('../models/user.models');
const crypto = require('crypto');
const notificationService = require('../services/notification.service');

class ReservationController {
  async validateStock(items) {
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) throw new Error('Producto no encontrado');
      if (product.status !== 'active') throw new Error('Producto no disponible');
      if (product.quantityAvailable < it.quantity) throw new Error('Stock insuficiente');
    }
  }

  generateQRCode() {
    return crypto.randomBytes(6).toString('hex');
  }

  calculateTotals(items) {
    let total = 0;
    const mapped = items.map(it => ({
      product: it.product,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.quantity * it.unitPrice
    }));
    total = mapped.reduce((acc, i) => acc + i.totalPrice, 0);
    return { items: mapped, total };
  }

  async createReservation(req, res) {
    try {
      const { products, commerce, pickupTime, pickupWindow, paymentMethod, notes } = req.body;
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Productos requeridos' });
      }

      await this.validateStock(products);
      const code = this.generateQRCode();
      const { items, total } = this.calculateTotals(products);

      const reservation = await Reservation.create({
        user: req.user.id,
        commerce,
        products: items,
        totalAmount: total,
        status: 'pending',
        pickupTime,
        pickupWindow,
        pickupCode: code,
        paymentMethod,
        notes
      });

      // decrement stock and mark reserved if needed
      for (const it of products) {
        await Product.findByIdAndUpdate(it.product, {
          $inc: { quantityAvailable: -it.quantity },
          $set: { status: 'reserved' }
        });
      }

      const user = await User.findById(req.user.id);
      const commerceUser = await User.findById(commerce);
      notificationService.sendReservationConfirmation(reservation, user, commerceUser).catch(() => {});

      return res.status(201).json(reservation);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const allowed = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
      if (!allowed.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
      const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
      if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
      return res.json(reservation);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async listMine(req, res) {
    const type = req.user.userType;
    const query = type === 'commerce' ? { commerce: req.user.id } : { user: req.user.id };
    const items = await Reservation.find(query).sort({ createdAt: -1 }).populate('products.product');
    return res.json(items);
  }
}

module.exports = new ReservationController();
