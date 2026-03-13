const { Voucher } = require('../models');
const { Op } = require('sequelize');

// Get all active vouchers
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      where: {
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_until: { [Op.gte]: new Date() },
      },
      order: [['valid_until', 'ASC']],
    });

    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get vouchers' });
  }
};

// Validate voucher code
exports.validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.query;

    const voucher = await Voucher.findOne({
      where: {
        code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_until: { [Op.gte]: new Date() },
      },
    });

    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Invalid voucher code' });
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, error: 'Voucher usage limit reached' });
    }

    if (subtotal && voucher.min_purchase > subtotal) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase is Rp ${voucher.min_purchase.toLocaleString()}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = Math.floor((subtotal * voucher.value) / 100);
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    } else {
      discount = voucher.value;
    }

    res.json({
      success: true,
      voucher: {
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
        discount,
        min_purchase: voucher.min_purchase,
        valid_until: voucher.valid_until,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
};

// Create voucher (admin only)
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
      applicable_products,
      applicable_categories,
    } = req.body;

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      min_purchase: min_purchase || 0,
      max_discount,
      usage_limit,
      valid_from: valid_from || new Date(),
      valid_until,
      applicable_products,
      applicable_categories,
      is_active: true,
    });

    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create voucher' });
  }
};

// Update voucher (admin only)
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    Object.keys(updateData).forEach((key) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        voucher[key] = updateData[key];
      }
    });

    await voucher.save();

    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

// Delete voucher (admin only)
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    await voucher.destroy();

    res.json({ success: true, message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};

// Increment voucher usage
exports.incrementVoucherUsage = async (req, res) => {
  try {
    const { code } = req.params;

    const voucher = await Voucher.findOne({ where: { code } });
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    voucher.used_count += 1;
    await voucher.save();

    res.json({ success: true, used_count: voucher.used_count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment voucher usage' });
  }
};
