const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(auth);

// Admin routes
router.get('/stats', authorize('admin'), dashboardController.getDashboardStats);
router.get('/analytics', authorize('admin'), dashboardController.getSalesAnalytics);
router.get('/activity', authorize('admin'), dashboardController.getUserActivity);
router.get('/staff', authorize('admin'), dashboardController.getStaffStatus);

// Staff routes (admin, kitchen, driver)
router.put('/staff-status', authorize('admin', 'kitchen', 'driver'), dashboardController.updateStaffStatus);

module.exports = router;
