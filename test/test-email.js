require('dotenv').config();
const { sendPINResetEmail } = require('./src/utils/emailService');

// Test email
const testEmail = async () => {
  try {
    console.log('📧 Sending test email...');
    
    const result = await sendPINResetEmail(
      'test@example.com', 
      'test-reset-token-12345'
    );
    
    console.log('✅ Email sent successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log('\n⚠️ Make sure to set these in .env:');
    console.log('  EMAIL_SERVICE=gmail');
    console.log('  EMAIL_USER=your-email@gmail.com');
    console.log('  EMAIL_PASSWORD=your-app-password');
    console.log('  EMAIL_FROM=Bakso Premium <your-email@gmail.com>');
    process.exit(1);
  }
};

testEmail();
