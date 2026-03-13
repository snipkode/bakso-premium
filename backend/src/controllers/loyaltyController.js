const { LoyaltyPoint, User } = require('../models');
const { Op } = require('sequelize');

// Get user loyalty points
exports.getLoyaltyPoints = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    const points = await LoyaltyPoint.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      total_points: user.loyalty_points,
      history: points,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get loyalty points' });
  }
};

// Get all loyalty point transactions (admin)
exports.getAllLoyaltyPoints = async (req, res) => {
  try {
    const { user_id, type, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;

    const points = await LoyaltyPoint.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'phone'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, ...points });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get loyalty points' });
  }
};

// Manually add loyalty points (admin)
exports.addLoyaltyPoints = async (req, res) => {
  try {
    const { user_id, points, description } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.loyalty_points += points;
    await user.save();

    await LoyaltyPoint.create({
      user_id,
      points,
      type: 'earned',
      description: description || 'Manual adjustment by admin',
    });

    res.json({
      success: true,
      total_points: user.loyalty_points,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add loyalty points' });
  }
};

// Deduct loyalty points (admin)
exports.deductLoyaltyPoints = async (req, res) => {
  try {
    const { user_id, points, description } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.loyalty_points < points) {
      return res.status(400).json({ error: 'Insufficient loyalty points' });
    }

    user.loyalty_points -= points;
    await user.save();

    await LoyaltyPoint.create({
      user_id,
      points: -points,
      type: 'redeemed',
      description: description || 'Manual deduction by admin',
    });

    res.json({
      success: true,
      total_points: user.loyalty_points,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deduct loyalty points' });
  }
};
