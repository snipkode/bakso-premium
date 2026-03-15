/**
 * Fresh Database Seed - Complete Order Flow Scenario
 * 
 * This seed creates:
 * 1. Staff users (Admin, Kitchen, Driver) with PIN
 * 2. Customer users with PIN
 * 3. Categories & Products
 * 4. Sample Orders in different statuses
 * 5. Payments
 * 6. Vouchers
 * 
 * Usage: node scripts/seed-fresh-order-flow.js
 */

const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { 
  User, Category, Product, Order, OrderItem, 
  Payment, Voucher, Review, LoyaltyPoint, QueueSetting 
} = require('../src/models');

async function seed() {
  try {
    console.log('🌱 Starting fresh database seed...\n');
    
    // ============================================
    // 1. CREATE STAFF USERS
    // ============================================
    console.log('👥 Creating staff users...');
    
    const passwordHash = await bcrypt.hash('admin123', 10);
    const pinHash = await bcrypt.hash('123456', 10);
    
    // PIN expiry dates
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const [admin] = await User.findOrCreate({
      where: { phone: '081234567890' },
      defaults: {
        name: 'Admin Bakso',
        phone: '081234567890',
        email: 'admin@bakso.com',
        password: passwordHash,
        role: 'admin',
        is_pin_set: true,
        pin_hash: pinHash,
        pin_reset_expires: oneMonthFromNow,
        status: 'active',
      }
    });
    console.log('  ✅ Admin created (PIN set, expires in 1 month)');
    
    const [kitchen] = await User.findOrCreate({
      where: { phone: '081234567891' },
      defaults: {
        name: 'Kitchen Staff',
        phone: '081234567891',
        password: passwordHash,
        role: 'kitchen',
        is_pin_set: true,
        pin_hash: pinHash,
        pin_reset_expires: oneMonthFromNow,
        status: 'active',
      }
    });
    console.log('  ✅ Kitchen created (PIN set, expires in 1 month)');
    
    const [driver] = await User.findOrCreate({
      where: { phone: '081234567892' },
      defaults: {
        name: 'Driver Staff',
        phone: '081234567892',
        password: passwordHash,
        role: 'driver',
        is_pin_set: true,
        pin_hash: pinHash,
        pin_reset_expires: oneMonthFromNow,
        status: 'active',
      }
    });
    console.log('  ✅ Driver created (PIN set, expires in 1 month)');
    
    // Staff without PIN (for 2FA testing)
    const [newStaff] = await User.findOrCreate({
      where: { phone: '089999999998' },
      defaults: {
        name: 'New Staff No PIN',
        phone: '089999999998',
        password: await bcrypt.hash('admin123', 10), // ✅ Hash inline
        role: 'driver',
        is_pin_set: false,
        pin_hash: null,
        status: 'active',
      }
    });
    console.log('  ✅ New Staff created (NO PIN - for 2FA testing)');
    
    // ============================================
    // 2. CREATE CUSTOMER USERS
    // ============================================
    console.log('\n👤 Creating customer users...');
    
    const [customer1] = await User.findOrCreate({
      where: { phone: '089999999999' },
      defaults: {
        name: 'Customer Regular',
        phone: '089999999999',
        role: 'customer',
        is_pin_set: true,
        pin_hash: pinHash,
        pin_reset_expires: threeMonthsFromNow, // 3 months for customer
        completed_orders: 5,
        loyalty_points: 500,
        status: 'active',
      }
    });
    console.log('  ✅ Customer 1 created (PIN set, expires in 3 months, 500 points)');
    
    const [customer2] = await User.findOrCreate({
      where: { phone: '089999999997' },
      defaults: {
        name: 'Customer New',
        phone: '089999999997',
        role: 'customer',
        is_pin_set: false,
        pin_hash: null,
        completed_orders: 0,
        loyalty_points: 0,
        status: 'active',
      }
    });
    console.log('  ✅ Customer 2 created (NO PIN - new user)');
    
    // ============================================
    // 3. CREATE CATEGORIES
    // ============================================
    console.log('\n📂 Creating categories...');
    
    const categories = await Category.bulkCreate([
      {
        name: 'Bakso',
        description: 'Aneka bakso daging sapi asli',
        icon: '🍜',
        sort_order: 1,
        is_active: true,
      },
      {
        name: 'Minuman',
        description: 'Aneka minuman segar',
        icon: '🥤',
        sort_order: 2,
        is_active: true,
      },
      {
        name: 'Makanan Pendamping',
        description: 'Pelengkap bakso',
        icon: '🍚',
        sort_order: 3,
        is_active: true,
      },
    ]);
    console.log(`  ✅ ${categories.length} categories created`);
    
    // ============================================
    // 4. CREATE PRODUCTS
    // ============================================
    console.log('\n🍽️  Creating products...');
    
    const baksoCategory = categories.find(c => c.name === 'Bakso');
    const drinkCategory = categories.find(c => c.name === 'Minuman');
    const sideCategory = categories.find(c => c.name === 'Makanan Pendamping');
    
    const products = await Product.bulkCreate([
      // Bakso products
      {
        category_id: baksoCategory.id,
        name: 'Bakso Urat',
        description: 'Bakso daging sapi dengan urat, tekstur kenyal',
        price: 15000,
        is_available: true,
        stock: 100,
        min_stock: 10,
        preparation_time: 10,
        is_featured: true,
      },
      {
        category_id: baksoCategory.id,
        name: 'Bakso Beranak',
        description: 'Bakso besar berisi bakso kecil di dalamnya',
        price: 25000,
        is_available: true,
        stock: 50,
        min_stock: 5,
        preparation_time: 15,
        is_featured: true,
      },
      {
        category_id: baksoCategory.id,
        name: 'Bakso Telur',
        description: 'Bakso dengan isian telur ayam utuh',
        price: 20000,
        is_available: true,
        stock: 75,
        min_stock: 10,
        preparation_time: 12,
        is_featured: false,
      },
      // Drinks
      {
        category_id: drinkCategory.id,
        name: 'Es Teh Manis',
        description: 'Teh manis dingin',
        price: 5000,
        is_available: true,
        stock: 200,
        min_stock: 20,
        preparation_time: 3,
        is_featured: false,
      },
      {
        category_id: drinkCategory.id,
        name: 'Es Jeruk',
        description: 'Jeruk peras segar',
        price: 8000,
        is_available: true,
        stock: 150,
        min_stock: 15,
        preparation_time: 5,
        is_featured: false,
      },
      // Side dishes
      {
        category_id: sideCategory.id,
        name: 'Nasi Putih',
        description: 'Nasi putih hangat',
        price: 5000,
        is_available: true,
        stock: 100,
        min_stock: 10,
        preparation_time: 2,
        is_featured: false,
      },
    ]);
    console.log(`  ✅ ${products.length} products created`);
    
    // ============================================
    // 5. CREATE SAMPLE ORDERS (Different Statuses)
    // ============================================
    console.log('\n📦 Creating sample orders...');
    
    const today = new Date();
    const queueDate = today.toISOString().split('T')[0];
    
    // Order 1: COMPLETED (Dine-in)
    const order1 = await Order.create({
      user_id: customer1.id,
      order_number: `BSO/${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}/0001`,
      queue_number: 1,
      queue_date: queueDate,
      customer_name: customer1.name,
      customer_phone: customer1.phone,
      order_type: 'dine-in',
      status: 'completed',
      subtotal: 35000,
      discount: 0,
      total: 35000,
      table_number: '5',
      paid_at: new Date(),
      completed_at: new Date(),
    });
    await OrderItem.create({
      order_id: order1.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 2,
      price: 15000,
      subtotal: 30000,
    });
    await OrderItem.create({
      order_id: order1.id,
      product_id: products[3].id,
      product_name: products[3].name,
      quantity: 1,
      price: 5000,
      subtotal: 5000,
    });
    console.log('  ✅ Order 1: COMPLETED (Dine-in, Table 5)');
    
    // Order 2: READY (Takeaway)
    const order2 = await Order.create({
      user_id: customer1.id,
      order_number: `BSO/${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}/0002`,
      queue_number: 2,
      queue_date: queueDate,
      customer_name: customer1.name,
      customer_phone: customer1.phone,
      order_type: 'takeaway',
      status: 'ready',
      subtotal: 25000,
      discount: 0,
      total: 25000,
      paid_at: new Date(),
      estimated_time: 15,
    });
    await OrderItem.create({
      order_id: order2.id,
      product_id: products[1].id,
      product_name: products[1].name,
      quantity: 1,
      price: 25000,
      subtotal: 25000,
    });
    console.log('  ✅ Order 2: READY (Takeaway)');
    
    // Order 3: PREPARING (Delivery)
    const order3 = await Order.create({
      user_id: customer1.id,
      order_number: `BSO/${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}/0003`,
      queue_number: 3,
      queue_date: queueDate,
      customer_name: customer1.name,
      customer_phone: customer1.phone,
      order_type: 'delivery',
      status: 'preparing',
      subtotal: 45000,
      delivery_fee: 10000,
      total: 55000,
      delivery_address: 'Jl. Mawar No. 123, Jakarta',
      paid_at: new Date(),
      estimated_time: 30,
    });
    await OrderItem.create({
      order_id: order3.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 2,
      price: 15000,
      subtotal: 30000,
    });
    await OrderItem.create({
      order_id: order3.id,
      product_id: products[4].id,
      product_name: products[4].name,
      quantity: 1,
      price: 8000,
      subtotal: 8000,
    });
    await OrderItem.create({
      order_id: order3.id,
      product_id: products[5].id,
      product_name: products[5].name,
      quantity: 1,
      price: 5000,
      subtotal: 5000,
    });
    console.log('  ✅ Order 3: PREPARING (Delivery)');
    
    // Order 4: PAID (Dine-in)
    const order4 = await Order.create({
      user_id: customer1.id,
      order_number: `BSO/${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}/0004`,
      queue_number: 4,
      queue_date: queueDate,
      customer_name: customer1.name,
      customer_phone: customer1.phone,
      order_type: 'dine-in',
      status: 'paid',
      subtotal: 20000,
      total: 20000,
      table_number: '3',
      paid_at: new Date(),
    });
    await OrderItem.create({
      order_id: order4.id,
      product_id: products[2].id,
      product_name: products[2].name,
      quantity: 1,
      price: 20000,
      subtotal: 20000,
    });
    console.log('  ✅ Order 4: PAID (Dine-in, Table 3)');
    
    // Order 5: PENDING_PAYMENT (Delivery)
    const order5 = await Order.create({
      user_id: customer2.id,
      order_number: `BSO/${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}/0005`,
      queue_number: null,
      queue_date: null,
      customer_name: customer2.name,
      customer_phone: customer2.phone,
      order_type: 'delivery',
      status: 'pending_payment',
      subtotal: 15000,
      delivery_fee: 10000,
      total: 25000,
      delivery_address: 'Jl. Melati No. 456, Jakarta',
    });
    await OrderItem.create({
      order_id: order5.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 1,
      price: 15000,
      subtotal: 15000,
    });
    console.log('  ✅ Order 5: PENDING_PAYMENT (Delivery)');
    
    // ============================================
    // 6. CREATE PAYMENTS
    // ============================================
    console.log('\n💳 Creating payments...');
    
    // Payment for completed order
    await Payment.create({
      order_id: order1.id,
      method: 'qris',
      amount: 35000,
      status: 'verified',
      transaction_id: 'QRIS001',
      verified_at: new Date(),
    });
    
    // Payment for ready order
    await Payment.create({
      order_id: order2.id,
      method: 'bank_transfer',
      amount: 25000,
      status: 'verified',
      bank_name: 'BCA',
      account_number: '1234567890',
      transaction_id: 'TRF002',
      verified_at: new Date(),
    });
    
    // Payment for preparing order
    await Payment.create({
      order_id: order3.id,
      method: 'e_wallet',
      amount: 55000,
      status: 'verified',
      e_wallet_type: 'GoPay',
      transaction_id: 'GP003',
      verified_at: new Date(),
    });
    
    // Payment for paid order
    await Payment.create({
      order_id: order4.id,
      method: 'qris',
      amount: 20000,
      status: 'verified',
      transaction_id: 'QRIS004',
      verified_at: new Date(),
    });
    
    // Payment for pending order
    await Payment.create({
      order_id: order5.id,
      method: 'cod',
      amount: 25000,
      status: 'pending',
    });
    
    console.log('  ✅ 5 payments created');
    
    // ============================================
    // 7. CREATE VOUCHERS
    // ============================================
    console.log('\n🎫 Creating vouchers...');
    
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);
    
    await Voucher.bulkCreate([
      {
        code: 'BAKSO10',
        name: 'Diskon 10%',
        description: 'Diskon 10% untuk minimal pembelian 50rb',
        type: 'percentage',
        value: 10,
        min_purchase: 50000,
        max_discount: 20000,
        usage_limit: 100,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: true,
      },
      {
        code: 'GRATIS5',
        name: 'Potongan 5rb',
        description: 'Potongan 5rb untuk minimal pembelian 30rb',
        type: 'fixed',
        value: 5000,
        min_purchase: 30000,
        usage_limit: 50,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: true,
      },
    ]);
    console.log('  ✅ 2 vouchers created');
    
    // ============================================
    // 8. CREATE QUEUE SETTINGS
    // ============================================
    console.log('\n🎫 Creating queue settings...');
    
    await QueueSetting.create({
      date: queueDate,
      current_queue: 4,
      total_orders: 4,
      is_active: true,
    });
    console.log('  ✅ Queue settings created (current: 4)');
    
    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('  - Staff: 4 users (3 with PIN, 1 without)');
    console.log('  - Customers: 2 users (1 with PIN, 1 without)');
    console.log('  - Categories: 3');
    console.log('  - Products: 6');
    console.log('  - Orders: 5 (various statuses)');
    console.log('  - Payments: 5');
    console.log('  - Vouchers: 2');
    console.log('\n🔐 Login Credentials:');
    console.log('  - Admin: 081234567890 / admin123 (PIN: 123456)');
    console.log('  - Kitchen: 081234567891 / admin123 (PIN: 123456)');
    console.log('  - Driver: 081234567892 / admin123 (PIN: 123456)');
    console.log('  - New Staff: 089999999998 / admin123 (NO PIN - 2FA test)');
    console.log('  - Customer 1: 089999999999 (PIN: 123456)');
    console.log('  - Customer 2: 089999999997 (NO PIN)');
    console.log('\n📦 Order Statuses:');
    console.log('  - Order 001: COMPLETED (Dine-in)');
    console.log('  - Order 002: READY (Takeaway)');
    console.log('  - Order 003: PREPARING (Delivery)');
    console.log('  - Order 004: PAID (Dine-in)');
    console.log('  - Order 005: PENDING_PAYMENT (Delivery)');
    console.log('\n🎯 Ready for testing!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
