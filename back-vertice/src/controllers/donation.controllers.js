const Donation = require('../models/donation.model');
const User = require('../models/user.models');
const matchingService = require('../services/matching.service');

class DonationController {
  async create(req, res) {
    try {
      const payload = req.body;
      if (!Array.isArray(payload.products) || payload.products.length === 0) {
        return res.status(400).json({ error: 'Productos requeridos' });
      }
      const totals = payload.products.reduce((acc, p) => {
        acc.totalWeight += p.weight || 0;
        acc.totalValue += p.estimatedValue || 0;
        return acc;
      }, { totalWeight: 0, totalValue: 0 });

      const donation = await Donation.create({
        commerce: req.user.id,
        products: payload.products,
        totalWeight: totals.totalWeight,
        totalValue: totals.totalValue,
        priority: payload.priority || 'low',
        pickupWindow: payload.pickupWindow,
        logistics: payload.logistics
      });

      return res.status(201).json(donation);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async match(req, res) {
    try {
      const { id } = req.params;
      const donation = await Donation.findById(id).populate('commerce');
      if (!donation) return res.status(404).json({ error: 'Donación no encontrada' });
      const bank = await matchingService.matchDonationToFoodBank(donation);
      if (!bank) return res.status(200).json({ matched: false });

      donation.matchedFoodBank = bank._id;
      donation.status = 'matched';
      await donation.save();

      return res.json({ matched: true, donation });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async listMine(req, res) {
    const query = { commerce: req.user.id };
    const items = await Donation.find(query).sort({ createdAt: -1 });
    return res.json(items);
  }
}

module.exports = new DonationController();
