const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All payment routes require authentication
router.use(auth);

// Create payment with file upload
router.post('/', upload.single('proof'), handleUploadError, paymentController.createPayment);

// Get payment by order
router.get('/order/:order_id', paymentController.getPaymentByOrder);

// Admin routes
router.get('/pending', authorize('admin'), paymentController.getPendingPayments);
router.get('/', authorize('admin'), paymentController.getAllPayments);
router.patch('/:id/verify', authorize('admin'), paymentController.verifyPayment);
router.delete('/:id/proof', authorize('admin'), paymentController.deletePaymentProof);

module.exports = router;
