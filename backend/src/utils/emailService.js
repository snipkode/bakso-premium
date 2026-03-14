const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send PIN reset email
exports.sendPINResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-pin?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"Bakso Premium" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🍜 Reset PIN Bakso Premium',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F97316, #F59E0B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #F97316, #F59E0B); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🍜 Bakso Premium</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset PIN Akun Anda</p>
              </div>
              
              <div class="content">
                <p>Halo,</p>
                
                <p>Anda meminta untuk mereset PIN akun Bakso Premium Anda. Klik tombol di bawah untuk membuat PIN baru:</p>
                
                <p style="text-align: center;">
                  <a href="${resetLink}" class="button">Reset PIN Sekarang</a>
                </p>
                
                <p>Atau copy link berikut:</p>
                <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-size: 12px;">${resetLink}</p>
                
                <div class="warning">
                  <strong>⚠️ Penting:</strong> Link ini hanya berlaku selama 1 jam. Setelah itu, Anda perlu meminta reset PIN baru.
                </div>
                
                <p>Jika Anda tidak meminta reset PIN ini, abaikan email ini. PIN Anda tidak akan berubah.</p>
                
                <p>Terima kasih,<br><strong>Tim Bakso Premium</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Bakso Premium. All rights reserved.</p>
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Bakso Premium - Reset PIN
        
        Halo,
        
        Anda meminta untuk mereset PIN akun Bakso Premium Anda.
        
        Link reset PIN:
        ${resetLink}
        
        Link ini hanya berlaku selama 1 jam.
        
        Jika Anda tidak meminta reset PIN ini, abaikan email ini.
        
        Terima kasih,
        Tim Bakso Premium
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 PIN reset email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending PIN reset email:', error);
    throw new Error('Failed to send reset email');
  }
};
