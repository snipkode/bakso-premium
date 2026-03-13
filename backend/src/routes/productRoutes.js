const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategoryById);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

// Admin routes
router.post('/categories', auth, authorize('admin'), productController.createCategory);
router.put('/categories/:id', auth, authorize('admin'), productController.updateCategory);
router.delete('/categories/:id', auth, authorize('admin'), productController.deleteCategory);

router.post('/products', auth, authorize('admin'), productController.createProduct);
router.put('/products/:id', auth, authorize('admin'), productController.updateProduct);
router.delete('/products/:id', auth, authorize('admin'), productController.deleteProduct);
router.patch('/products/:id/availability', auth, authorize('admin'), productController.toggleProductAvailability);

module.exports = router;
