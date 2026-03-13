const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/', voucherController.getVouchers);
router.get('/validate', voucherController.validateVoucher);

// Admin routes
router.post('/', auth, authorize('admin'), voucherController.createVoucher);
router.put('/:id', auth, authorize('admin'), voucherController.updateVoucher);
router.delete('/:id', auth, authorize('admin'), voucherController.deleteVoucher);
router.patch('/:code/increment', auth, authorize('admin'), voucherController.incrementVoucherUsage);

module.exports = router;
