/**
 * Staff Two-Factor Authentication Controller
 * Handles PIN setup for staff members during 2FA enrollment
 */

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { resetPINAttempts } = require('../middleware/twoFactorAuth');

/**
 * Set PIN for staff during 2FA setup
 * Uses setup token (limited scope) for authentication
 */
exports.setupPIN = async (req, res) => {
  try {
    const { pin } = req.body;
    
    // Get user from setup token (attached by validateSetupToken middleware)
    const setupUser = req.setupUser;
    
    if (!setupUser || !setupUser.id) {
      return res.status(401).json({ 
        error: 'Invalid or expired setup token' 
      });
    }

    // Validate PIN (6 digits)
    if (!pin || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        error: 'PIN harus 6 digit angka'
      });
    }

    const user = await User.findByPk(setupUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify this is a staff member
    if (!['admin', 'kitchen', 'driver'].includes(user.role)) {
      return res.status(400).json({ 
        error: '2FA PIN setup hanya untuk staff (admin, kitchen, driver)' 
      });
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10);
    user.pin_hash = pinHash;
    user.is_pin_set = true;

    // Set PIN expiry (1 month for staff)
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    user.pin_reset_expires = oneMonthFromNow;
    
    console.log(`📅 Staff PIN set for ${user.role} (${user.phone}). Expires: ${user.pin_reset_expires}`);

    await user.save();

    // Reset failed attempts
    resetPINAttempts(user.phone);

    res.json({
      success: true,
      message: 'PIN berhasil diatur untuk two-factor authentication',
      pin_expires: user.pin_reset_expires,
      is_staff: true,
      expiry_months: 1,
    });
  } catch (error) {
    console.error('Staff 2FA PIN setup error:', error);
    res.status(500).json({ error: 'Gagal mengatur PIN' });
  }
};

/**
 * Complete 2FA setup and get full token
 * After PIN is set, exchange setup token for full token
 */
exports.complete2FASetup = async (req, res) => {
  try {
    const setupUser = req.setupUser;
    
    if (!setupUser || !setupUser.id) {
      return res.status(401).json({ 
        error: 'Invalid or expired setup token' 
      });
    }

    const user = await User.findByPk(setupUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify PIN is now set
    if (!user.is_pin_set) {
      return res.status(400).json({ 
        error: 'PIN belum diatur. Silakan atur PIN terlebih dahulu.' 
      });
    }

    // Generate full access token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
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
    console.error('Complete 2FA setup error:', error);
    res.status(500).json({ error: 'Gagal menyelesaikan setup 2FA' });
  }
};
