const { body, query, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validasi gagal',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Update profile validation
exports.validateUpdateProfile = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nama minimal 3 karakter dan maksimal 255 karakter')
    .matches(/^[\p{L}\p{N}\s]+$/u)
    .withMessage('Nama hanya boleh mengandung huruf, angka, dan spasi'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^08[0-9]{8,11}$/)
    .withMessage('Nomor telepon harus diawali 08 dan terdiri dari 10-13 digit'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid')
    .isLength({ max: 255 })
    .withMessage('Email maksimal 255 karakter'),
  
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6, max: 128 })
    .withMessage('Password minimal 6 karakter dan maksimal 128 karakter'),
  
  handleValidationErrors,
];

// Send verification email validation (no body needed, just auth)
exports.validateSendVerificationEmail = [
  // No validation needed, just requires authentication
  (req, res, next) => {
    next();
  },
];

// Verify email validation (query params)
exports.validateVerifyEmail = [
  body('token')
    .exists()
    .withMessage('Token diperlukan')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Token tidak valid'),
  
  body('email')
    .exists()
    .withMessage('Email diperlukan')
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  
  handleValidationErrors,
];

// Toggle phone verification (admin only)
exports.validateTogglePhoneVerification = [
  body('userId')
    .exists()
    .withMessage('userId diperlukan')
    .isString()
    .isUUID()
    .withMessage('userId harus berupa UUID yang valid'),
  
  body('phone_verified')
    .exists()
    .withMessage('phone_verified diperlukan')
    .isBoolean()
    .withMessage('phone_verified harus boolean (true/false)'),
  
  handleValidationErrors,
];

// User creation validation (admin)
exports.validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nama minimal 3 karakter dan maksimal 255 karakter')
    .matches(/^[\p{L}\p{N}\s]+$/u)
    .withMessage('Nama hanya boleh mengandung huruf, angka, dan spasi'),
  
  body('phone')
    .trim()
    .matches(/^08[0-9]{8,11}$/)
    .withMessage('Nomor telepon harus diawali 08 dan terdiri dari 10-13 digit'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6, max: 128 })
    .withMessage('Password minimal 6 karakter'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'kitchen', 'driver'])
    .withMessage('Role harus salah satu dari: customer, admin, kitchen, driver'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status harus salah satu dari: active, inactive, blocked'),
  
  handleValidationErrors,
];

// Update user validation (admin)
exports.validateUpdateUser = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nama minimal 3 karakter dan maksimal 255 karakter'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^08[0-9]{8,11}$/)
    .withMessage('Nomor telepon harus diawali 08 dan terdiri dari 10-13 digit'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'kitchen', 'driver'])
    .withMessage('Role harus salah satu dari: customer, admin, kitchen, driver'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status harus salah satu dari: active, inactive, blocked'),
  
  handleValidationErrors,
];

// Update user status validation (admin)
exports.validateUpdateUserStatus = [
  body('status')
    .exists()
    .withMessage('Status diperlukan')
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status harus salah satu dari: active, inactive, blocked'),
  
  handleValidationErrors,
];

// Update user password validation (admin)
exports.validateUpdateUserPassword = [
  body('userId')
    .exists()
    .withMessage('userId diperlukan')
    .isString()
    .isUUID()
    .withMessage('userId harus berupa UUID yang valid'),
  
  body('password')
    .exists()
    .withMessage('Password diperlukan')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password minimal 6 karakter dan maksimal 128 karakter'),
  
  handleValidationErrors,
];

// ==================== PRODUCT VALIDATIONS ====================

exports.validateCreateProduct = [
  body('name').trim().isLength({ min: 3, max: 255 }).withMessage('Nama produk minimal 3 karakter'),
  body('price').isInt({ min: 0 }).withMessage('Harga harus angka >= 0'),
  body('category_id').isUUID().withMessage('Category ID harus UUID valid'),
  handleValidationErrors,
];

exports.validateUpdateProduct = [
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 255 }),
  body('price').optional().isInt({ min: 0 }),
  body('is_available').optional().isBoolean(),
  handleValidationErrors,
];

// ==================== ORDER VALIDATIONS ====================

exports.validateCreateOrder = [
  body('order_type').isIn(['dine-in', 'takeaway', 'delivery']),
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1, max: 100 }),
  handleValidationErrors,
];

exports.validateUpdateOrderStatus = [
  body('status').isIn(['pending_payment', 'waiting_verification', 'paid', 'preparing', 'ready', 'out_for_delivery', 'completed', 'rejected', 'cancelled']),
  handleValidationErrors,
];

// ==================== PAYMENT VALIDATIONS ====================

exports.validateCreatePayment = [
  body('order_id').isUUID(),
  body('method').isIn(['bank_transfer', 'qris', 'e_wallet', 'cod']),
  handleValidationErrors,
];

exports.validateVerifyPayment = [
  body('status').isIn(['verified', 'rejected']),
  handleValidationErrors,
];

// ==================== REVIEW VALIDATIONS ====================

exports.validateCreateReview = [
  body('order_id').isUUID(),
  body('product_id').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  handleValidationErrors,
];

// ==================== VOUCHER VALIDATIONS ====================

exports.validateCreateVoucher = [
  body('code').trim().isLength({ min: 3, max: 50 }).matches(/^[A-Z0-9]+$/),
  body('name').trim().isLength({ min: 3, max: 255 }),
  body('type').isIn(['percentage', 'fixed']),
  body('value').isInt({ min: 1 }),
  handleValidationErrors,
];

// ==================== LOYALTY VALIDATIONS ====================

exports.validateRedeemLoyaltyPoints = [
  body('points').isInt({ min: 1 }),
  handleValidationErrors,
];

// ==================== QUEUE VALIDATIONS ====================

exports.validateResetQueue = [
  body('date').optional().isISO8601(),
  handleValidationErrors,
];

// ==================== PUSH NOTIFICATION VALIDATIONS ====================

exports.validateSavePushSubscription = [
  body('endpoint').trim().notEmpty(),
  body('keys').isObject(),
  handleValidationErrors,
];

exports.validateUpdateVoucher = [
  body('code').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 50 }).matches(/^[A-Z0-9]+$/),
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 255 }),
  body('type').optional().isIn(['percentage', 'fixed']),
  body('value').optional().isInt({ min: 1 }),
  body('min_purchase').optional().isInt({ min: 0 }),
  body('max_discount').optional().isInt({ min: 0 }),
  body('usage_limit').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean(),
  handleValidationErrors,
];
