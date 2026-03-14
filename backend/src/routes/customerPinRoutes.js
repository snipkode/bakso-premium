const express = require('express');
const router = express.Router();
const {
  setPIN,
  verifyPIN,
  requestPINReset,
  resetPIN,
  checkPINStatus,
} = require('../controllers/customerPinController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/verify', verifyPIN);
router.post('/forgot', requestPINReset);
router.post('/reset', resetPIN);

// Protected routes (require authentication)
router.post('/set', auth, setPIN);
router.get('/status', auth, checkPINStatus);

module.exports = router;
