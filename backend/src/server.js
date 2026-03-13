require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initializeSocket } = require('./config/socket');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const pushRoutes = require('./routes/pushRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/queue', queueRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Database initialization and server start
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('✅ Database synced');

    // Create default admin if not exists
    const { User } = require('./models');
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        phone: '081234567890',
        password: 'admin123',
        role: 'admin',
        status: 'active',
      });
      console.log('✅ Default admin created (phone: 081234567890, password: admin123)');
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🍜 BAKSO ORDERING SYSTEM - Backend Server              ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   API Base: http://localhost:${PORT}/api                  ║
║   WebSocket: ws://localhost:${PORT}                       ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   Database: SQLite                                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
