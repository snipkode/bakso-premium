const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { auth, authorize } = require('../middleware/auth');

// Get user loyalty points
router.get('/', auth, loyaltyController.getLoyaltyPoints);

// Admin routes
router.get('/all', auth, authorize('admin'), loyaltyController.getAllLoyaltyPoints);
router.post('/add', auth, authorize('admin'), loyaltyController.addLoyaltyPoints);
router.post('/deduct', auth, authorize('admin'), loyaltyController.deductLoyaltyPoints);

module.exports = router;
