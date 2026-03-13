const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyPoint = sequelize.define('loyaltyPoint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'order',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('earned', 'redeemed'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = LoyaltyPoint;
