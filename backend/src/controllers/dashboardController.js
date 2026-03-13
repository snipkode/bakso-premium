const { User, Order, Payment, Product, Review, QueueSetting } = require('../models');
const { Op, fn, col } = require('sequelize');
const { getOnlineUsers, getUserActivity } = require('../config/socket');

// Get dashboard statistics (admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today + 'T00:00:00');
    const todayEnd = new Date(today + 'T23:59:59');

    // Total users
    const totalUsers = await User.count({ where: { role: 'customer' } });

    // Total orders
    const totalOrders = await Order.count();

    // Today's orders
    const todayOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
    });

    // Pending orders
    const pendingOrders = await Order.count({
      where: { status: { [Op.in]: ['pending_payment', 'waiting_verification'] } },
    });

    // Active orders (being prepared)
    const activeOrders = await Order.count({
      where: { status: { [Op.in]: ['paid', 'preparing', 'ready'] } },
    });

    // Revenue today
    const revenueToday = await Order.sum('total', {
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
    });

    // Revenue total
    const revenueTotal = await Order.sum('total', {
      where: { status: 'completed' },
    });

    // Pending payments
    const pendingPayments = await Payment.count({ where: { status: 'pending' } });

    // Products count
    const totalProducts = await Product.count();

    // Reviews count
    const totalReviews = await Review.count();

    // Average rating
    const avgRating = await Review.findOne({
      attributes: [[fn('AVG', col('rating')), 'avg']],
      raw: true,
    });

    // Online users
    const onlineCount = getOnlineUsers();
    const activity = getUserActivity();

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          online: onlineCount,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          active: activeOrders,
        },
        revenue: {
          today: revenueToday || 0,
          total: revenueTotal || 0,
        },
        payments: {
          pending: pendingPayments,
        },
        products: {
          total: totalProducts,
        },
        reviews: {
          total: totalReviews,
          average: parseFloat(avgRating?.avg) || 0,
        },
        realtime: {
          online_users: onlineCount,
          user_activity: activity,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

// Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

    let startDate = new Date();
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === 'this_month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }

    // Daily sales
    const dailySales = await Order.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'orders'],
        [fn('SUM', col('total')), 'revenue'],
      ],
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startDate },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Top products
    const topProducts = await Order.findAll({
      attributes: [
        '$items.product_name$',
        [fn('SUM', col('items.quantity')), 'total_sold'],
        [fn('SUM', col('items.subtotal')), 'total_revenue'],
      ],
      include: [{
        model: require('../models/OrderItem'),
        as: 'items',
        attributes: [],
      }],
      where: { status: 'completed', createdAt: { [Op.gte]: startDate } },
      group: ['$items.product_name$'],
      order: [[fn('SUM', col('items.quantity')), 'DESC']],
      limit: 10,
      raw: true,
    });

    // Order status distribution
    const statusDistribution = await Order.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    res.json({
      success: true,
      analytics: {
        daily_sales: dailySales,
        top_products: topProducts,
        status_distribution: statusDistribution,
      },
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ error: 'Failed to get sales analytics' });
  }
};

// Get user activity (admin)
exports.getUserActivity = async (req, res) => {
  try {
    const activity = getUserActivity();
    const onlineCount = getOnlineUsers();

    res.json({
      success: true,
      activity: {
        online_count: onlineCount,
        users: activity,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user activity' });
  }
};

// Get staff status
exports.getStaffStatus = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: { [Op.in]: ['admin', 'kitchen', 'driver'] } },
      attributes: ['id', 'name', 'role', 'status', 'last_active'],
    });

    // Map to departments
    const departments = {
      Admin: [],
      Dapur: [],
      Delivery: [],
      CS: [],
    };

    staff.forEach((s) => {
      const dept = s.role === 'admin' ? 'Admin' : s.role === 'kitchen' ? 'Dapur' : 'Delivery';
      departments[dept].push({
        id: s.id,
        name: s.name,
        role: s.role,
        status: s.status,
        last_active: s.last_active,
      });
    });

    res.json({
      success: true,
      staff: departments,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get staff status' });
  }
};

// Update staff status (staff only)
exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!['admin', 'kitchen', 'driver'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
