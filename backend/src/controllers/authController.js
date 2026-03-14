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

    // Find or create user
    let user = await User.findOne({ where: { phone } });

    if (user) {
      // Update name if changed
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
      user.last_active = new Date();
      await user.save();
    } else {
      user = await User.create({ name, phone, role: 'customer' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        completed_orders: user.completed_orders,
        loyalty_points: user.loyalty_points,
      },
    });
  } catch (error) {
    console.error('Customer auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Login staff (with password)
exports.staffLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = await User.findOne({
      where: {
        phone,
        role: { [Op.in]: ['admin', 'kitchen', 'driver'] },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await require('bcryptjs').compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
        role: user.role,
        status: user.status,
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
