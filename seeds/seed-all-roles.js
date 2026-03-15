/**
 * Complete Role-Based E2E Test Seeder
 * Bakso Premium - All Roles Test Data
 * 
 * Creates complete test data for:
 * - Admin (full access)
 * - Kitchen (order management)
 * - Driver (delivery management)
 * - Customer (ordering flow)
 */

require('dotenv').config();
const { sequelize, User, Category, Product, Order, OrderItem, Payment } = require('../src/models');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n📍 ${step}`, 'cyan');
  log(`${'─'.repeat(60)}`, 'cyan');
}

async function seedAllRoles() {
  try {
    logStep('🌱 Starting Complete Role-Based Seeder');

    // Sync database
    await sequelize.sync();
    log('✅ Database synced', 'green');

    // ==================== 1. CREATE STAFF USERS ====================
    logStep('1️⃣ Creating Staff Users');

    const adminHash = await bcrypt.hash('admin123', 10);
    const kitchenHash = await bcrypt.hash('kitchen123', 10);
    const driverHash = await bcrypt.hash('driver123', 10);

    const staff = await User.bulkCreate([
      {
        name: 'Administrator',
        phone: '081234567890',
        email: 'admin@bakso.com',
        password: adminHash,
        role: 'admin',
        status: 'active',
      },
      {
        name: 'Kitchen Staff',
        phone: '081234567891',
        email: 'kitchen@bakso.com',
        password: kitchenHash,
        role: 'kitchen',
        status: 'active',
      },
      {
        name: 'Driver Staff',
        phone: '081234567892',
        email: 'driver@bakso.com',
        password: driverHash,
        role: 'driver',
        status: 'active',
      },
    ], { ignoreDuplicates: true });

    log(`✅ Created/Updated ${staff.length} staff users`, 'green');

    // ==================== 2. CREATE CUSTOMERS ====================
    logStep('2️⃣ Creating Customers with PIN');

    const customerHash = await bcrypt.hash('customer123', 10);
    const pinHash = await bcrypt.hash('123456', 10);

    const customerData = [
      { name: 'Budi Santoso', phone: '081234567893', email: 'budi@example.com', completed_orders: 5, loyalty_points: 500 },
      { name: 'Siti Nurhaliza', phone: '081234567894', email: 'siti@example.com', completed_orders: 3, loyalty_points: 300 },
      { name: 'Ahmad Rizki', phone: '081234567895', email: 'ahmad@example.com', completed_orders: 10, loyalty_points: 1000 },
      { name: 'Dewi Lestari', phone: '081234567896', email: 'dewi@example.com', completed_orders: 1, loyalty_points: 100 },
      { name: 'Eko Prasetyo', phone: '081234567897', email: 'eko@example.com', completed_orders: 0, loyalty_points: 0 },
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

    log(`✅ Ready ${customers.length} customers with PIN (123456)`, 'green');

    // ==================== 3. GET PRODUCTS ====================
    logStep('3️⃣ Getting Products');

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

    // ==================== 4. CREATE ORDERS FOR ALL FLOWS ====================
    logStep('4️⃣ Creating Orders for All Role Flows');

    const now = new Date();
    const orders = [];

    // ========== ADMIN VIEW - All Orders ==========
    log('\n   📋 Creating orders for ADMIN view...', 'cyan');

    // Order 1: Completed (dine-in)
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
    log('   ✅ Order 1: COMPLETED (Dine-in) - Admin can view', 'green');

    // ========== KITCHEN VIEW - Pending Orders ==========
    log('\n   🍳 Creating orders for KITCHEN view...', 'cyan');

    // Order 2: PAID (waiting for kitchen)
    const order2 = await Order.create({
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
      queue_number: 2,
      queue_date: now,
      payment_method: 'qris',
      paid_at: new Date(now.getTime() - 5 * 60 * 1000),
      loyalty_points_earned: 40,
    });

    await OrderItem.create({
      order_id: order2.id,
      product_id: products[1].id,
      product_name: products[1].name,
      quantity: 1,
      price: products[1].price,
      subtotal: products[1].price,
    });

    await OrderItem.create({
      order_id: order2.id,
      product_id: products[4].id,
      product_name: products[4].name,
      quantity: 2,
      price: products[4].price,
      subtotal: products[4].price * 2,
    });

    await Payment.create({
      order_id: order2.id,
      method: 'qris',
      amount: 40000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 5 * 60 * 1000),
    });

    orders.push(order2);
    log('   ✅ Order 2: PAID - Kitchen can start cooking', 'green');

    // Order 3: PREPARING (being cooked)
    const order3 = await Order.create({
      user_id: customers[2].id,
      customer_name: customers[2].name,
      customer_phone: customers[2].phone,
      order_type: 'takeaway',
      status: 'preparing',
      subtotal: 70000,
      discount: 7000,
      delivery_fee: 0,
      total: 63000,
      queue_number: 3,
      queue_date: now,
      payment_method: 'qris',
      paid_at: new Date(now.getTime() - 15 * 60 * 1000),
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
      verified_at: new Date(now.getTime() - 15 * 60 * 1000),
    });

    orders.push(order3);
    log('   ✅ Order 3: PREPARING - Kitchen can mark ready', 'green');

    // Order 4: READY (waiting for driver/customer)
    const order4 = await Order.create({
      user_id: customers[3].id,
      customer_name: customers[3].name,
      customer_phone: customers[3].phone,
      order_type: 'takeaway',
      status: 'ready',
      subtotal: 35000,
      discount: 0,
      delivery_fee: 0,
      total: 35000,
      queue_number: 4,
      queue_date: now,
      payment_method: 'bank_transfer',
      paid_at: new Date(now.getTime() - 25 * 60 * 1000),
      completed_at: null,
      loyalty_points_earned: 35,
    });

    await OrderItem.create({
      order_id: order4.id,
      product_id: products[1].id,
      product_name: products[1].name,
      quantity: 1,
      price: products[1].price,
      subtotal: products[1].price,
    });

    await Payment.create({
      order_id: order4.id,
      method: 'bank_transfer',
      amount: 35000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 25 * 60 * 1000),
    });

    orders.push(order4);
    log('   ✅ Order 4: READY - Kitchen done, waiting for pickup', 'green');

    // ========== DRIVER VIEW - Delivery Orders ==========
    log('\n   🛵 Creating orders for DRIVER view...', 'cyan');

    // Order 5: READY (delivery, waiting for driver)
    const order5 = await Order.create({
      user_id: customers[0].id,
      customer_name: customers[0].name,
      customer_phone: customers[0].phone,
      order_type: 'delivery',
      status: 'ready',
      subtotal: 95000,
      discount: 0,
      delivery_fee: 15000,
      total: 110000,
      queue_number: 5,
      queue_date: now,
      delivery_address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      payment_method: 'e_wallet',
      paid_at: new Date(now.getTime() - 10 * 60 * 1000),
      loyalty_points_earned: 110,
    });

    await OrderItem.create({
      order_id: order5.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 2,
      price: products[0].price,
      subtotal: products[0].price * 2,
    });

    await OrderItem.create({
      order_id: order5.id,
      product_id: products[3].id,
      product_name: products[3].name,
      quantity: 2,
      price: products[3].price,
      subtotal: products[3].price * 2,
    });

    await Payment.create({
      order_id: order5.id,
      method: 'e_wallet',
      amount: 110000,
      status: 'verified',
      verified_at: new Date(now.getTime() - 10 * 60 * 1000),
    });

    orders.push(order5);
    log('   ✅ Order 5: READY (Delivery) - Driver can pickup', 'green');

    // Order 6: PENDING PAYMENT (new order)
    const order6 = await Order.create({
      user_id: customers[4].id,
      customer_name: customers[4].name,
      customer_phone: customers[4].phone,
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
    log('   ✅ Order 6: PENDING PAYMENT - Waiting for payment', 'green');

    // ==================== SUMMARY ====================
    logStep('📊 Seeder Summary');

    log(`\n✅ Staff Users:`, 'green');
    log('   - Admin: 081234567890 / admin123', 'blue');
    log('   - Kitchen: 081234567891 / kitchen123', 'blue');
    log('   - Driver: 081234567892 / driver123', 'blue');

    log(`\n✅ Customers: ${customers.length} (PIN: 123456)`, 'green');
    log(`✅ Products: ${products.length}`, 'green');
    log(`✅ Orders Created: ${orders.length}`, 'green');

    log('\n📋 Order Status Distribution:', 'cyan');
    const statusCount = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCount).forEach(([status, count]) => {
      log(`   - ${status.toUpperCase()}: ${count}`, 'blue');
    });

    log('\n🎯 Role-Based Test Flows:', 'yellow');
    log('\n   ADMIN (081234567890 / admin123):', 'yellow');
    log('   - View ALL orders', 'yellow');
    log('   - Manage users, products, payments', 'yellow');
    log('   - View reports and analytics', 'yellow');

    log('\n   KITCHEN (081234567891 / kitchen123):', 'yellow');
    log('   - View: PAID, PREPARING, READY orders', 'yellow');
    log('   - Update: PAID → PREPARING → READY', 'yellow');
    log('   - Orders #2, #3, #4, #5', 'yellow');

    log('\n   DRIVER (081234567892 / driver123):', 'yellow');
    log('   - View: Delivery orders only', 'yellow');
    log('   - Update: READY → OUT_FOR_DELIVERY → COMPLETED', 'yellow');
    log('   - Orders #5 (delivery)', 'yellow');

    log('\n   CUSTOMER (PIN: 123456):', 'yellow');
    log('   - Login with phone + PIN', 'yellow');
    log('   - View own orders', 'yellow');
    log('   - Track order status', 'yellow');

    logStep('🎉 Complete Role-Based Seeder Finished!');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Seeder Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

seedAllRoles();
