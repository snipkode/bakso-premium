const { Voucher, Order, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all vouchers (with filters)
 * GET /vouchers
 */
exports.getVouchers = async (req, res) => {
  try {
    const { is_active, type } = req.query;
    
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }
    if (type) {
      where.type = type;
    }

    const vouchers = await Voucher.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });

    // Filter active vouchers for customers
    let filteredVouchers = vouchers;
    if (req.user.role === 'customer') {
      const now = new Date();
      filteredVouchers = vouchers.filter(v => 
        v.is_active && 
        v.valid_from <= now && 
        v.valid_until >= now &&
        v.usage_limit > v.used_count
      );
    }

    res.json({
      success: true,
      vouchers: filteredVouchers,
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ error: 'Failed to get vouchers' });
  }
};

/**
 * Get voucher by ID
 * GET /vouchers/:id
 */
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error('Get voucher by ID error:', error);
    res.status(500).json({ error: 'Failed to get voucher' });
  }
};

/**
 * Create voucher (Admin only)
 * POST /vouchers
 */
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      min_purchase,
      max_discount,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
      applicable_products,
      applicable_categories,
    } = req.body;

    // Check if code already exists
    const existingVoucher = await Voucher.findOne({ where: { code } });
    if (existingVoucher) {
      return res.status(409).json({ error: 'Voucher code already exists' });
    }

    const voucher = await Voucher.create({
      code,
      name,
      description,
      type,
      value,
      min_purchase: min_purchase || 0,
      max_discount: max_discount || null,
      usage_limit: usage_limit || null,
      valid_from: valid_from || new Date(),
      valid_until,
      is_active: is_active !== undefined ? is_active : true,
      applicable_products: applicable_products || null,
      applicable_categories: applicable_categories || null,
    });

    res.status(201).json({
      success: true,
      voucher,
      message: 'Voucher created successfully',
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
};

/**
 * Update voucher (Admin only)
 * PUT /vouchers/:id
 */
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // Prevent updating code if voucher already used
    if (updates.code && updates.code !== voucher.code && voucher.used_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot update code of voucher that has been used' 
      });
    }

    await voucher.update(updates);

    res.json({
      success: true,
      voucher,
      message: 'Voucher updated successfully',
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

/**
 * Delete voucher (Admin only)
 * DELETE /vouchers/:id
 */
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // Prevent deleting voucher that has been used
    if (voucher.used_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete voucher that has been used. Deactivate instead.' 
      });
    }

    await voucher.destroy();

    res.json({
      success: true,
      message: 'Voucher deleted successfully',
    });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};

/**
 * Validate voucher for order
 * POST /vouchers/validate
 */
exports.validateVoucher = async (req, res) => {
  try {
    const { code, subtotal, order_type } = req.body;

    const voucher = await Voucher.findOne({ where: { code } });
    
    if (!voucher) {
      return res.status(404).json({ 
        error: 'Voucher not found',
        valid: false 
      });
    }

    // Check if voucher is active
    if (!voucher.is_active) {
      return res.status(400).json({ 
        error: 'Voucher is not active',
        valid: false 
      });
    }

    // Check validity period
    const now = new Date();
    if (voucher.valid_from > now || voucher.valid_until < now) {
      return res.status(400).json({ 
        error: 'Voucher is expired or not yet valid',
        valid: false 
      });
    }

    // Check usage limit
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ 
        error: 'Voucher usage limit reached',
        valid: false 
      });
    }

    // Check min purchase
    if (voucher.min_purchase && subtotal < voucher.min_purchase) {
      return res.status(400).json({ 
        error: `Minimum purchase is Rp ${voucher.min_purchase.toLocaleString()}`,
        valid: false 
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = Math.round(subtotal * (voucher.value / 100));
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    } else if (voucher.type === 'fixed') {
      discount = voucher.value;
    }

    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    res.json({
      success: true,
      valid: true,
      voucher: {
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
      },
      discount,
      message: 'Voucher is valid',
    });
  } catch (error) {
    console.error('Validate voucher error:', error);
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
};

/**
 * Increment voucher usage (called when order is completed)
 * This is called internally from order controller
 */
exports.incrementVoucherUsage = async (voucherCode) => {
  try {
    if (!voucherCode) return;

    const voucher = await Voucher.findOne({ where: { code: voucherCode } });
    if (voucher) {
      await voucher.increment('used_count');
    }
  } catch (error) {
    console.error('Increment voucher usage error:', error);
    // Don't throw error - this shouldn't fail the order completion
  }
};

/**
 * Decrement voucher usage (called when order is cancelled)
 */
exports.decrementVoucherUsage = async (voucherCode) => {
  try {
    if (!voucherCode) return;

    const voucher = await Voucher.findOne({ where: { code: voucherCode } });
    if (voucher && voucher.used_count > 0) {
      await voucher.decrement('used_count');
    }
  } catch (error) {
    console.error('Decrement voucher usage error:', error);
  }
};
