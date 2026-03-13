const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/today', queueController.getTodayQueue);
router.get('/date/:date', queueController.getQueueByDate);
router.get('/orders/:date', queueController.getOrdersByQueueDate);

// Protected routes
router.get('/history', auth, authorize('admin'), queueController.getQueueHistory);
router.post('/reset', auth, authorize('admin'), queueController.resetQueue);
router.put('/:id', auth, authorize('admin'), queueController.updateQueueSettings);
router.patch('/adjust', auth, authorize('admin'), queueController.adjustQueue);

module.exports = router;
