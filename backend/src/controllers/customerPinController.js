const { User } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPINResetEmail } = require('../utils/emailService');

// Set PIN for customer
exports.setPIN = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    // Validate PIN (6 digits)
    if (!pin || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        error: 'PIN harus 6 digit angka'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({ error: 'Hanya customer yang bisa set PIN' });
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10);
    user.pin_hash = pinHash;
    user.is_pin_set = true;
    await user.save();

    res.json({
      success: true,
      message: 'PIN berhasil diatur'
    });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
};

// Verify PIN for login
exports.verifyPIN = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    // Validate input
    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Nomor HP dan PIN harus diisi'
      });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({ error: 'Akun bukan customer' });
    }

    // SPECIAL CASE: User exists but PIN not set yet
    // Don't generate token, just return user status for frontend redirect
    if (!user.is_pin_set) {
      return res.status(403).json({
        success: false,
        requires_pin_setup: true,
        message: 'Akun ini belum mengatur PIN. Silakan atur PIN terlebih dahulu.',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          is_pin_set: false,
        }
      });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, user.pin_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'PIN salah' });
    }

    // Generate token (same as auth)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'bakso-premium-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        is_pin_set: user.is_pin_set,
      },
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
};

// Request PIN reset via email (PUBLIC - requires phone + email for validation)
exports.requestPINReset = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone || !email) {
      return res.status(400).json({ 
        error: 'Nomor HP dan email harus diisi' 
      });
    }

    // Find user by phone (must be customer)
    const user = await User.findOne({ 
      where: { 
        phone,
        role: 'customer'
      } 
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'Jika data cocok, link reset PIN akan dikirim ke email Anda'
      });
    }

    // Verify email matches
    if (user.email !== email) {
      return res.status(400).json({ 
        error: 'Email tidak cocok dengan nomor HP ini' 
      });
    }

    // Rate limiting: Max 5 requests per 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    if (user.last_reset_request && user.last_reset_request > twentyFourHoursAgo) {
      if (user.pin_reset_attempts >= 5) {
        return res.status(429).json({ 
          error: 'Terlalu banyak permintaan reset. Silakan coba lagi besok atau hubungi support.',
          retry_after: '24 hours'
        });
      }
    } else {
      // Reset attempts after 24 hours
      user.pin_reset_attempts = 0;
    }

    // Increment attempt counter
    user.pin_reset_attempts += 1;
    user.last_reset_request = now;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(now.getTime() + 3600000); // 1 hour

    user.pin_reset_token = resetTokenHash;
    user.pin_reset_expires = resetExpires;
    await user.save();

    // Send reset email
    try {
      await sendPINResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Continue anyway - token is still valid
    }

    // Generate reset link for frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-pin?token=${resetToken}&email=${encodeURIComponent(email)}`;
    console.log('📧 PIN Reset Link:', resetLink);
    console.log(`📊 Reset attempts: ${user.pin_reset_attempts}/5 in 24h`);

    res.json({
      success: true,
      message: 'Jika data cocok, link reset PIN akan dikirim ke email Anda',
      // Include reset link for development/testing only
      reset_link: resetLink,
      reset_token: resetToken,
      attempts_remaining: 5 - user.pin_reset_attempts
    });
  } catch (error) {
    console.error('Request PIN reset error:', error);
    res.status(500).json({ error: 'Failed to request PIN reset' });
  }
};

// Reset PIN with token
exports.resetPIN = async (req, res) => {
  try {
    const { token, email, new_pin } = req.body;

    if (!token || !email || !new_pin) {
      return res.status(400).json({
        error: 'Token, email, dan PIN baru harus diisi'
      });
    }

    if (!/^\d{6}$/.test(new_pin)) {
      return res.status(400).json({ error: 'PIN baru harus 6 digit angka' });
    }

    // Hash the token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        email,
        pin_reset_token: resetTokenHash,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token tidak valid' });
    }

    // Check if token is expired
    if (user.pin_reset_expires < new Date()) {
      user.pin_reset_token = null;
      user.pin_reset_expires = null;
      await user.save();
      return res.status(400).json({ error: 'Token sudah kadaluarsa' });
    }

    // Set new PIN
    const pinHash = await bcrypt.hash(new_pin, 10);
    user.pin_hash = pinHash;
    user.is_pin_set = true;
    user.pin_reset_token = null;
    user.pin_reset_expires = null;
    user.pin_reset_attempts = 0; // Reset attempts after successful reset
    await user.save();

    res.json({ 
      success: true, 
      message: 'PIN berhasil direset' 
    });
  } catch (error) {
    console.error('Reset PIN error:', error);
    res.status(500).json({ error: 'Failed to reset PIN' });
  }
};

// Check if user has PIN set
exports.checkPINStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      is_pin_set: user.is_pin_set,
    });
  } catch (error) {
    console.error('Check PIN status error:', error);
    res.status(500).json({ error: 'Failed to check PIN status' });
  }
};
