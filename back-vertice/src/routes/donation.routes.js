const { Router } = require('express');
const router = Router();
const donationController = require('../controllers/donation.controllers');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/authRole');

// Only commerces create donations
router.post('/', auth, role(['commerce']), (req, res) => donationController.create(req, res));
router.post('/:id/match', auth, role(['commerce','admin']), (req, res) => donationController.match(req, res));
router.get('/mine', auth, role(['commerce']), (req, res) => donationController.listMine(req, res));

module.exports = router;
