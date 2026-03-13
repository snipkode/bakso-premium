const { Category, Product } = require('../models');
const { Op } = require('sequelize');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [{
        model: Product,
        as: 'products',
        where: { is_available: true },
        required: false,
      }],
      order: [['sort_order', 'ASC']],
    });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        where: { is_available: true },
        required: false,
      }],
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get category' });
  }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, order } = req.body;

    const category = await Category.create({
      name,
      description,
      image,
      icon,
      order: order || 0,
      is_active: true,
    });

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, icon, order, is_active } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (image) category.image = image;
    if (icon) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { category_id, search, is_featured, limit = 50 } = req.query;

    const where = { is_available: true };
    if (category_id) where.category_id = category_id;
    if (is_featured !== undefined) where.is_featured = is_featured === 'true';
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon'],
      }],
      limit: parseInt(limit),
      order: [['is_featured', 'DESC'], ['name', 'ASC']],
    });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
      }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get product' });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      image,
      images,
      is_featured,
      preparation_time,
      calories,
      spicy_level,
      customizations,
    } = req.body;

    const product = await Product.create({
      category_id,
      name,
      description,
      price,
      image,
      images: images || [],
      is_featured: is_featured || false,
      is_available: true,
      preparation_time: preparation_time || 10,
      calories,
      spicy_level: spicy_level || 0,
      customizations: customizations || [],
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        product[key] = updateData[key];
      }
    });

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Toggle product availability (admin only)
exports.toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.is_available = !product.is_available;
    await product.save();

    res.json({ success: true, product, message: product.is_available ? 'Product available' : 'Product unavailable' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};
