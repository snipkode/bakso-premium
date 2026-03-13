const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/auth/customer', authController.customerAuth);
router.post('/auth/staff', authController.staffLogin);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

// Admin routes
router.get('/users', auth, authorize('admin'), authController.getAllUsers);
router.put('/users/:id/status', auth, authorize('admin'), authController.updateUserStatus);
router.delete('/users/:id', auth, authorize('admin'), authController.deleteUser);

module.exports = router;
