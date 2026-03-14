const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { sequelize, Order, User, Payment, OrderItem, Review } = require('../models');
const { Op, fn, col } = require('sequelize');

class ReportGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads/reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    // Indonesian locale for moment
    moment.locale('id');
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

    // Get all staff
    const kitchenStaff = await User.findAll({ where: { role: 'kitchen' }, attributes: ['id', 'name', 'phone'] });
    const driverStaff = await User.findAll({ where: { role: 'driver' }, attributes: ['id', 'name', 'phone'] });
    const adminStaff = await User.findAll({ where: { role: 'admin' }, attributes: ['id', 'name', 'phone'] });

    // Get counts
    const totalKitchenOrders = await Order.count({
      where: { status: 'completed', createdAt: where.createdAt },
    });

    const totalDeliveries = await Order.count({
      where: { order_type: 'delivery', status: 'completed', createdAt: where.createdAt },
    });

    const totalPaymentsVerified = await Payment.count({
      where: { status: 'verified', createdAt: where.createdAt },
    });

    return {
      kitchen: kitchenStaff.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        ordersPrepared: Math.floor(totalKitchenOrders / kitchenStaff.length) || 0,
      })),
      driver: driverStaff.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        deliveriesCompleted: Math.floor(totalDeliveries / driverStaff.length) || 0,
      })),
      admin: adminStaff.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        paymentsVerified: Math.floor(totalPaymentsVerified / adminStaff.length) || 0,
      })),
      totals: {
        kitchenOrders: totalKitchenOrders,
        deliveries: totalDeliveries,
        paymentsVerified: totalPaymentsVerified,
      },
    };
  }

  // ==================== PDF GENERATION ====================

  generatePDF(data, type) {
    return new Promise((resolve, reject) => {
      const fileName = `report_${type}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);
      
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        info: {
          Title: `Laporan ${type === 'sales' ? 'Penjualan' : 'Kinerja Staff'}`,
          Author: 'Bakso Premium System',
          Creator: 'Bakso Premium Reporting System',
        }
      });
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
      
      // Footer with page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        this.drawFooter(doc, i + 1, pages.count);
      }
      
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

    // Save state
    doc.save();
    
    // Background header bar
    doc.rect(0, 0, doc.page.width, 100).fill('#007AFF');
    
    // White text on blue background
    doc.fillColor('#FFFFFF');
    
    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('🍜 BAKSO PREMIUM', { align: 'center', top: 20 });
    doc.moveDown(0.3);
    doc.fontSize(14).text('Sistem Pelaporan Restoran', { align: 'center' });
    
    // Report type
    doc.moveDown(0.5);
    doc.fontSize(16).text(titles[type], { align: 'center' });
    
    // Restore state for content
    doc.restore();

    // Move cursor below header
    doc.y = 120;

    // Period info - removed data reference as it's not passed to drawHeader
    doc.fillColor('#333333');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Tanggal Cetak: ${moment().format('DD MMMM YYYY HH:mm:ss')}`, { align: 'center' });
    doc.moveDown(1);
    
    // Line separator
    doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke('#007AFF');
    doc.moveDown(0.5);
  }

  drawSalesReport(doc, data) {
    // Summary Cards
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#007AFF').text('📊 RINGKASAN PENJUALAN', { underline: true });
    doc.moveDown(0.5);
    
    // Create summary boxes
    const boxWidth = 160;
    const boxHeight = 70;
    const startY = doc.y;
    const gap = 15;
    
    // Box 1: Total Orders
    this.drawSummaryBox(doc, 40, startY, boxWidth, boxHeight, {
      title: 'Total Pesanan',
      value: `${data.totalOrders}`,
      subtitle: 'order',
      color: '#34C759',
    });
    
    // Box 2: Total Revenue
    this.drawSummaryBox(doc, 40 + boxWidth + gap, startY, boxWidth, boxHeight, {
      title: 'Total Pendapatan',
      value: `Rp ${data.totalRevenue.toLocaleString('id-ID')}`,
      subtitle: 'rupiah',
      color: '#007AFF',
    });
    
    // Box 3: Average Order Value
    this.drawSummaryBox(doc, 40 + (boxWidth + gap) * 2, startY, boxWidth, boxHeight, {
      title: 'Rata-rata per Order',
      value: `Rp ${Math.round(data.averageOrderValue).toLocaleString('id-ID')}`,
      subtitle: 'rupiah',
      color: '#FF9500',
    });
    
    doc.y = startY + boxHeight + 20;
    
    // Order Type Breakdown
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#007AFF').text('📋 JENIS PESANAN', { underline: true });
    doc.moveDown(0.5);
    
    const types = [
      { icon: '🍽️', label: 'Dine-in (Makan di Tempat)', value: data.byType['dine-in'], color: '#5856D6' },
      { icon: '🛍️', label: 'Takeaway (Dibawa Pulang)', value: data.byType['takeaway'], color: '#FF2D55' },
      { icon: '🛵', label: 'Delivery (Diantar)', value: data.byType['delivery'], color: '#34C759' },
    ];
    
    types.forEach(type => {
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(`${type.icon} ${type.label}:`, 50, doc.y);
      doc.font('Helvetica-Bold').fillColor(type.color).text(`${type.value} order`, 350, doc.y - 12);
      doc.moveDown(0.4);
    });
    doc.moveDown(0.5);

    // Top Products Table
    doc.addPage();
    this.drawHeader(doc, 'sales');
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#007AFF').text('⭐ 10 PRODUK TERLARIS', { underline: true });
    doc.moveDown(0.5);
    
    // Table header
    const tableTop = doc.y;
    this.drawTableHeader(doc, tableTop, ['No', 'Nama Produk', 'Qty Terjual', 'Total Pendapatan']);
    
    // Table rows
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    data.topProducts.forEach((product, index) => {
      const yPos = doc.y;
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(product.name, 80, yPos, { width: 280, ellipsis: true });
      doc.text(`${product.quantity}`, 370, yPos);
      doc.text(`Rp ${product.revenue.toLocaleString('id-ID')}`, 460, yPos);
      doc.moveDown(0.5);
      
      // Page break check
      if (doc.y > 700) {
        doc.addPage();
        this.drawHeader(doc, 'sales');
      }
    });
    
    // Daily Sales (if not too many days)
    const days = Object.keys(data.dailySales);
    if (days.length <= 31 && days.length > 0) {
      doc.addPage();
      this.drawHeader(doc, 'sales');
      
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#007AFF').text('📅 PENJUALAN HARIAN', { underline: true });
      doc.moveDown(0.5);
      
      const tableTop2 = doc.y;
      this.drawTableHeader(doc, tableTop2, ['Tanggal', 'Jumlah Order', 'Pendapatan']);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      days.sort().forEach(date => {
        const day = data.dailySales[date];
        doc.text(moment(date).format('DD MMMM YYYY'), 50, doc.y);
        doc.text(`${day.count}`, 370, doc.y);
        doc.text(`Rp ${day.revenue.toLocaleString('id-ID')}`, 460, doc.y);
        doc.moveDown(0.5);
        
        if (doc.y > 700) {
          doc.addPage();
          this.drawHeader(doc, 'sales');
        }
      });
    }

    // Recent Orders
    doc.addPage();
    this.drawHeader(doc, 'sales');
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#007AFF').text('📦 30 PESANAN TERBARU', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop3 = doc.y;
    this.drawTableHeader(doc, tableTop3, ['No. Order', 'Pelanggan', 'Jenis', 'Total', 'Tanggal']);
    
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    data.orders.slice(0, 30).forEach((order, index) => {
      const typeLabel = order.order_type === 'dine-in' ? 'Dine-in' : 
                        order.order_type === 'takeaway' ? 'Takeaway' : 'Delivery';
      
      doc.text(order.order_number, 50, doc.y, { width: 100 });
      doc.text(order.user?.name || 'Umum', 160, doc.y, { width: 120 });
      doc.text(typeLabel, 290, doc.y);
      doc.text(`Rp ${order.total.toLocaleString('id-ID')}`, 370, doc.y);
      doc.text(moment(order.createdAt).format('DD/MM HH:mm'), 480, doc.y);
      doc.moveDown(0.5);
      
      if (doc.y > 720) {
        doc.addPage();
        this.drawHeader(doc, 'sales');
      }
    });
  }

  drawSummaryBox(doc, x, y, width, height, config) {
    // Box background
    doc.roundedRect(x, y, width, height, 8).fill('#F8F9FA');
    doc.roundedRect(x, y, width, height, 8).stroke(config.color);
    
    // Title
    doc.fontSize(10).font('Helvetica').fillColor('#666666');
    doc.text(config.title, x + 10, y + 10, { width: width - 20 });
    
    // Value
    doc.fontSize(18).font('Helvetica-Bold').fillColor(config.color);
    doc.text(config.value, x + 10, y + 30, { width: width - 20 });
    
    // Subtitle
    doc.fontSize(9).font('Helvetica').fillColor('#999999');
    doc.text(config.subtitle, x + 10, y + 52, { width: width - 20 });
  }

  drawTableHeader(doc, y, headers) {
    const colors = {
      header: '#007AFF',
      headerText: '#FFFFFF',
      border: '#E0E0E0',
    };
    
    // Header background
    doc.rect(40, y, 530, 25).fill(colors.header);
    
    // Header text
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.headerText);
    const positions = [50, 80, 370, 460];
    headers.forEach((header, i) => {
      doc.text(header, positions[i] || 50, y + 7);
    });
    
    // Bottom border
    doc.moveTo(40, y + 25).lineTo(570, y + 25).stroke(colors.border);
    
    doc.y = y + 30;
  }

  drawStaffReport(doc, data) {
    // Summary totals
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#007AFF').text('📊 RINGKASAN KINERJA', { underline: true });
    doc.moveDown(0.5);
    
    const summaryData = [
      { icon: '👨‍🍳', label: 'Total Pesanan Disiapkan Dapur', value: data.totals.kitchenOrders, color: '#FF9500' },
      { icon: '🛵', label: 'Total Pengiriman Selesai', value: data.totals.deliveries, color: '#34C759' },
      { icon: '💳', label: 'Total Pembayaran Diverifikasi', value: data.totals.paymentsVerified, color: '#007AFF' },
    ];
    
    summaryData.forEach(item => {
      doc.fontSize(11).font('Helvetica').fillColor('#333');
      doc.text(`${item.icon} ${item.label}:`, 50, doc.y);
      doc.font('Helvetica-Bold').fillColor(item.color).text(`${item.value}`, 400, doc.y - 12);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);

    // Kitchen Performance
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#FF9500').text('👨‍🍳 KINERJA STAFF DAPUR', { underline: true });
    doc.moveDown(0.5);
    
    if (data.kitchen.length > 0) {
      const tableTop = doc.y;
      this.drawTableHeader(doc, tableTop, ['No', 'Nama Staff', 'Telepon', 'Pesanan Disiapkan']);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      data.kitchen.forEach((staff, index) => {
        doc.text(`${index + 1}`, 50, doc.y);
        doc.text(staff.name, 80, doc.y);
        doc.text(staff.phone, 250, doc.y);
        doc.text(`${staff.ordersPrepared} order`, 400, doc.y);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(10).font('Helvetica').fillColor('#999').text('Tidak ada staff dapur', 50, doc.y);
    }
    doc.moveDown(1);

    // Driver Performance
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#34C759').text('🛵 KINERJA STAFF PENGIRIMAN', { underline: true });
    doc.moveDown(0.5);
    
    if (data.driver.length > 0) {
      const tableTop = doc.y;
      this.drawTableHeader(doc, tableTop, ['No', 'Nama Driver', 'Telepon', 'Pengiriman Selesai']);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      data.driver.forEach((staff, index) => {
        doc.text(`${index + 1}`, 50, doc.y);
        doc.text(staff.name, 80, doc.y);
        doc.text(staff.phone, 250, doc.y);
        doc.text(`${staff.deliveriesCompleted} delivery`, 400, doc.y);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(10).font('Helvetica').fillColor('#999').text('Tidak ada driver', 50, doc.y);
    }
    doc.moveDown(1);

    // Admin Performance
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#007AFF').text('💳 KINERJA STAFF ADMIN', { underline: true });
    doc.moveDown(0.5);
    
    if (data.admin.length > 0) {
      const tableTop = doc.y;
      this.drawTableHeader(doc, tableTop, ['No', 'Nama Admin', 'Telepon', 'Pembayaran Diverifikasi']);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      data.admin.forEach((staff, index) => {
        doc.text(`${index + 1}`, 50, doc.y);
        doc.text(staff.name, 80, doc.y);
        doc.text(staff.phone, 250, doc.y);
        doc.text(`${staff.paymentsVerified} pembayaran`, 400, doc.y);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(10).font('Helvetica').fillColor('#999').text('Tidak ada admin', 50, doc.y);
    }

    // Best Performers
    doc.addPage();
    this.drawHeader(doc, 'staff');
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#FF9500').text('🏆 STAFF TERBAIK PERIODE INI', { underline: true });
    doc.moveDown(1);
    
    const bestKitchen = data.kitchen.reduce((prev, current) => 
      (current.ordersPrepared > prev.ordersPrepared) ? current : prev, { ordersPrepared: 0, name: '-' });
    const bestDriver = data.driver.reduce((prev, current) => 
      (current.deliveriesCompleted > prev.deliveriesCompleted) ? current : prev, { deliveriesCompleted: 0, name: '-' });
    const bestAdmin = data.admin.reduce((prev, current) => 
      (current.paymentsVerified > prev.paymentsVerified) ? current : prev, { paymentsVerified: 0, name: '-' });
    
    // Best Kitchen
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF9500').text('👨‍🍳 Kitchen Terbaik', 50, doc.y);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Nama: ${bestKitchen.name}`, 70, doc.y + 15);
    doc.text(`Pesanan Disiapkan: ${bestKitchen.ordersPrepared} order`, 70, doc.y + 30);
    doc.moveDown(2);
    
    // Best Driver
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#34C759').text('🛵 Driver Terbaik', 50, doc.y);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Nama: ${bestDriver.name}`, 70, doc.y + 15);
    doc.text(`Pengiriman Selesai: ${bestDriver.deliveriesCompleted} delivery`, 70, doc.y + 30);
    doc.moveDown(2);
    
    // Best Admin
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#007AFF').text('💳 Admin Terbaik', 50, doc.y);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Nama: ${bestAdmin.name}`, 70, doc.y + 15);
    doc.text(`Pembayaran Diverifikasi: ${bestAdmin.paymentsVerified} pembayaran`, 70, doc.y + 30);
  }

  drawCombinedReport(doc, data) {
    // Sales section
    this.drawSalesReport(doc, data.sales);
    
    // Staff section on new page
    doc.addPage();
    this.drawHeader(doc, 'staff');
    this.drawStaffReport(doc, data.staff);
  }

  drawFooter(doc, currentPage, totalPages) {
    doc.save();
    
    const pageHeight = doc.page.height;
    
    // Footer background
    doc.rect(0, pageHeight - 40, doc.page.width, 40).fill('#F8F9FA');
    
    // Footer text
    doc.fontSize(8).font('Helvetica').fillColor('#999999');
    doc.text('© 2026 Bakso Premium Ordering System', 40, pageHeight - 30, { width: 530, align: 'center' });
    doc.text(`Halaman ${currentPage} dari ${totalPages}`, 40, pageHeight - 18, { width: 530, align: 'center' });
    
    doc.restore();
  }

  // ==================== PUBLIC METHODS ====================

  async generateDailyReport(date = new Date()) {
    const start = moment(date).startOf('day').toDate();
    const end = moment(date).endOf('day').toDate();
    
    const salesData = await this.getSalesData('daily', start, end);
    
    const report = await this.generatePDF(salesData, 'sales');
    return {
      ...report,
      type: 'daily',
      data: { sales: salesData },
    };
  }

  async generateWeeklyReport(weekStart = new Date()) {
    const start = moment(weekStart).startOf('week').toDate();
    const end = moment(weekStart).endOf('week').toDate();
    
    const salesData = await this.getSalesData('weekly', start, end);
    
    const report = await this.generatePDF(salesData, 'sales');
    return {
      ...report,
      type: 'weekly',
      data: { sales: salesData },
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
      data: { sales: salesData, staff: staffData },
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
