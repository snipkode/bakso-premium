/**
 * Fix Admin Password Script
 * Updates admin password hash to match bcryptjs comparison
 */
require('dotenv').config();
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const fixAdminPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    // Generate new hash
    const newHash = await bcrypt.hash('admin123', 10);
    
    // Update password
    admin.password = newHash;
    await admin.save();

    console.log('✅ Admin password updated');
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Password: admin123`);
    
    // Verify
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log(`   Verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
};

fixAdminPassword();
