const { Router } = require('express');
const router = Router();
const reservationController = require('../controllers/reservation.controllers');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, (req, res) => reservationController.createReservation(req, res));
router.patch('/:id/status', auth, (req, res) => reservationController.updateStatus(req, res));
router.get('/mine', auth, (req, res) => reservationController.listMine(req, res));

module.exports = router;
