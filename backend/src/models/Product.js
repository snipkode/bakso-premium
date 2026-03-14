const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'category',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    defaultValue: 10, // minutes
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  spicy_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 0-5 scale
  },
  customizations: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 100, // Default stock
    allowNull: false,
  },
  min_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10, // Low stock alert threshold
    allowNull: false,
  },
});

module.exports = Product;
