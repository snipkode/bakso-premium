const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://bakso-premium-default-rtdb.firebaseio.com'
  });
}

const db = admin.database();
const auth = admin.auth();

// Database references
const refs = {
  users: db.ref('users'),
  categories: db.ref('categories'),
  products: db.ref('products'),
  orders: db.ref('orders'),
  orderItems: db.ref('orderItems'),
  payments: db.ref('payments'),
  vouchers: db.ref('vouchers'),
  reviews: db.ref('reviews'),
  loyaltyPoints: db.ref('loyaltyPoints'),
  pushSubscriptions: db.ref('pushSubscriptions'),
  queueSettings: db.ref('queueSettings'),
  notifications: db.ref('notifications'),
};

module.exports = {
  admin,
  db,
  auth,
  refs,
};
