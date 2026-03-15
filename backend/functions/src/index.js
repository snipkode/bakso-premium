const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// Import API handlers
const authApi = require('./api/auth');
const productsApi = require('./api/products');
const ordersApi = require('./api/orders');
const paymentsApi = require('./api/payments');
const vouchersApi = require('./api/vouchers');
const reviewsApi = require('./api/reviews');
const loyaltyApi = require('./api/loyalty');
const usersApi = require('./api/users');
const dashboardApi = require('./api/dashboard');
const queueApi = require('./api/queue');

// Import real-time triggers
const orderTriggers = require('./triggers/orders');
const paymentTriggers = require('./triggers/payments');

// ==================== HTTP Functions ====================

// Auth API
exports.auth = functions.https.onRequest((req, res) => {
  cors(req, res, () => authApi(req, res));
});

// Products API
exports.products = functions.https.onRequest((req, res) => {
  cors(req, res, () => productsApi(req, res));
});

// Orders API
exports.orders = functions.https.onRequest((req, res) => {
  cors(req, res, () => ordersApi(req, res));
});

// Payments API
exports.payments = functions.https.onRequest((req, res) => {
  cors(req, res, () => paymentsApi(req, res));
});

// Vouchers API
exports.vouchers = functions.https.onRequest((req, res) => {
  cors(req, res, () => vouchersApi(req, res));
});

// Reviews API
exports.reviews = functions.https.onRequest((req, res) => {
  cors(req, res, () => reviewsApi(req, res));
});

// Loyalty API
exports.loyalty = functions.https.onRequest((req, res) => {
  cors(req, res, () => loyaltyApi(req, res));
});

// Users API
exports.users = functions.https.onRequest((req, res) => {
  cors(req, res, () => usersApi(req, res));
});

// Dashboard API
exports.dashboard = functions.https.onRequest((req, res) => {
  cors(req, res, () => dashboardApi(req, res));
});

// Queue API
exports.queue = functions.https.onRequest((req, res) => {
  cors(req, res, () => queueApi(req, res));
});

// Health check
exports.health = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Bakso Premium Firebase Backend'
    });
  });
});

// ==================== Database Triggers ====================

// Order status change triggers
exports.onOrderCreated = orderTriggers.onOrderCreated;
exports.onOrderStatusChanged = orderTriggers.onOrderStatusChanged;

// Payment triggers
exports.onPaymentCreated = paymentTriggers.onPaymentCreated;
exports.onPaymentVerified = paymentTriggers.onPaymentVerified;
