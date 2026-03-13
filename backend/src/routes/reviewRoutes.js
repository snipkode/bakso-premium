const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/products', reviewController.getProductReviews);

// Protected routes
router.post('/', auth, reviewController.createReview);
router.get('/my-reviews', auth, reviewController.getUserReviews);

// Admin routes
router.get('/', auth, authorize('admin'), reviewController.getAllReviews);
router.patch('/:id/visibility', auth, authorize('admin'), reviewController.updateReviewVisibility);
router.patch('/:id/reply', auth, authorize('admin'), reviewController.replyToReview);
router.delete('/:id', auth, authorize('admin'), reviewController.deleteReview);

module.exports = router;
