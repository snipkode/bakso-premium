const { QueueSetting, Order } = require('../models');
const { Op } = require('sequelize');

// Get today's queue
exports.getTodayQueue = async (req, res) => {
  try {
    const queue = await QueueSetting.getTodayQueue();

    res.json({
      success: true,
      queue: {
        date: queue.date,
        current_queue: queue.current_queue,
        total_orders: queue.total_orders,
        is_active: queue.is_active,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue' });
  }
};

// Get queue by date
exports.getQueueByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const queue = await QueueSetting.findOne({ where: { date } });

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found for this date' });
    }

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue' });
  }
};

// Get queue history
exports.getQueueHistory = async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;

    const queues = await QueueSetting.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
    });

    res.json({ success: true, ...queues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue history' });
  }
};

// Reset queue (admin only)
exports.resetQueue = async (req, res) => {
  try {
    const { date } = req.body;

    if (date) {
      const queue = await QueueSetting.findOne({ where: { date } });
      if (queue) {
        queue.current_queue = 0;
        queue.total_orders = 0;
        await queue.save();
      }
    } else {
      // Reset all past queues
      await QueueSetting.update(
        { current_queue: 0, total_orders: 0 },
        { where: { date: { [Op.lt]: new Date().toISOString().split('T')[0] } } }
      );
    }

    res.json({ success: true, message: 'Queue reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset queue' });
  }
};

// Update queue settings (admin only)
exports.updateQueueSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, notes } = req.body;

    const queue = await QueueSetting.findByPk(id);
    if (!queue) {
      return res.status(404).json({ error: 'Queue setting not found' });
    }

    if (is_active !== undefined) queue.is_active = is_active;
    if (notes) queue.notes = notes;

    await queue.save();

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update queue settings' });
  }
};

// Get orders by queue date
exports.getOrdersByQueueDate = async (req, res) => {
  try {
    const { date } = req.params;

    const orders = await Order.findAll({
      where: { queue_date: date },
      order: [['queue_number', 'ASC']],
      include: [{
        model: require('../models/OrderItem'),
        as: 'items',
      }],
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Manual queue adjustment (admin only)
exports.adjustQueue = async (req, res) => {
  try {
    const { current_queue, total_orders } = req.body;

    const queue = await QueueSetting.getTodayQueue();

    if (current_queue !== undefined) queue.current_queue = current_queue;
    if (total_orders !== undefined) queue.total_orders = total_orders;

    await queue.save();

    res.json({
      success: true,
      queue: {
        current_queue: queue.current_queue,
        total_orders: queue.total_orders,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust queue' });
  }
};
