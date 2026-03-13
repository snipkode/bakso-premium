const { Payment, Order, User } = require('../models');
const { getIO } = require('../config/socket');
const path = require('path');
const fs = require('fs');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { order_id, method, bank_name, account_number, e_wallet_type, transaction_id } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permission
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // COD - auto approve
    if (method === 'cod') {
      order.status = 'paid';
      order.payment_method = 'cod';
      order.paid_at = new Date();
      await order.save();

      // Assign queue number
      const QueueSetting = require('../models/QueueSetting');
      const queue = await QueueSetting.getTodayQueue();
      queue.current_queue += 1;
      queue.total_orders += 1;
      await queue.save();
      
      order.queue_number = queue.current_queue;
      order.queue_date = new Date().toISOString().split('T')[0];
      order.estimated_time = queue.current_queue * 5;
      await order.save();

      // Emit socket event
      const io = getIO();
      io.emit('order:updated', {
        orderId: order.id,
        status: 'paid',
        queueNumber: order.queue_number,
        userId: order.user_id,
      });

      return res.json({
        success: true,
        payment: { method: 'cod', status: 'paid' },
        order: { queue_number: order.queue_number, estimated_time: order.estimated_time },
      });
    }

    // For other payment methods, create pending payment
    let proof_image = null;
    if (req.file) {
      proof_image = `/uploads/${req.file.filename}`;
    }

    const payment = await Payment.create({
      order_id,
      method,
      amount: order.total,
      status: 'pending',
      proof_image,
      bank_name,
      account_number,
      e_wallet_type,
      transaction_id,
    });

    // Update order status
    order.status = 'waiting_verification';
    order.payment_method = method;
    await order.save();

    // Emit socket event
    const io = getIO();
    io.emit('payment:created', {
      orderId: order.id,
      paymentId: payment.id,
    });

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Get payment by order
exports.getPaymentByOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const payment = await Payment.findOne({ where: { order_id } });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment' });
  }
};

// Verify payment (admin only)
exports.verifyPayment = async (req, res) => {
  const transaction = await Payment.sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const payment = await Payment.findByPk(id, { transaction });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = status;
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();

    if (status === 'rejected') {
      payment.rejection_reason = rejection_reason;
    }

    await payment.save({ transaction });

    // Update order status
    const order = await Order.findByPk(payment.order_id, { transaction });
    if (order) {
      if (status === 'verified') {
        order.status = 'paid';
        order.paid_at = new Date();

        // Assign queue number
        const QueueSetting = require('../models/QueueSetting');
        const queue = await QueueSetting.getTodayQueue({ transaction });
        queue.current_queue += 1;
        queue.total_orders += 1;
        await queue.save({ transaction });
        
        order.queue_number = queue.current_queue;
        order.queue_date = new Date().toISOString().split('T')[0];
        order.estimated_time = queue.current_queue * 5;
      } else if (status === 'rejected') {
        order.status = 'rejected';
      }
      await order.save({ transaction });
    }

    await transaction.commit();

    // Emit socket event
    const io = getIO();
    io.emit('payment:verified', {
      orderId: order.id,
      paymentId: payment.id,
      status: payment.status,
      queueNumber: order.queue_number,
      userId: order.user_id,
    });

    res.json({ success: true, payment, order });
  } catch (error) {
    await transaction.rollback();
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// Get pending payments (admin only)
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { status: 'pending' },
      include: [{
        model: Order,
        as: 'order',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone'],
        }],
      }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, method, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await Payment.findAndCountAll({
      where,
      include: [{
        model: Order,
        as: 'order',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone'],
        }],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, ...payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

// Delete payment proof (admin only)
exports.deletePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Delete file
    if (payment.proof_image) {
      const filePath = path.join(__dirname, '../../', payment.proof_image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    payment.proof_image = null;
    await payment.save();

    res.json({ success: true, message: 'Payment proof deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment proof' });
  }
};
