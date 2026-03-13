const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  queue_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  queue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order_type: {
    type: DataTypes.ENUM('dine-in', 'takeaway', 'delivery'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'pending_payment',
      'waiting_verification',
      'paid',
      'preparing',
      'ready',
      'completed',
      'rejected',
      'cancelled'
    ),
    defaultValue: 'pending_payment',
  },
  subtotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  delivery_fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  delivery_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  delivery_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  estimated_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  actual_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  voucher_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  loyalty_points_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loyalty_points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  hooks: {
    beforeCreate: (order) => {
      // Generate order number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      order.order_number = `BSO/${year}${month}/${random}`;
    },
  },
});

module.exports = Order;
