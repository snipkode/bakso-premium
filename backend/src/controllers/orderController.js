const { Order, OrderItem, Payment, User, QueueSetting, Voucher, LoyaltyPoint } = require('../models');
const { Op } = require('sequelize');
const { getIO } = require('../config/socket');

// Create order
exports.createOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const {
      order_type,
      items,
      notes,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      voucher_code,
      loyalty_points_used,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Fetch product details and calculate subtotal
    const { Product } = require('../models');
    let subtotal = 0;
    const itemsWithDetails = [];

    for (const item of items) {
      let product;
      if (item.product_id) {
        product = await Product.findByPk(item.product_id);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${item.product_id}` });
        }
        
        // Check product availability
        if (!product.is_available) {
          return res.status(400).json({ error: `Product ${product.name} is not available` });
        }
        
        // Check stock
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Stock tidak cukup untuk ${product.name}. Stock: ${product.stock}, requested: ${item.quantity}` 
          });
        }
        
        itemsWithDetails.push({
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: item.quantity,
          notes: item.notes,
          customizations: item.customizations || [],
        });
        subtotal += product.price * item.quantity;
      } else if (item.price && item.product_name) {
        itemsWithDetails.push(item);
        subtotal += item.price * item.quantity;
      } else {
        return res.status(400).json({ error: 'Item must have product_id or product_name and price' });
      }
    }

    // Validate delivery eligibility
    if (order_type === 'delivery') {
      const canOrderDelivery = await user.canOrderDelivery(0);
      if (!canOrderDelivery) {
        return res.status(403).json({
          error: 'Delivery not available for first-time orders. Please choose dine-in or takeaway.',
        });
      }
    }

    // Apply voucher
    let discount = 0;
    if (voucher_code) {
      const voucher = await Voucher.findOne({
        where: {
          code: voucher_code,
          is_active: true,
          valid_from: { [Op.lte]: new Date() },
          valid_until: { [Op.gte]: new Date() },
        },
      });

      if (voucher) {
        if (voucher.min_purchase <= subtotal) {
          if (voucher.type === 'percentage') {
            discount = Math.floor((subtotal * voucher.value) / 100);
            if (voucher.max_discount && discount > voucher.max_discount) {
              discount = voucher.max_discount;
            }
          } else {
            discount = voucher.value;
          }
        }
      }
    }

    // Apply loyalty points (1 point = Rp 1)
    let pointsDiscount = 0;
    if (loyalty_points_used && loyalty_points_used > 0) {
      pointsDiscount = Math.min(loyalty_points_used, user.loyalty_points);
    }

    // Delivery fee
    const delivery_fee = order_type === 'delivery' ? 15000 : 0;

    // Total
    const total = subtotal - discount - pointsDiscount + delivery_fee;

    // Validate minimum for delivery
    if (order_type === 'delivery' && total < 50000) {
      return res.status(400).json({ error: 'Minimum order for delivery is Rp 50,000' });
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      customer_name: user.name,
      customer_phone: user.phone,
      order_type,
      order_number: `BSO/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      status: 'pending_payment',
      subtotal,
      discount,
      delivery_fee,
      total,
      notes,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      voucher_code: voucher_code || null,
      loyalty_points_used: pointsDiscount,
      estimated_time: 30,
    }, { transaction });

    // Create order items AND reduce stock
    for (const item of itemsWithDetails) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        notes: item.notes,
        customizations: item.customizations || [],
      }, { transaction });
      
      // Reduce product stock
      if (item.product_id) {
        await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.product_id },
          transaction,
        });
      }
    }

    // Deduct loyalty points if used
    if (pointsDiscount > 0) {
      user.loyalty_points -= pointsDiscount;
      await LoyaltyPoint.create({
        user_id: userId,
        points: -pointsDiscount,
        order_id: order.id,
        type: 'redeemed',
        description: `Redeemed ${pointsDiscount} points for order ${order.order_number}`,
      }, { transaction });
      await user.save({ transaction });
    }

    await transaction.commit();

    // Emit socket event
    const io = getIO();
    io.to(`user:${userId}`).emit('order:created', {
      orderId: order.id,
      orderNumber: order.order_number,
      total,
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total,
        status: order.status,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permission
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, ...orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
};

// Get all orders (admin/kitchen)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, order_type, date, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (date) {
      where.createdAt = {
        [Op.gte]: new Date(date + 'T00:00:00'),
        [Op.lt]: new Date(date + 'T23:59:59'),
      };
    }

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, ...orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, queue_number } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;

    // Assign queue number when status becomes PAID
    if (status === 'paid' && !order.queue_number) {
      const queue = await QueueSetting.getTodayQueue();
      queue.current_queue += 1;
      queue.total_orders += 1;
      await queue.save({ transaction });
      
      order.queue_number = queue.current_queue;
      order.queue_date = new Date().toISOString().split('T')[0];
      
      // Calculate estimated time (queue position × 5 min)
      order.estimated_time = queue.current_queue * 5;
    }

    // Mark as completed
    if (status === 'completed') {
      order.completed_at = new Date();
      
      // Update user's completed orders
      const user = await User.findByPk(order.user_id, { transaction });
      user.completed_orders += 1;
      
      // Add loyalty points (1% of total)
      const pointsEarned = Math.floor(order.total / 100);
      user.loyalty_points += pointsEarned;
      
      await LoyaltyPoint.create({
        user_id: user.id,
        points: pointsEarned,
        order_id: order.id,
        type: 'earned',
        description: `Earned ${pointsEarned} points from order ${order.order_number}`,
      }, { transaction });
      
      await user.save({ transaction });
    }

    // Mark as cancelled
    if (status === 'cancelled') {
      order.cancelled_at = new Date();
      order.cancellation_reason = req.body.cancellation_reason || null;
      
      // Refund loyalty points if used
      if (order.loyalty_points_used > 0) {
        const user = await User.findByPk(order.user_id, { transaction });
        user.loyalty_points += order.loyalty_points_used;
        await user.save({ transaction });
      }
    }

    await order.save({ transaction });
    await transaction.commit();

    // Emit socket event
    const io = getIO();
    io.emit('order:updated', {
      orderId: order.id,
      status: order.status,
      queueNumber: order.queue_number,
      userId: order.user_id,
    });

    res.json({ success: true, order });
  } catch (error) {
    await transaction.rollback();
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Cancel order (customer)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permission
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending or waiting verification orders
    if (!['pending_payment', 'waiting_verification'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    order.cancelled_at = new Date();
    order.cancellation_reason = reason;
    await order.save();

    // Refund loyalty points if used
    if (order.loyalty_points_used > 0) {
      const user = await User.findByPk(order.user_id);
      user.loyalty_points += order.loyalty_points_used;
      await user.save();
    }

    // Emit socket event
    const io = getIO();
    io.emit('order:updated', {
      orderId: order.id,
      status: 'cancelled',
      userId: order.user_id,
    });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Get queue info
exports.getQueueInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      attributes: ['id', 'queue_number', 'queue_date', 'status', 'estimated_time'],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get today's queue settings
    const todayQueue = await QueueSetting.getTodayQueue();

    res.json({
      success: true,
      queue: {
        queue_number: order.queue_number,
        queue_date: order.queue_date,
        status: order.status,
        estimated_time: order.estimated_time,
        total_today: todayQueue.total_orders,
        current_serving: todayQueue.current_queue,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue info' });
  }
};

// Get today's queue stats
exports.getTodayQueueStats = async (req, res) => {
  try {
    const todayQueue = await QueueSetting.getTodayQueue();

    res.json({
      success: true,
      queue: {
        date: todayQueue.date,
        current_queue: todayQueue.current_queue,
        total_orders: todayQueue.total_orders,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
};
