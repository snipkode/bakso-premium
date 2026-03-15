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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@baksopremium.com';
    const companyName = 'Bakso Premium';
    const currentYear = new Date().getFullYear();

    const mailOptions = {
      from: `"${companyName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Reset PIN Akun Bakso Premium Anda',
      html: `
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; background-color: #F3F4F6; }
              .email-container { max-width: 600px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { background: linear-gradient(135deg, #F97316 0%, #F59E0B 100%); padding: 40px 30px; text-align: center; }
              .logo { font-size: 48px; margin-bottom: 10px; }
              .header h1 { color: #FFFFFF; font-size: 28px; font-weight: 700; margin-bottom: 5px; }
              .header p { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
              .content { padding: 40px 30px; background: #FFFFFF; }
              .greeting { font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 15px; }
              .message { font-size: 15px; color: #4B5563; margin-bottom: 25px; line-height: 1.8; }
              .button-container { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #F97316 0%, #F59E0B 100%); color: #FFFFFF !important; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3); transition: transform 0.2s; }
              .button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4); }
              .link-text { text-align: center; font-size: 13px; color: #6B7280; margin-top: 15px; }
              .link-text a { color: #F97316; text-decoration: none; word-break: break-all; }
              .warning-box { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 20px; margin: 25px 0; border-radius: 8px; }
              .warning-box h3 { color: #92400E; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
              .warning-box ul { color: #78350F; font-size: 13px; margin-left: 20px; }
              .warning-box li { margin-bottom: 5px; }
              .info-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 25px 0; border-radius: 8px; }
              .info-box p { color: #1E40AF; font-size: 13px; margin-bottom: 5px; }
              .signature { margin-top: 30px; font-size: 15px; color: #4B5563; }
              .footer { background: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB; }
              .footer-text { font-size: 12px; color: #6B7280; margin-bottom: 10px; }
              .footer-links { margin-top: 15px; }
              .footer-links a { color: #F97316; text-decoration: none; font-size: 12px; margin: 0 10px; }
              .social-icons { margin-top: 20px; }
              .social-icons span { display: inline-block; margin: 0 8px; font-size: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <!-- Header -->
              <div class="header">
                <div class="logo">🍜</div>
                <h1>Bakso Premium</h1>
                <p>Reset PIN Akun Anda</p>
              </div>

              <!-- Content -->
              <div class="content">
                <p class="greeting">Halo Pelanggan Setia,</p>

                <p class="message">
                  Anda menerima email ini karena kami menerima permintaan untuk mereset PIN akun Bakso Premium Anda. 
                  Jika Anda yang meminta reset ini, silakan klik tombol di bawah untuk membuat PIN baru.
                </p>

                <!-- CTA Button -->
                <div class="button-container">
                  <a href="${resetLink}" class="button" target="_blank" rel="noopener noreferrer">
                    🔐 Reset PIN Saya
                  </a>
                  <p class="link-text">
                    Atau copy link ini ke browser:<br>
                    <a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a>
                  </p>
                </div>

                <!-- Warning Box -->
                <div class="warning-box">
                  <h3>⚠️ Penting untuk Keamanan Anda</h3>
                  <ul>
                    <li>Link reset PIN ini hanya berlaku selama <strong>1 jam</strong></li>
                    <li>Jangan pernah membagikan PIN Anda kepada siapa pun</li>
                    <li>Staff Bakso Premium tidak akan pernah meminta PIN Anda</li>
                    <li>Pastikan Anda membuat PIN yang mudah diingat tapi sulit ditebak</li>
                  </ul>
                </div>

                <!-- Info Box -->
                <div class="info-box">
                  <p><strong>📧 Email dikirim ke:</strong> ${email}</p>
                  <p><strong>🕐 Waktu:</strong> ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  <p><strong>🔒 Jika Anda tidak meminta reset ini:</strong> Abaikan email ini. PIN Anda tidak akan berubah.</p>
                </div>

                <p class="signature">
                  Terima kasih telah menjadi bagian dari keluarga Bakso Premium!<br>
                  <strong>Tim Bakso Premium</strong>
                </p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p class="footer-text">
                  © ${currentYear} ${companyName}. Hak cipta dilindungi undang-undang.
                </p>
                <p class="footer-text">
                  Butuh bantuan? Hubungi kami di <a href="mailto:${supportEmail}" style="color: #F97316; text-decoration: none;">${supportEmail}</a>
                </p>
                <div class="footer-links">
                  <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer">Website</a> •
                  <a href="${frontendUrl}/menu" target="_blank" rel="noopener noreferrer">Menu</a> •
                  <a href="${frontendUrl}/profile" target="_blank" rel="noopener noreferrer">Akun Saya</a>
                </div>
                <div class="social-icons">
                  <span>🍜</span>
                  <span>🥢</span>
                  <span>🍲</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Reset PIN Akun Bakso Premium Anda

Halo,

Anda menerima email ini karena kami menerima permintaan untuk mereset PIN akun Bakso Premium Anda.

Link reset PIN: ${resetLink}

Link ini hanya berlaku selama 1 jam.

Jika Anda tidak meminta reset ini, abaikan email ini. PIN Anda tidak akan berubah.

Terima kasih,
Tim Bakso Premium

---
Butuh bantuan? ${supportEmail}
© ${currentYear} ${companyName}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PIN reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send PIN reset email:', error);
    throw error;
  }
};
