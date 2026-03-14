/**
 * Business Ordering Flow E2E Seeder
 * Bakso Premium - Complete Order Flow Test Data
 * 
 * This seeder creates:
 * - Customers with PIN set
 * - Products with stock
 * - Complete order flow (pending → completed)
 * - Payments for each order
 * - Loyalty points
 */

require('dotenv').config();
const { sequelize, User, Category, Product, Order, OrderItem, Payment, Voucher } = require('../src/models');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n📍 ${step}`, 'cyan');
  log(`${'─'.repeat(60)}`, 'cyan');
}

async function seedBusinessFlow() {
  try {
    logStep('🌱 Starting Business Ordering Flow Seeder');

    // Sync database (don't drop existing data)
    await sequelize.sync();
    log('✅ Database synced', 'green');

    // ==================== 1. GET/CREATE CUSTOMERS ====================
    logStep('1️⃣ Getting/Creating Customers with PIN');

    const customerHash = await bcrypt.hash('customer123', 10);
    const pinHash = await bcrypt.hash('123456', 10);

    const customerData = [
      {
        name: 'Budi Santoso',
        phone: '081234567893',
        email: 'budi@example.com',
        completed_orders: 5,
        loyalty_points: 500,
      },
      {
        name: 'Siti Nurhaliza',
        phone: '081234567894',
        email: 'siti@example.com',
        completed_orders: 3,
        loyalty_points: 300,
      },
      {
        name: 'Ahmad Rizki',
        phone: '081234567895',
        email: 'ahmad@example.com',
        completed_orders: 10,
        loyalty_points: 1000,
      },
    ];

    const customers = [];
    for (const data of customerData) {
      const [customer, created] = await User.findOrCreate({
        where: { phone: data.phone },
        defaults: {
          ...data,
          password: customerHash,
          role: 'customer',
          status: 'active',
          is_pin_set: true,
          pin_hash: pinHash,
        },
      });

      if (!created) {
        // Update existing customer
        customer.email = data.email;
        customer.completed_orders = data.completed_orders;
        customer.loyalty_points = data.loyalty_points;
        customer.is_pin_set = true;
        customer.pin_hash = pinHash;
        await customer.save();
        log(`   Updated: ${customer.name}`, 'blue');
      } else {
        log(`   Created: ${customer.name}`, 'green');
      }
      customers.push(customer);
    }

    log(`✅ Ready ${customers.length} customers with PIN`, 'green');

    // ==================== 2. GET/CREATE PRODUCTS ====================
    logStep('2️⃣ Getting Products');

    let categories = await Category.findAll();
    if (categories.length === 0) {
      log('⚠️ No categories found. Please run seed-production.js first', 'yellow');
      return;
    }

    let products = await Product.findAll();
    if (products.length === 0) {
      log('⚠️ No products found. Please run seed-production.js first', 'yellow');
      return;
    }

    log(`✅ Found ${categories.length} categories and ${products.length} products`, 'green');

    // ==================== 3. CREATE ORDERS ====================
    logStep('3️⃣ Creating Orders in Various Statuses');

    const now = new Date();
    const orders = [];

    // Order 1: Completed (2 days ago)
    const order1 = await Order.create({
      user_id: customers[0].id,
      customer_name: customers[0].name,
      customer_phone: customers[0].phone,
      order_type: 'dine-in',
      status: 'completed',
      subtotal: 50000,
      discount: 5000,
      delivery_fee: 0,
      total: 45000,
      table_number: '5',
      queue_number: 1,
      queue_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      payment_method: 'qris',
      paid_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      loyalty_points_earned: 45,
    });

    await OrderItem.create({
      order_id: order1.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 2,
      price: products[0].price,
      subtotal: products[0].price * 2,
    });

    await Payment.create({
      order_id: order1.id,
      method: 'qris',
      amount: 45000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    orders.push(order1);
    log(`✅ Order 1: ${order1.order_number} - COMPLETED`, 'green');

    // Order 2: Completed (1 day ago)
    const order2 = await Order.create({
      user_id: customers[1].id,
      customer_name: customers[1].name,
      customer_phone: customers[1].phone,
      order_type: 'takeaway',
      status: 'completed',
      subtotal: 35000,
      discount: 0,
      delivery_fee: 0,
      total: 35000,
      queue_number: 2,
      queue_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      payment_method: 'bank_transfer',
      paid_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      loyalty_points_earned: 35,
    });

    await OrderItem.create({
      order_id: order2.id,
      product_id: products[1].id,
      product_name: products[1].name,
      quantity: 1,
      price: products[1].price,
      subtotal: products[1].price,
    });

    await Payment.create({
      order_id: order2.id,
      method: 'bank_transfer',
      amount: 35000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });

    orders.push(order2);
    log(`✅ Order 2: ${order2.order_number} - COMPLETED`, 'green');

    // Order 3: Ready for pickup (today)
    const order3 = await Order.create({
      user_id: customers[2].id,
      customer_name: customers[2].name,
      customer_phone: customers[2].phone,
      order_type: 'takeaway',
      status: 'ready',
      subtotal: 70000,
      discount: 7000,
      delivery_fee: 0,
      total: 63000,
      queue_number: 3,
      queue_date: now,
      payment_method: 'qris',
      paid_at: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      loyalty_points_earned: 63,
    });

    await OrderItem.create({
      order_id: order3.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 1,
      price: products[0].price,
      subtotal: products[0].price,
    });

    await OrderItem.create({
      order_id: order3.id,
      product_id: products[2].id,
      product_name: products[2].name,
      quantity: 2,
      price: products[2].price,
      subtotal: products[2].price * 2,
    });

    await Payment.create({
      order_id: order3.id,
      method: 'qris',
      amount: 63000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 30 * 60 * 1000),
    });

    orders.push(order3);
    log(`✅ Order 3: ${order3.order_number} - READY`, 'green');

    // Order 4: Preparing (now)
    const order4 = await Order.create({
      user_id: customers[0].id,
      customer_name: customers[0].name,
      customer_phone: customers[0].phone,
      order_type: 'delivery',
      status: 'preparing',
      subtotal: 95000,
      discount: 0,
      delivery_fee: 15000,
      total: 110000,
      queue_number: 4,
      queue_date: now,
      delivery_address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      payment_method: 'e_wallet',
      paid_at: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      loyalty_points_earned: 110,
    });

    await OrderItem.create({
      order_id: order4.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 2,
      price: products[0].price,
      subtotal: products[0].price * 2,
    });

    await OrderItem.create({
      order_id: order4.id,
      product_id: products[3].id,
      product_name: products[3].name,
      quantity: 2,
      price: products[3].price,
      subtotal: products[3].price * 2,
    });

    await Payment.create({
      order_id: order4.id,
      method: 'e_wallet',
      amount: 110000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 15 * 60 * 1000),
    });

    orders.push(order4);
    log(`✅ Order 4: ${order4.order_number} - PREPARING`, 'green');

    // Order 5: Paid, waiting for kitchen (now)
    const order5 = await Order.create({
      user_id: customers[1].id,
      customer_name: customers[1].name,
      customer_phone: customers[1].phone,
      order_type: 'dine-in',
      status: 'paid',
      subtotal: 40000,
      discount: 0,
      delivery_fee: 0,
      total: 40000,
      table_number: '12',
      queue_number: 5,
      queue_date: now,
      payment_method: 'qris',
      paid_at: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      loyalty_points_earned: 40,
    });

    await OrderItem.create({
      order_id: order5.id,
      product_id: products[1].id,
      product_name: products[1].name,
      quantity: 1,
      price: products[1].price,
      subtotal: products[1].price,
    });

    await OrderItem.create({
      order_id: order5.id,
      product_id: products[4].id,
      product_name: products[4].name,
      quantity: 2,
      price: products[4].price,
      subtotal: products[4].price * 2,
    });

    await Payment.create({
      order_id: order5.id,
      method: 'qris',
      amount: 40000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 5 * 60 * 1000),
    });

    orders.push(order5);
    log(`✅ Order 5: ${order5.order_number} - PAID`, 'green');

    // Order 6: Pending payment (now)
    const order6 = await Order.create({
      user_id: customers[2].id,
      customer_name: customers[2].name,
      customer_phone: customers[2].phone,
      order_type: 'delivery',
      status: 'pending_payment',
      subtotal: 125000,
      discount: 12500,
      delivery_fee: 15000,
      total: 127500,
      queue_number: 6,
      queue_date: now,
      delivery_address: 'Jl. Sudirman No. 456, Jakarta Selatan',
      payment_method: 'bank_transfer',
      loyalty_points_earned: 127,
    });

    await OrderItem.create({
      order_id: order6.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 3,
      price: products[0].price,
      subtotal: products[0].price * 3,
    });

    await OrderItem.create({
      order_id: order6.id,
      product_id: products[5].id,
      product_name: products[5].name,
      quantity: 2,
      price: products[5].price,
      subtotal: products[5].price * 2,
    });

    await Payment.create({
      order_id: order6.id,
      method: 'bank_transfer',
      amount: 127500,
      status: 'pending',
    });

    orders.push(order6);
    log(`✅ Order 6: ${order6.order_number} - PENDING PAYMENT`, 'green');

    // ==================== SUMMARY ====================
    logStep('📊 Seeder Summary');

    log(`✅ Customers with PIN: ${customers.length}`, 'green');
    log(`✅ Categories: ${categories.length}`, 'green');
    log(`✅ Products: ${products.length}`, 'green');
    log(`✅ Orders Created: ${orders.length}`, 'green');
    log(`   - Completed: 2`, 'blue');
    log(`   - Ready: 1`, 'blue');
    log(`   - Preparing: 1`, 'blue');
    log(`   - Paid: 1`, 'blue');
    log(`   - Pending Payment: 1`, 'blue');

    logStep('🎉 Business Flow Seeder Complete!');

    log('\n📋 Test Credentials:', 'yellow');
    log('   Customer 1: 081234567893 / customer123 (PIN: 123456)', 'yellow');
    log('   Customer 2: 081234567894 / customer123 (PIN: 123456)', 'yellow');
    log('   Customer 3: 081234567895 / customer123 (PIN: 123456)', 'yellow');

    log('\n📱 Order Flow to Test:', 'yellow');
    log('   1. Customer login with PIN', 'yellow');
    log('   2. View orders (completed, ready, preparing, paid, pending)', 'yellow');
    log('   3. Admin view all orders', 'yellow');
    log('   4. Kitchen update order status', 'yellow');
    log('   5. Driver handle delivery orders', 'yellow');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Seeder Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

seedBusinessFlow();
