const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const { auth, authorize } = require('../middleware/auth');

// Public route
router.get('/vapid-key', pushController.getVapidPublicKey);

// Protected routes
router.post('/subscribe', auth, pushController.subscribe);
router.post('/unsubscribe', auth, pushController.unsubscribe);
router.get('/subscriptions', auth, pushController.getUserSubscriptions);

// Send notification to user
router.post('/send/user', auth, authorize('admin'), pushController.sendToUser);

// Send notification to all users
router.post('/send/all', auth, authorize('admin'), pushController.sendToAll);

// Admin: get all subscriptions
router.get('/all', auth, authorize('admin'), pushController.getAllSubscriptions);

module.exports = router;
