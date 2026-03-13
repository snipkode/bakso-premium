const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { sequelize, Order, User, Payment, OrderItem, Review } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

class ReportGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads/reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // ==================== HELPER METHODS ====================

  async getSalesData(period, startDate, endDate) {
    const where = {
      status: 'completed',
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    // Total orders and revenue
    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items', attributes: ['product_name', 'quantity', 'price'] },
        { model: User, as: 'user', attributes: ['name', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by order type
    const byType = {
      'dine-in': orders.filter(o => o.order_type === 'dine-in').length,
      'takeaway': orders.filter(o => o.order_type === 'takeaway').length,
      'delivery': orders.filter(o => o.order_type === 'delivery').length,
    };

    // Daily breakdown
    const dailySales = orders.reduce((acc, order) => {
      const date = moment(order.createdAt).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
      acc[date].count += 1;
      acc[date].revenue += order.total;
      return acc;
    }, {});

    // Top products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.product_name].quantity += item.quantity;
        productSales[item.product_name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      period,
      startDate: moment(startDate).format('DD MMMM YYYY'),
      endDate: moment(endDate).format('DD MMMM YYYY'),
      totalOrders,
      totalRevenue,
      averageOrderValue,
      byType,
      dailySales,
      topProducts,
      orders,
    };
  }

  async getStaffPerformance(startDate, endDate) {
    const where = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    // Kitchen performance (orders prepared)
    const kitchenStats = await User.findAll({
      where: { role: 'kitchen' },
      attributes: [
        'id',
        'name',
        'phone',
      ],
    });

    // Driver performance (deliveries completed)
    const driverStats = await User.findAll({
      where: { role: 'driver' },
      attributes: [
        'id',
        'name',
        'phone',
      ],
    });

    // Admin performance (payments verified)
    const adminStats = await User.findAll({
      where: { role: 'admin' },
      attributes: [
        'id',
        'name',
        'phone',
      ],
    });

    // Get order counts separately
    const kitchenOrders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: [[fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    const deliveryOrders = await Order.findAll({
      where: {
        order_type: 'delivery',
        status: 'completed',
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: [[fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    const verifiedPayments = await Payment.findAll({
      where: {
        status: 'verified',
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: [[fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    const totalKitchenOrders = parseInt(kitchenOrders[0]?.count || '0');
    const totalDeliveries = parseInt(deliveryOrders[0]?.count || '0');
    const totalPayments = parseInt(verifiedPayments[0]?.count || '0');

    return {
      kitchen: kitchenStats.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        ordersPrepared: Math.floor(totalKitchenOrders / kitchenStats.length) || 0,
      })),
      driver: driverStats.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        deliveriesCompleted: Math.floor(totalDeliveries / driverStats.length) || 0,
      })),
      admin: adminStats.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        paymentsVerified: Math.floor(totalPayments / adminStats.length) || 0,
      })),
    };
  }

  // ==================== PDF GENERATION ====================

  generatePDF(data, type) {
    return new Promise((resolve, reject) => {
      const fileName = `report_${type}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);
      
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this.drawHeader(doc, type);
      
      // Content based on type
      if (type === 'sales') {
        this.drawSalesReport(doc, data);
      } else if (type === 'staff') {
        this.drawStaffReport(doc, data);
      } else if (type === 'combined') {
        this.drawCombinedReport(doc, data);
      }
      
      // Footer
      this.drawFooter(doc);
      
      doc.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/uploads/reports/${fileName}`,
        });
      });
      
      doc.on('error', reject);
      
      doc.end();
    });
  }

  drawHeader(doc, type) {
    const titles = {
      sales: 'LAPORAN PENJUALAN',
      staff: 'LAPORAN KINERJA STAFF',
      combined: 'LAPORAN LENGKAP RESTORAN',
    };

    // Logo/Title
    doc.fontSize(24).font('Helvetica-Bold').text('🍜 BAKSO PREMIUM', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text(titles[type], { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Dicetak: ${moment().format('DD MMMM YYYY HH:mm:ss')}`, { align: 'center' });
    doc.moveDown(1);
    
    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#007AFF');
    doc.moveDown(1);
  }

  drawSalesReport(doc, data) {
    // Period info
    doc.fontSize(12).font('Helvetica-Bold').text(`Periode: ${data.startDate} - ${data.endDate}`);
    doc.fontSize(10).font('Helvetica').text(`Jenis Laporan: ${data.period.toUpperCase()}`);
    doc.moveDown(1);

    // Summary Cards
    doc.fontSize(14).font('Helvetica-Bold').text('📊 RINGKASAN', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Pesanan: ${data.totalOrders} order`, 50, doc.y, { width: 200 });
    doc.text(`Total Pendapatan: Rp ${data.totalRevenue.toLocaleString('id-ID')}`, 300, doc.y - 15, { width: 200 });
    doc.moveDown(0.5);
    doc.text(`Rata-rata per Order: Rp ${Math.round(data.averageOrderValue).toLocaleString('id-ID')}`, 50, doc.y);
    doc.moveDown(1);

    // Order Type Breakdown
    doc.fontSize(12).font('Helvetica-Bold').text('📋 JENIS PESANAN', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`🍽️  Dine-in: ${data.byType['dine-in']} order`, 50, doc.y);
    doc.text(`🛍️  Takeaway: ${data.byType['takeaway']} order`, 250, doc.y - 15);
    doc.text(`🛵  Delivery: ${data.byType['delivery']} order`, 450, doc.y - 30);
    doc.moveDown(1);

    // Top Products
    doc.fontSize(12).font('Helvetica-Bold').text('⭐ PRODUK TERLARIS', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No', 50, doc.y);
    doc.text('Produk', 80, doc.y);
    doc.text('Qty', 350, doc.y);
    doc.text('Revenue', 420, doc.y);
    doc.moveDown(0.3);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown(0.3);
    
    doc.fontSize(9).font('Helvetica');
    data.topProducts.slice(0, 10).forEach((product, index) => {
      const yPos = doc.y;
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(product.name, 80, yPos, { width: 250 });
      doc.text(product.quantity.toString(), 350, yPos);
      doc.text(`Rp ${product.revenue.toLocaleString('id-ID')}`, 420, yPos);
      doc.moveDown(0.4);
    });
    doc.moveDown(0.5);

    // Daily Sales Table (if not too many days)
    const days = Object.keys(data.dailySales);
    if (days.length <= 31) {
      doc.fontSize(12).font('Helvetica-Bold').text('📅 PENJUALAN HARIAN', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Tanggal', 50, doc.y);
      doc.text('Order', 350, doc.y);
      doc.text('Revenue', 420, doc.y);
      doc.moveDown(0.3);
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
      doc.moveDown(0.3);
      
      doc.fontSize(9).font('Helvetica');
      days.sort().forEach(date => {
        const day = data.dailySales[date];
        const yPos = doc.y;
        doc.text(moment(date).format('DD MMM'), 50, yPos);
        doc.text(day.count.toString(), 350, yPos);
        doc.text(`Rp ${day.revenue.toLocaleString('id-ID')}`, 420, yPos);
        doc.moveDown(0.4);
        
        // Add page break if needed
        if (doc.y > 700) {
          doc.addPage();
          this.drawFooter(doc, true);
        }
      });
    }

    // Recent Orders
    doc.addPage();
    this.drawHeader(doc, 'sales');
    doc.fontSize(12).font('Helvetica-Bold').text('📦 PESANAN TERBARU', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Order #', 50, doc.y);
    doc.text('Customer', 130, doc.y);
    doc.text('Type', 300, doc.y);
    doc.text('Total', 380, doc.y);
    doc.text('Tanggal', 460, doc.y);
    doc.moveDown(0.3);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown(0.3);
    
    doc.fontSize(8).font('Helvetica');
    data.orders.slice(0, 30).forEach(order => {
      const yPos = doc.y;
      doc.text(order.order_number, 50, yPos);
      doc.text(order.user?.name || 'N/A', 130, yPos, { width: 150 });
      doc.text(order.order_type, 300, yPos);
      doc.text(`Rp ${order.total.toLocaleString('id-ID')}`, 380, yPos);
      doc.text(moment(order.createdAt).format('DD/MM'), 460, yPos);
      doc.moveDown(0.4);
      
      if (doc.y > 700) {
        doc.addPage();
        this.drawFooter(doc, true);
      }
    });
  }

  drawStaffReport(doc, data) {
    // Kitchen Performance
    doc.fontSize(14).font('Helvetica-Bold').text('👨‍🍳 KINERJA DAPUR (KITCHEN)', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No', 50, doc.y);
    doc.text('Nama', 80, doc.y);
    doc.text('Telepon', 250, doc.y);
    doc.text('Pesanan Disiapkan', 400, doc.y);
    doc.moveDown(0.3);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown(0.3);
    
    doc.fontSize(9).font('Helvetica');
    data.kitchen.forEach((staff, index) => {
      const yPos = doc.y;
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(staff.name, 80, yPos);
      doc.text(staff.phone, 250, yPos);
      doc.text(`${staff.ordersPrepared} order`, 400, yPos);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);

    // Driver Performance
    doc.fontSize(14).font('Helvetica-Bold').text('🛵 KINERJA PENGIRIMAN (DRIVER)', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No', 50, doc.y);
    doc.text('Nama', 80, doc.y);
    doc.text('Telepon', 250, doc.y);
    doc.text('Pengiriman Selesai', 400, doc.y);
    doc.moveDown(0.3);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown(0.3);
    
    doc.fontSize(9).font('Helvetica');
    data.driver.forEach((staff, index) => {
      const yPos = doc.y;
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(staff.name, 80, yPos);
      doc.text(staff.phone, 250, yPos);
      doc.text(`${staff.deliveriesCompleted} delivery`, 400, yPos);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);

    // Admin Performance
    doc.fontSize(14).font('Helvetica-Bold').text('💳 KINERJA ADMIN (VERIFIKASI)', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No', 50, doc.y);
    doc.text('Nama', 80, doc.y);
    doc.text('Telepon', 250, doc.y);
    doc.text('Pembayaran Diverifikasi', 400, doc.y);
    doc.moveDown(0.3);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown(0.3);
    
    doc.fontSize(9).font('Helvetica');
    data.admin.forEach((staff, index) => {
      const yPos = doc.y;
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(staff.name, 80, yPos);
      doc.text(staff.phone, 250, yPos);
      doc.text(`${staff.paymentsVerified} pembayaran`, 400, yPos);
      doc.moveDown(0.5);
    });

    // Summary
    doc.addPage();
    this.drawHeader(doc, 'staff');
    
    doc.fontSize(14).font('Helvetica-Bold').text('📊 RINGKASAN KINERJA', { underline: true });
    doc.moveDown(1);
    
    const totalKitchen = data.kitchen.reduce((sum, s) => sum + s.ordersPrepared, 0);
    const totalDriver = data.driver.reduce((sum, s) => sum + s.deliveriesCompleted, 0);
    const totalAdmin = data.admin.reduce((sum, s) => sum + s.paymentsVerified, 0);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Pesanan Disiapkan Dapur: ${totalKitchen} order`, 50, doc.y);
    doc.moveDown(0.5);
    doc.text(`Total Pengiriman Selesai: ${totalDriver} delivery`, 50, doc.y);
    doc.moveDown(0.5);
    doc.text(`Total Pembayaran Diverifikasi: ${totalAdmin} pembayaran`, 50, doc.y);
    doc.moveDown(1);
    
    // Best Performers
    doc.fontSize(12).font('Helvetica-Bold').text('🏆 STAFF TERBAIK', { underline: true });
    doc.moveDown(0.5);
    
    const bestKitchen = data.kitchen.reduce((prev, current) => 
      (current.ordersPrepared > prev.ordersPrepared) ? current : prev, { ordersPrepared: 0, name: 'N/A' });
    const bestDriver = data.driver.reduce((prev, current) => 
      (current.deliveriesCompleted > prev.deliveriesCompleted) ? current : prev, { deliveriesCompleted: 0, name: 'N/A' });
    const bestAdmin = data.admin.reduce((prev, current) => 
      (current.paymentsVerified > prev.paymentsVerified) ? current : prev, { paymentsVerified: 0, name: 'N/A' });
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`👨‍🍳 Kitchen Terbaik: ${bestKitchen.name} (${bestKitchen.ordersPrepared} order)`, 50, doc.y);
    doc.moveDown(0.5);
    doc.text(`🛵 Driver Terbaik: ${bestDriver.name} (${bestDriver.deliveriesCompleted} delivery)`, 50, doc.y);
    doc.moveDown(0.5);
    doc.text(`💳 Admin Terbaik: ${bestAdmin.name} (${bestAdmin.paymentsVerified} pembayaran)`, 50, doc.y);
  }

  drawCombinedReport(doc, data) {
    // Sales Summary
    this.drawSalesReport(doc, data.sales);
    
    // Add staff report on new page
    doc.addPage();
    this.drawHeader(doc, 'staff');
    this.drawStaffReport(doc, data.staff);
  }

  drawFooter(doc, includePageNumber = false) {
    const pageHeight = doc.page.height;
    doc.fontSize(8).font('Helvetica').fillColor('#666');
    doc.text('© 2026 Bakso Premium Ordering System', 50, pageHeight - 50, { width: 500, align: 'center' });
    if (includePageNumber) {
      doc.text(`Halaman ${doc.page.number}`, 50, pageHeight - 35, { width: 500, align: 'center' });
    }
  }

  // ==================== PUBLIC METHODS ====================

  async generateDailyReport(date = new Date()) {
    const start = moment(date).startOf('day').toDate();
    const end = moment(date).endOf('day').toDate();
    
    const salesData = await this.getSalesData('daily', start, end);
    const staffData = await this.getStaffPerformance(start, end);
    
    const report = await this.generatePDF(salesData, 'sales');
    return {
      ...report,
      type: 'daily',
      data: {
        sales: salesData,
        staff: staffData,
      },
    };
  }

  async generateWeeklyReport(weekStart = new Date()) {
    const start = moment(weekStart).startOf('week').toDate();
    const end = moment(weekStart).endOf('week').toDate();
    
    const salesData = await this.getSalesData('weekly', start, end);
    const staffData = await this.getStaffPerformance(start, end);
    
    const report = await this.generatePDF(salesData, 'sales');
    return {
      ...report,
      type: 'weekly',
      data: {
        sales: salesData,
        staff: staffData,
      },
    };
  }

  async generateMonthlyReport(month = new Date()) {
    const start = moment(month).startOf('month').toDate();
    const end = moment(month).endOf('month').toDate();
    
    const salesData = await this.getSalesData('monthly', start, end);
    const staffData = await this.getStaffPerformance(start, end);
    
    const report = await this.generatePDF({ sales: salesData, staff: staffData }, 'combined');
    return {
      ...report,
      type: 'monthly',
      data: {
        sales: salesData,
        staff: staffData,
      },
    };
  }

  async generateStaffReport(period = 'weekly', startDate = null, endDate = null) {
    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      if (period === 'daily') {
        start = moment(now).startOf('day').toDate();
        end = moment(now).endOf('day').toDate();
      } else if (period === 'weekly') {
        start = moment(now).startOf('week').toDate();
        end = moment(now).endOf('week').toDate();
      } else {
        start = moment(now).startOf('month').toDate();
        end = moment(now).endOf('month').toDate();
      }
    }
    
    const staffData = await this.getStaffPerformance(start, end);
    const report = await this.generatePDF(staffData, 'staff');
    
    return {
      ...report,
      type: 'staff',
      period,
      data: staffData,
    };
  }

  async getReportList() {
    const files = fs.readdirSync(this.uploadsDir);
    return files
      .filter(f => f.endsWith('.pdf'))
      .map(f => ({
        fileName: f,
        url: `/uploads/reports/${f}`,
        createdAt: fs.statSync(path.join(this.uploadsDir, f)).birthtime,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

module.exports = new ReportGenerator();
