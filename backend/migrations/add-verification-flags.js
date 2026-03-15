/**
 * Migration: Add Email & Phone Verification Flags
 * 
 * Usage:
 *   node backend/migrations/add-verification-flags.js up
 *   node backend/migrations/add-verification-flags.js down
 */

const sequelize = require('../src/config/database');

async function up() {
  console.log('🔄 Adding verification columns to user table...');
  
  try {
    // Add columns (safe - won't affect existing data)
    await sequelize.query(`
      ALTER TABLE \`user\` 
      ADD COLUMN IF NOT EXISTS \`email_verified\` TINYINT(1) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS \`email_verified_at\` DATETIME NULL,
      ADD COLUMN IF NOT EXISTS \`phone_verified\` TINYINT(1) DEFAULT 0
    `);
    
    console.log('✅ Columns added successfully');
    
    // Set existing users as verified (backward compatible)
    console.log('📊 Marking existing users as verified...');
    
    const [users] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`user\` 
      WHERE email IS NOT NULL AND email != ''
    `);
    
    await sequelize.query(`
      UPDATE \`user\` 
      SET email_verified = 1, email_verified_at = NOW()
      WHERE email IS NOT NULL AND email != ''
    `);
    
    await sequelize.query(`
      UPDATE \`user\` 
      SET phone_verified = 1
      WHERE phone IS NOT NULL AND phone != ''
    `);
    
    console.log(`✅ Existing users marked as verified (${users[0].count} users)`);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down() {
  console.log('🔄 Rolling back migration...');
  
  try {
    await sequelize.query(`
      ALTER TABLE \`user\`
      DROP COLUMN IF EXISTS \`email_verified\`,
      DROP COLUMN IF EXISTS \`email_verified_at\`,
      DROP COLUMN IF EXISTS \`phone_verified\`
    `);
    
    console.log('✅ Rollback completed!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const action = process.argv[2] || 'up';
  
  if (action === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (action === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    console.log('Usage: node add-verification-flags.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
