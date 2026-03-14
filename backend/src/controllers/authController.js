const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register/Login customer (phone-based, no password)
exports.customerAuth = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Validate phone format (Indonesian phone)
    if (!/^08[0-9]{8,}$/.test(phone)) {
      return res.status(400).json({ 
        error: 'Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx' 
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { phone } });
    let isExistingUser = false;
    let hasPIN = false;

    if (user) {
      // Check if user has a password (staff account)
      if (user.password && user.role !== 'customer') {
        return res.status(400).json({ 
          error: 'Nomor ini sudah terdaftar sebagai Staff. Silakan login sebagai Staff.',
          requires_staff_login: true,
          role: user.role
        });
      }

      // User exists - DON'T update name, just return info
      isExistingUser = true;
      hasPIN = user.is_pin_set;
      
      // Return special response for existing users
      return res.status(409).json({
        success: false,
        is_existing_user: true,
        has_pin: hasPIN,
        requires_pin_login: true,
        message: hasPIN 
          ? 'Nomor ini sudah terdaftar. Silakan login dengan PIN untuk keamanan akun.'
          : 'Nomor ini sudah terdaftar. Silakan lanjutkan untuk mengatur PIN.',
        user: {
          phone: user.phone,
          is_pin_set: user.is_pin_set,
        }
      });
    }

    // New user - create account
    user = await User.create({ name, phone, role: 'customer' });

    const token = generateToken(user);

    res.json({
      success: true,
      is_existing_user: false,
      has_pin: false,
      message: 'Akun baru berhasil dibuat!',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        completed_orders: user.completed_orders,
        loyalty_points: user.loyalty_points,
        is_pin_set: user.is_pin_set,
      },
    });
  } catch (error) {
    console.error('Customer auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Login staff (with password OR PIN)
exports.staffLogin = async (req, res) => {
  try {
    const { phone, password, pin } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Nomor HP harus diisi' });
    }

    // Validate input - either password OR pin must be provided
    if (!password && !pin) {
      return res.status(400).json({ 
        error: 'Password atau PIN harus diisi' 
      });
    }

    const user = await User.findOne({
      where: {
        phone,
        role: { [Op.in]: ['admin', 'kitchen', 'driver'] },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan atau bukan staff' });
    }

    // PIN login
    if (pin) {
      // Check if PIN is set
      if (!user.is_pin_set) {
        return res.status(400).json({
          error: 'PIN belum diatur. Silakan atur PIN terlebih dahulu.',
          requires_pin_setup: true
        });
      }

      // Check PIN expiry (1 month policy)
      if (user.pin_reset_expires && user.pin_reset_expires < new Date()) {
        // Clear expired PIN
        user.pin_hash = null;
        user.is_pin_set = false;
        user.pin_reset_token = null;
        user.pin_reset_expires = null;
        user.pin_reset_attempts = 0;
        await user.save();

        return res.status(403).json({
          error: 'PIN sudah kadaluarsa (reset 1 bulan). Silakan atur PIN baru.',
          pin_expired: true
        });
      }

      // Verify PIN
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(pin, user.pin_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'PIN salah' });
      }
    } 
    // Password login
    else if (password) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Password salah' });
      }
    }

    user.last_active = new Date();
    await user.save();

    const token = generateToken(user);

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
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_active', 'DESC']],
    });

    res.json({ success: true, ...users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    
    if (password) {
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, phone, email, password, role, status } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    // Create user
    const user = await User.create({
      name,
      phone,
      email: email || null,
      password: hashedPassword,
      role: role || 'customer',
      status: status || 'active',
    });

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
