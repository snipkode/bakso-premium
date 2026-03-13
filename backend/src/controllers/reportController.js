const reportGenerator = require('../utils/reportGenerator');
const { auth, authorize } = require('../middleware/auth');
const multer = require('../middleware/upload');

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
    
    const report = await reportGenerator.generateWeeklyReport(reportDate);
    
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
    console.error('Generate weekly report error:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
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
