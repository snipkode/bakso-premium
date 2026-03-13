const { Review, Order, User, Product } = require('../models');
const { Op } = require('sequelize');

// Create review
exports.createReview = async (req, res) => {
  try {
    const { order_id, product_id, rating, comment, images } = req.body;

    // Check if order exists and is completed
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed orders' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      where: { order_id, product_id },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Already reviewed this order' });
    }

    const review = await Review.create({
      order_id,
      product_id,
      user_id: req.user.id,
      rating,
      comment,
      images: images || [],
      is_visible: true,
    });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id, limit = 20, offset = 0 } = req.query;

    const where = { is_visible: true };
    if (product_id) where.product_id = product_id;

    const reviews = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Calculate average rating
    const avgRating = await Review.findOne({
      where,
      attributes: [[Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avg']],
      raw: true,
    });

    res.json({
      success: true,
      ...reviews,
      average_rating: avgRating?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await Review.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'image'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, ...reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Get all reviews (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const { is_visible, product_id, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (is_visible !== undefined) where.is_visible = is_visible === 'true';
    if (product_id) where.product_id = product_id;

    const reviews = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, ...reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Update review visibility (admin)
exports.updateReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.is_visible = is_visible;
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Reply to review (admin)
exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_reply } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.admin_reply = admin_reply;
    review.replied_at = new Date();
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to review' });
  }
};

// Delete review (admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy();

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
