const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  keys: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_used: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'push_subscriptions',
});

module.exports = PushSubscription;
