const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Null for customer accounts
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'kitchen', 'driver'),
    defaultValue: 'customer',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blocked'),
    defaultValue: 'active',
  },
  completed_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Instance method to check if delivery is allowed
User.prototype.isDeliveryAllowed = async function() {
  return this.completed_orders >= 1;
};

// Instance method to validate delivery order
User.prototype.canOrderDelivery = async function(totalAmount) {
  const isAllowed = await this.isDeliveryAllowed();
  return isAllowed && totalAmount >= 50000;
};

module.exports = User;
