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

// Admin/Kitchen/Driver routes
// Get all orders (admin, kitchen, driver)
router.get('/', authorize('admin', 'kitchen', 'driver'), orderController.getAllOrders);

// Update order status (admin, kitchen, driver)
// Driver can update: ready → out_for_delivery → completed
router.patch('/:id/status', authorize('admin', 'kitchen', 'driver'), orderController.updateOrderStatus);

// Queue info (public for tracking)
router.get('/queue/today', orderController.getTodayQueueStats);

module.exports = router;
