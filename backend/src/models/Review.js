const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'order',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'product',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  is_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  admin_reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Review;
