/**
 * Database Sync Script
 * Sync Sequelize models with database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = require('../src/config/database');
const { User, Category, Product, Order, OrderItem, Payment, Voucher, Review, LoyaltyPoint, QueueSetting, PushSubscription } = require('../src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Sync all models (creates/updates tables)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully!');
    console.log('');
    console.log('Tables synced:');
    console.log('  - users');
    console.log('  - categories');
    console.log('  - products (with stock, min_stock)');
    console.log('  - orders');
    console.log('  - order_items');
    console.log('  - payments');
    console.log('  - vouchers');
    console.log('  - reviews');
    console.log('  - loyalty_points');
    console.log('  - queue_settings');
    console.log('  - push_subscriptions');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

syncDatabase();
