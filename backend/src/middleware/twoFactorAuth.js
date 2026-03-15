/**
 * Two-Factor Authentication Middleware
 * Enforces PIN setup for staff roles
 */

const { User } = require('../models');

/**
 * Middleware to enforce 2FA for staff roles
 * Checks if user has set up PIN before allowing access
 */
exports.enforce2FA = async (req, res, next) => {
  try {
    // User is already authenticated by authorize middleware
    const user = req.user;

    // Skip 2FA check for customers
    if (user.role === 'customer') {
      return next();
    }

    // For staff roles (admin, kitchen, driver), enforce PIN setup
    if (!user.is_pin_set) {
      // Generate a limited-scope token for setup only
      const setupToken = generateSetupToken(user);
      
      return res.status(403).json({
        success: false,
        error: 'Two-factor authentication setup required',
        requires_2fa_setup: true,
        setup_token: setupToken, // Limited token - can only be used for PIN setup
        user: {
          id: user.id,
          role: user.role,
          is_pin_set: false,
        },
      });
    }

    // User has PIN set - allow access
    next();
  } catch (error) {
    console.error('2FA enforcement error:', error);
    res.status(500).json({ error: '2FA verification failed' });
  }
};

/**
 * Generate a limited-scope token for PIN setup only
 * This token cannot be used for other API calls
 */
function generateSetupToken(user) {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      scope: 'pin_setup_only', // Limited scope
      is_pin_setup: true, // Flag to identify setup token
    },
    JWT_SECRET,
    { expiresIn: '10m' } // Short expiry - 10 minutes
  );
}

/**
 * Middleware to validate setup token
 * Used specifically for PIN setup endpoints
 */
exports.validateSetupToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify this is a setup token
    if (decoded.scope !== 'pin_setup_only' || !decoded.is_pin_setup) {
      return res.status(403).json({ error: 'Invalid token scope' });
    }

    // Verify token hasn't expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Setup token expired' });
    }

    // Attach user info to request
    req.setupUser = {
      id: decoded.id,
      phone: decoded.phone,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Setup token validation error:', error);
    res.status(401).json({ error: 'Invalid setup token' });
  }
};

/**
 * Rate limiting for PIN attempts
 */
const pinAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

exports.rateLimitPIN = (req, res, next) => {
  const { phone } = req.body;
  
  if (!phone) {
    return next();
  }

  const key = `pin:${phone}`;
  const attempts = pinAttempts.get(key) || { count: 0, lockedUntil: 0 };

  // Check if locked out
  if (attempts.lockedUntil > Date.now()) {
    const retryAfter = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: 'Too many PIN attempts. Please try again later.',
      retry_after: retryAfter,
      locked: true,
    });
  }

  // Reset if lockout expired
  if (attempts.lockedUntil > 0 && attempts.lockedUntil <= Date.now()) {
    pinAttempts.set(key, { count: 0, lockedUntil: 0 });
    return next();
  }

  // Store attempt counter in request for later use
  req.pinAttempts = attempts.count;

  next();
};

/**
 * Track failed PIN attempts
 * Call this after a failed PIN verification
 */
exports.trackFailedPINAttempt = (phone) => {
  const key = `pin:${phone}`;
  const attempts = pinAttempts.get(key) || { count: 0, lockedUntil: 0 };
  
  attempts.count += 1;
  
  // Lock out if max attempts reached
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_TIME;
    console.log(`🔒 PIN lockout for ${phone} - ${attempts.count} failed attempts`);
  }
  
  pinAttempts.set(key, attempts);
  
  return {
    remaining: Math.max(0, MAX_ATTEMPTS - attempts.count),
    locked: attempts.lockedUntil > Date.now(),
    lockedUntil: attempts.lockedUntil,
  };
};

/**
 * Reset PIN attempts on successful login
 */
exports.resetPINAttempts = (phone) => {
  const key = `pin:${phone}`;
  pinAttempts.delete(key);
  console.log(`✅ PIN attempts reset for ${phone}`);
};
