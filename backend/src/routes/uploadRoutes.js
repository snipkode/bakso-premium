const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { upload, handleUploadError } = require('../middleware/upload');
const { auth, authorize } = require('../middleware/auth');

// Ensure products upload directory exists
const productsDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Upload product image
router.post('/product-image', auth, authorize('admin'), upload.single('image'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Move file to products directory
    const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const newPath = path.join(productsDir, fileName);
    
    // Rename/move the file
    fs.renameSync(req.file.path, newPath);

    // Create public URL
    const imageUrl = `/uploads/products/${fileName}`;

    res.json({
      success: true,
      fileName,
      imageUrl,
      filePath: newPath,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete product image
router.delete('/product-image/:fileName', auth, authorize('admin'), async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Validate file name to prevent directory traversal
    if (!fileName.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/)) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    const filePath = path.join(productsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// List all product images (admin only)
router.get('/product-images', auth, authorize('admin'), (req, res) => {
  try {
    const files = fs.readdirSync(productsDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => {
        const stats = fs.statSync(path.join(productsDir, file));
        return {
          fileName: file,
          url: `/uploads/products/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      });

    res.json({
      success: true,
      images: files,
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

module.exports = router;
