const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');
const { validateCreateProduct, validateUpdateProduct } = require('../middleware/validators');

// Public routes
router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategoryById);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

// Admin routes
router.post('/categories', auth, authorize('admin'), productController.createCategory);
router.put('/categories/:id', auth, authorize('admin'), productController.updateCategory);
router.delete('/categories/:id', auth, authorize('admin'), productController.deleteCategory);

router.post('/products', auth, authorize('admin'), validateCreateProduct, productController.createProduct);
router.put('/products/:id', auth, authorize('admin'), validateUpdateProduct, productController.updateProduct);
router.delete('/products/:id', auth, authorize('admin'), productController.deleteProduct);
router.patch('/products/:id/availability', auth, authorize('admin'), productController.toggleProductAvailability);

// Stock management routes (admin only)
router.patch('/products/:id/stock', auth, authorize('admin'), productController.updateProductStock);
router.get('/products/stock/low', auth, authorize('admin'), productController.getLowStockProducts);

module.exports = router;
