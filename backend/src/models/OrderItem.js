const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customizations: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'order_items',
});

module.exports = OrderItem;
