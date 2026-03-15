const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { auth, authorize } = require('../middleware/auth');
const { validateCreateVoucher, validateUpdateVoucher } = require('../middleware/validators');

// Public routes (customers can view active vouchers)
router.get('/', voucherController.getVouchers);
router.post('/validate', voucherController.validateVoucher);

// Admin routes
router.get('/:id', auth, authorize('admin'), voucherController.getVoucherById);
router.post('/', auth, authorize('admin'), validateCreateVoucher, voucherController.createVoucher);
router.put('/:id', auth, authorize('admin'), validateUpdateVoucher, voucherController.updateVoucher);
router.delete('/:id', auth, authorize('admin'), voucherController.deleteVoucher);

module.exports = router;
