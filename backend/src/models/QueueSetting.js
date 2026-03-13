const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QueueSetting = sequelize.define('queueSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    unique: true,
    allowNull: false,
  },
  current_queue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reset_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Static method to get or create today's queue
QueueSetting.getTodayQueue = async function() {
  const today = new Date().toISOString().split('T')[0];
  
  let queue = await this.findOne({ where: { date: today } });
  
  if (!queue) {
    queue = await this.create({
      date: today,
      current_queue: 0,
      total_orders: 0,
    });
  }
  
  return queue;
};

// Static method to get next queue number
QueueSetting.getNextQueueNumber = async function() {
  const today = await this.getTodayQueue();
  today.current_queue += 1;
  today.total_orders += 1;
  await today.save();
  return today.current_queue;
};

// Static method to reset queue
QueueSetting.resetQueue = async function() {
  const today = new Date().toISOString().split('T')[0];
  
  await this.update(
    { current_queue: 0, total_orders: 0 },
    { where: { date: { [sequelize.Op.lt]: today } } }
  );
};

module.exports = QueueSetting;
