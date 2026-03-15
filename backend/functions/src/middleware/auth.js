const { admin, refs } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bakso-premium-secret-key';

// Verify JWT token middleware
const verifyToken = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userSnapshot = await refs.users.child(decoded.userId).once('value');
    const user = userSnapshot.val();
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status === 'blocked') {
      throw new Error('User is blocked');
    }

    return { ...user, id: decoded.userId };
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Check if user is admin
const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// Check if user is staff (admin, kitchen, driver)
const isStaff = (user) => {
  return user && ['admin', 'kitchen', 'driver'].includes(user.role);
};

module.exports = {
  verifyToken,
  generateToken,
  isAdmin,
  isStaff,
  JWT_SECRET,
};
