const { body, validationResult } = require('express-validator');

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
