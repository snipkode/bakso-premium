const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(auth);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/queue', orderController.getQueueInfo);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin/Kitchen routes
router.get('/', authorize('admin', 'kitchen'), orderController.getAllOrders);
router.patch('/:id/status', authorize('admin', 'kitchen'), orderController.updateOrderStatus);

// Queue info (public for tracking)
router.get('/queue/today', orderController.getTodayQueueStats);

module.exports = router;
