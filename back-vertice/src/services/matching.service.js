const Donation = require('../models/donation.model');
const User = require('../models/user.models');

class MatchingService {
  // Simple scoring prototype. Assumes foodbanks are Users with userType 'foodbank'
  async matchDonationToFoodBank(donation) {
    const foodBanks = await User.find({ userType: 'foodbank', 'foodBankInfo.status': 'active' });

    const scored = foodBanks.map(bank => ({
      bank,
      score: this.calculateMatchScore(donation, bank)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.bank || null;
  }

  calculateMatchScore(donation, bank) {
    // Placeholder: combine capacity, proximity(if coords exist), urgency
    const urgency = this.calculateUrgencyScore(donation);
    const capacity = (bank.foodBankInfo?.capacity || 0) >= (donation.totalWeight || 0) ? 1 : 0;
    const proximity = this.calculateProximityScore(donation, bank); // returns 0..1
    const performance = bank.foodBankInfo?.performanceRating || 0.5;

    return (proximity * 0.3) + (capacity * 0.25) + (urgency * 0.2) + (0.15) + (performance * 0.1);
  }

  calculateUrgencyScore(donation) {
    const soonest = donation.products?.reduce((min, p) => {
      if (!p.expiryDate) return min;
      const d = new Date(p.expiryDate).getTime();
      return Math.min(min, d);
    }, Infinity);
    if (!isFinite(soonest)) return 0.2;
    const days = (soonest - Date.now()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return 1;
    if (days <= 1) return 0.8;
    if (days <= 2) return 0.6;
    if (days <= 3) return 0.4;
    return 0.2;
  }

  calculateProximityScore(donation, bank) {
    const dCoord = donation.commerce?.commerceInfo?.coordinates || donation.commerce?.location?.coordinates;
    const bCoord = bank.foodBankInfo?.coordinates || bank.location?.coordinates;
    if (!Array.isArray(dCoord) || !Array.isArray(bCoord)) return 0.3;
    const km = this.haversineKm({ lat: dCoord[1], lng: dCoord[0] }, { lat: bCoord[1], lng: bCoord[0] });
    if (km <= 2) return 1;
    if (km <= 5) return 0.8;
    if (km <= 10) return 0.6;
    if (km <= 20) return 0.4;
    return 0.2;
  }

  haversineKm(a, b) {
    const R = 6371;
    const dLat = this.deg2rad(b.lat - a.lat);
    const dLon = this.deg2rad(b.lng - a.lng);
    const la1 = this.deg2rad(a.lat);
    const la2 = this.deg2rad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(la1) * Math.cos(la2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  }

  deg2rad(deg) { return deg * (Math.PI / 180); }
}

module.exports = new MatchingService();
