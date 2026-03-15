/**
 * Migration: Add 'out_for_pickup' status to orders table
 * 
 * This adds a new status for takeaway orders where customer is picking up
 * 
 * Usage: 
 *   node add-out-for-pickup-status.js up
 *   node add-out-for-pickup-status.js down
 */

const { sequelize } = require('../src/config/database');

const NEW_STATUS = 'out_for_pickup';

async function up() {
  try {
    console.log('🔄 Adding "out_for_pickup" status to orders table...');
    
    // Get current ENUM values
    const [result] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'order' 
      AND COLUMN_NAME = 'status'
    `);
    
    if (result.length === 0) {
      console.error('❌ Could not find status column');
      return;
    }
    
    const columnType = result[0].COLUMN_TYPE;
    console.log('📋 Current ENUM:', columnType);
    
    // Extract existing values
    const matches = columnType.match(/'([^']+)'/g);
    if (!matches) {
      console.error('❌ Could not parse ENUM values');
      return;
    }
    
    const existingValues = matches.map(m => m.replace(/'/g, ''));
    console.log('📋 Existing values:', existingValues);
    
    // Check if already exists
    if (existingValues.includes(NEW_STATUS)) {
      console.log('✅ "out_for_pickup" already exists');
      return;
    }
    
    // Add new value after 'ready'
    const readyIndex = existingValues.indexOf('ready');
    if (readyIndex === -1) {
      console.error('❌ Could not find "ready" status');
      return;
    }
    
    existingValues.splice(readyIndex + 1, 0, NEW_STATUS);
    console.log('📋 New values:', existingValues);
    
    // Create new ENUM type
    const newEnum = existingValues.map(v => `'${v}'`).join(', ');
    
    // Modify column with new ENUM
    await sequelize.query(`
      ALTER TABLE \`order\` 
      MODIFY COLUMN \`status\` ENUM(${newEnum}) 
      DEFAULT 'pending_payment'
    `);
    
    console.log('✅ Successfully added "out_for_pickup" status');
    console.log('📊 New status order:', existingValues.join(' → '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down() {
  try {
    console.log('🔄 Removing "out_for_pickup" status...');
    
    // First, update any orders with out_for_pickup to ready
    await sequelize.query(`
      UPDATE \`order\` 
      SET \`status\` = 'ready' 
      WHERE \`status\` = 'out_for_pickup'
    `);
    
    console.log('📋 Updated out_for_pickup orders to ready');
    
    // Get current ENUM values
    const [result] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'order' 
      AND COLUMN_NAME = 'status'
    `);
    
    if (result.length === 0) {
      console.error('❌ Could not find status column');
      return;
    }
    
    const columnType = result[0].COLUMN_TYPE;
    const matches = columnType.match(/'([^']+)'/g);
    
    if (!matches) {
      console.error('❌ Could not parse ENUM values');
      return;
    }
    
    const existingValues = matches.map(m => m.replace(/'/g, ''));
    const filteredValues = existingValues.filter(v => v !== NEW_STATUS);
    
    if (filteredValues.length === existingValues.length) {
      console.log('✅ "out_for_pickup" does not exist');
      return;
    }
    
    // Create new ENUM type without out_for_pickup
    const newEnum = filteredValues.map(v => `'${v}'`).join(', ');
    
    await sequelize.query(`
      ALTER TABLE \`order\` 
      MODIFY COLUMN \`status\` ENUM(${newEnum}) 
      DEFAULT 'pending_payment'
    `);
    
    console.log('✅ Successfully removed "out_for_pickup" status');
    console.log('📊 Status order:', filteredValues.join(' → '));
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

// Run migration
const action = process.argv[2];

if (action === 'up') {
  up()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
} else if (action === 'down') {
  down()
    .then(() => {
      console.log('✅ Rollback completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    });
} else {
  console.log('Usage: node add-out-for-pickup-status.js [up|down]');
  process.exit(1);
}
