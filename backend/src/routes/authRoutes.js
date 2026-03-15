const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');
const {
  validateUpdateProfile,
  validateSendVerificationEmail,
  validateVerifyEmail,
  validateTogglePhoneVerification,
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserStatus,
  validateUpdateUserPassword,
} = require('../middleware/validators');

// Public routes
router.post('/auth/customer', authController.customerAuth);
router.post('/auth/staff', authController.staffLogin);

// Email verification (public - from email link)
router.get('/auth/verify-email', validateVerifyEmail, authController.verifyEmail);

// Protected routes
router.get('/auth/profile', auth, authController.getProfile);
router.put('/auth/profile', auth, validateUpdateProfile, authController.updateProfile);
router.post('/auth/send-verification-email', auth, validateSendVerificationEmail, authController.sendVerificationEmail);

// Admin routes
router.get('/auth/users', auth, authorize('admin'), authController.getAllUsers);
router.post('/auth/users', auth, authorize('admin'), validateCreateUser, authController.createUser);
router.put('/auth/users/:id', auth, authorize('admin'), validateUpdateUser, authController.updateUser);
router.patch('/auth/users/:id/status', auth, authorize('admin'), validateUpdateUserStatus, authController.updateUserStatus);
router.delete('/auth/users/:id', auth, authorize('admin'), authController.deleteUser);
router.post('/auth/users/:id/password', auth, authorize('admin'), validateUpdateUserPassword, authController.adminUpdateUserPassword);
router.put('/auth/users/:id/phone-verified', auth, authorize('admin'), validateTogglePhoneVerification, authController.togglePhoneVerification);

module.exports = router;
