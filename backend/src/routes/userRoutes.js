const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(auth);
router.use(authorize('admin'));

// Get user statistics
router.get('/stats', userController.getUserStats);

// Get all users with pagination and filters
router.get('/', userController.listUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Toggle user status
router.patch('/:id/status', userController.toggleUserStatus);

// Change user role
router.patch('/:id/role', userController.changeUserRole);

module.exports = router;
