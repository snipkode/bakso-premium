const reportGenerator = require('../utils/reportGenerator');
const { auth, authorize } = require('../middleware/auth');
const { Order, Payment, User, OrderItem, Product } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const { range = 'today' } = req.query;
    
    console.log('📊 Getting stats for range:', range);
    
    let startDate, endDate;
    const now = new Date();
    
    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    console.log('Date range:', startDate, 'to', endDate);

    // Get orders with group by status using raw query
    const orders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.literal('`order`.`id`')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    console.log('Orders by status:', orders);

    // Calculate revenue from completed orders
    const completedOrders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: ['total'],
      raw: true,
    });

    console.log('Completed orders count:', completedOrders.length);

    const revenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    // Get new customers
    const newCustomers = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
    });

    // Get products sold
    const orderItems = await OrderItem.findAll({
      where: {
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: [
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'total'],
      ],
      raw: true,
    });

    const productsSold = parseInt(orderItems[0]?.total || 0);

    // Calculate completion rate
    const totalOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
    });

    const completedCount = completedOrders.length;
    const completionRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

    console.log('Stats calculated successfully');

    res.json({
      success: true,
      stats: {
        revenue,
        orders: totalOrders,
        productsSold,
        newCustomers,
        completionRate,
      },
    });
  } catch (error) {
    console.error('❌ Get stats error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
};

// Get report list
exports.getReportList = async (req, res) => {
  try {
    const reports = await reportGenerator.getReportList();
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get report list' });
  }
};

// Generate daily sales report
exports.generateDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    
    const report = await reportGenerator.generateDailyReport(reportDate);
    
    res.json({
      success: true,
      report: {
        fileName: report.fileName,
        url: report.url,
        type: report.type,
        period: report.data.sales.period,
        startDate: report.data.sales.startDate,
        endDate: report.data.sales.endDate,
        summary: {
          totalOrders: report.data.sales.totalOrders,
          totalRevenue: report.data.sales.totalRevenue,
          averageOrderValue: report.data.sales.averageOrderValue,
          byType: report.data.sales.byType,
        },
      },
    });
  } catch (error) {
    console.error('Generate daily report error:', error);
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
};

// Generate weekly sales report
exports.generateWeeklyReport = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const reportDate = weekStart ? new Date(weekStart) : new Date();
    
    console.log('📊 Generating weekly report for:', reportDate);
    
    const report = await reportGenerator.generateWeeklyReport(reportDate);
    
    console.log('✅ Weekly report generated:', report.fileName);
    
    res.json({
      success: true,
      report: {
        fileName: report.fileName,
        url: report.url,
        type: report.type,
        period: report.data.sales.period,
        startDate: report.data.sales.startDate,
        endDate: report.data.sales.endDate,
        summary: {
          totalOrders: report.data.sales.totalOrders,
          totalRevenue: report.data.sales.totalRevenue,
          averageOrderValue: report.data.sales.averageOrderValue,
          byType: report.data.sales.byType,
        },
      },
    });
  } catch (error) {
    console.error('Generate weekly report error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate weekly report',
      details: error.message 
    });
  }
};

// Generate monthly sales report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    const reportDate = month ? new Date(month) : new Date();
    
    const report = await reportGenerator.generateMonthlyReport(reportDate);
    
    res.json({
      success: true,
      report: {
        fileName: report.fileName,
        url: report.url,
        type: report.type,
        period: report.data.sales.period,
        startDate: report.data.sales.startDate,
        endDate: report.data.sales.endDate,
        summary: {
          totalOrders: report.data.sales.totalOrders,
          totalRevenue: report.data.sales.totalRevenue,
          averageOrderValue: report.data.sales.averageOrderValue,
          byType: report.data.sales.byType,
          topProducts: report.data.sales.topProducts.slice(0, 5),
        },
      },
    });
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
};

// Generate staff performance report
exports.generateStaffReport = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    const report = await reportGenerator.generateStaffReport(period, startDate, endDate);
    
    res.json({
      success: true,
      report: {
        fileName: report.fileName,
        url: report.url,
        type: report.type,
        period: report.period,
        summary: {
          kitchen: {
            total: report.data.kitchen.length,
            totalOrdersPrepared: report.data.kitchen.reduce((sum, s) => sum + s.ordersPrepared, 0),
            bestPerformer: report.data.kitchen.reduce((prev, current) => 
              (current.ordersPrepared > prev.ordersPrepared) ? current : prev, { ordersPrepared: 0, name: 'N/A' }),
          },
          driver: {
            total: report.data.driver.length,
            totalDeliveries: report.data.driver.reduce((sum, s) => sum + s.deliveriesCompleted, 0),
            bestPerformer: report.data.driver.reduce((prev, current) => 
              (current.deliveriesCompleted > prev.deliveriesCompleted) ? current : prev, { deliveriesCompleted: 0, name: 'N/A' }),
          },
          admin: {
            total: report.data.admin.length,
            totalPaymentsVerified: report.data.admin.reduce((sum, s) => sum + s.paymentsVerified, 0),
            bestPerformer: report.data.admin.reduce((prev, current) => 
              (current.paymentsVerified > prev.paymentsVerified) ? current : prev, { paymentsVerified: 0, name: 'N/A' }),
          },
        },
      },
    });
  } catch (error) {
    console.error('Generate staff report error:', error);
    res.status(500).json({ error: 'Failed to generate staff report' });
  }
};

// Download report
exports.downloadReport = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = `${reportGenerator.uploadsDir}/${fileName}`;
    
    res.download(filePath, fileName);
  } catch (error) {
    res.status(404).json({ error: 'Report not found' });
  }
};

// Auto-generate daily report at midnight (optional scheduled task)
exports.autoGenerateDailyReport = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const report = await reportGenerator.generateDailyReport(yesterday);
    console.log(`✅ Auto-generated daily report: ${report.fileName}`);
    return report;
  } catch (error) {
    console.error('Auto-generate daily report error:', error);
    throw error;
  }
};
