const express = require('express');
const router = express.Router();
const staff2FA = require('../controllers/staff2FAController');
const { validateSetupToken } = require('../middleware/twoFactorAuth');

// Staff 2FA routes (use setup token for authentication)
router.post('/setup-pin', validateSetupToken, staff2FA.setupPIN);
router.post('/complete', validateSetupToken, staff2FA.complete2FASetup);

module.exports = router;
