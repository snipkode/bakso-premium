const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Voucher = require('./Voucher');
const Review = require('./Review');
const LoyaltyPoint = require('./LoyaltyPoint');
const PushSubscription = require('./PushSubscription');
const QueueSetting = require('./QueueSetting');

// User associations
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LoyaltyPoint, { foreignKey: 'user_id', as: 'loyaltyPoints' });
LoyaltyPoint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PushSubscription, { foreignKey: 'user_id', as: 'pushSubscriptions' });
PushSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Payment, { foreignKey: 'verified_by', as: 'verifiedPayments' });
Payment.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Order associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Product associations
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'productReviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'productDetail' });

// LoyaltyPoint associations
LoyaltyPoint.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Review associations
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Payment,
  Voucher,
  Review,
  LoyaltyPoint,
  PushSubscription,
  QueueSetting,
};
