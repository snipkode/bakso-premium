/**
 * Reset Passwords to Default
 * Bakso Premium - Reset All User Passwords
 * 
 * Resets:
 * - Admin: admin123
 * - Kitchen: kitchen123
 * - Driver: driver123
 * - Customer: customer123
 * - PIN: 123456
 */

require('dotenv').config();
const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function resetPasswords() {
  try {
    log('\n🔄 Resetting Passwords to Default...', 'cyan');
    log('═'.repeat(60), 'cyan');

    // Sync database
    await sequelize.sync();
    log('✅ Database synced', 'green');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const kitchenHash = await bcrypt.hash('kitchen123', 10);
    const driverHash = await bcrypt.hash('driver123', 10);
    const customerHash = await bcrypt.hash('customer123', 10);
    const pinHash = await bcrypt.hash('123456', 10);

    // Reset Admin
    await User.update(
      { password: adminHash },
      { where: { role: 'admin' } }
    );
    log('✅ Admin password reset to: admin123', 'green');

    // Reset Kitchen
    await User.update(
      { password: kitchenHash },
      { where: { role: 'kitchen' } }
    );
    log('✅ Kitchen password reset to: kitchen123', 'green');

    // Reset Driver
    await User.update(
      { password: driverHash },
      { where: { role: 'driver' } }
    );
    log('✅ Driver password reset to: driver123', 'green');

    // Reset Customers
    await User.update(
      { 
        password: customerHash,
        is_pin_set: true,
        pin_hash: pinHash,
      },
      { where: { role: 'customer' } }
    );
    log('✅ Customer passwords reset to: customer123', 'green');
    log('✅ Customer PINs reset to: 123456', 'green');

    log('\n═'.repeat(60), 'cyan');
    log('🎉 Password Reset Complete!', 'green');
    log('═'.repeat(60), 'cyan');

    log('\n📋 Default Credentials:', 'yellow');
    log('\n   STAFF:', 'yellow');
    log('   - Admin:   081234567890 / admin123', 'yellow');
    log('   - Kitchen: 081234567891 / kitchen123', 'yellow');
    log('   - Driver:  081234567892 / driver123', 'yellow');
    
    log('\n   CUSTOMERS (PIN: 123456):', 'yellow');
    log('   - 081234567893 / customer123', 'yellow');
    log('   - 081234567894 / customer123', 'yellow');
    log('   - 081234567895 / customer123', 'yellow');
    log('   - 081234567896 / customer123', 'yellow');
    log('   - 081234567897 / customer123', 'yellow');

    log('\n');
    process.exit(0);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

resetPasswords();
