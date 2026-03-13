/**
 * Authentication Fix Script
 * 
 * This script fixes the "invalid credential" error by:
 * 1. Verifying JWT_SECRET configuration
 * 2. Resetting staff passwords with proper bcrypt hashing
 * 3. Creating default admin if not exists
 * 
 * Usage: node src/utils/fix-auth.js
 */

require('dotenv').config();
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const fixAuthentication = async () => {
  try {
    console.log('🔐 Fixing authentication issues...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check JWT_SECRET
    console.log('📝 Checking JWT_SECRET configuration...');
    if (!process.env.JWT_SECRET) {
      console.log('⚠️  WARNING: JWT_SECRET is not set in .env file');
      console.log('   Please add JWT_SECRET to your .env file\n');
    } else {
      console.log(`✅ JWT_SECRET is configured (length: ${process.env.JWT_SECRET.length} chars)\n`);
    }

    // Reset staff passwords
    console.log('🔄 Resetting staff passwords...\n');

    // Admin
    const admin = await User.findOne({ where: { phone: '081234567890' } });
    if (admin) {
      admin.password = await bcrypt.hash('admin123', 10);
      admin.role = 'admin';
      admin.status = 'active';
      await admin.save();
      console.log('✅ Admin password reset: 081234567890 / admin123');
    } else {
      await User.create({
        name: 'Admin',
        phone: '081234567890',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active',
      });
      console.log('✅ Admin created: 081234567890 / admin123');
    }

    // Kitchen
    const kitchen = await User.findOne({ where: { phone: '081234567891' } });
    if (kitchen) {
      kitchen.password = await bcrypt.hash('kitchen123', 10);
      kitchen.role = 'kitchen';
      kitchen.status = 'active';
      await kitchen.save();
      console.log('✅ Kitchen password reset: 081234567891 / kitchen123');
    } else {
      await User.create({
        name: 'Kitchen Staff',
        phone: '081234567891',
        password: await bcrypt.hash('kitchen123', 10),
        role: 'kitchen',
        status: 'active',
      });
      console.log('✅ Kitchen staff created: 081234567891 / kitchen123');
    }

    // Driver
    const driver = await User.findOne({ where: { phone: '081234567892' } });
    if (driver) {
      driver.password = await bcrypt.hash('driver123', 10);
      driver.role = 'driver';
      driver.status = 'active';
      await driver.save();
      console.log('✅ Driver password reset: 081234567892 / driver123');
    } else {
      await User.create({
        name: 'Driver',
        phone: '081234567892',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
      });
      console.log('✅ Driver created: 081234567892 / driver123');
    }

    console.log('\n🎉 Authentication fix completed!\n');
    console.log('📋 Login credentials:');
    console.log('   ┌─────────────────────────────────────┐');
    console.log('   │ Admin:   081234567890 / admin123   │');
    console.log('   │ Kitchen: 081234567891 / kitchen123 │');
    console.log('   │ Driver:  081234567892 / driver123  │');
    console.log('   └─────────────────────────────────────┘');
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure backend is running on the correct port');
    console.log('   2. Check that FRONTEND_URL in .env matches your frontend');
    console.log('   3. Clear browser cache and localStorage if issues persist');
    console.log('   4. Check browser console for API errors');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

fixAuthentication();
