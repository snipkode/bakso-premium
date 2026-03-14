const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(auth);
router.use(authorize('admin'));

// Get dashboard stats
router.get('/stats', reportController.getStats);

// Get report list
router.get('/', reportController.getReportList);

// Generate reports
router.get('/daily', reportController.generateDailyReport);
router.get('/weekly', reportController.generateWeeklyReport);
router.get('/monthly', reportController.generateMonthlyReport);
router.get('/staff', reportController.generateStaffReport);

// Download report
router.get('/download/:fileName', reportController.downloadReport);

module.exports = router;
