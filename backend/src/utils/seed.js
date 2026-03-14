require('dotenv').config();
const { sequelize, User, Category, Product, Voucher } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Admin', '081234567890', '${adminHash}', 'admin', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Admin created (phone: 081234567890, password: admin123)');

    // Create kitchen staff
    const kitchenHash = await bcrypt.hash('kitchen123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Kitchen Staff', '081234567891', '${kitchenHash}', 'kitchen', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Kitchen staff created');

    // Create driver
    const driverHash = await bcrypt.hash('driver123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Driver', '081234567892', '${driverHash}', 'driver', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Driver created');

    // Create demo customers
    const customerHash = await bcrypt.hash('customer123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt) VALUES
      (UUID(), 'Budi Santoso', '081234567893', '${customerHash}', 'customer', 'active', 5, 500, NOW(), NOW()),
      (UUID(), 'Siti Nurhaliza', '081234567894', '${customerHash}', 'customer', 'active', 3, 300, NOW(), NOW()),
      (UUID(), 'Ahmad Rizki', '081234567895', '${customerHash}', 'customer', 'active', 10, 1000, NOW(), NOW()),
      (UUID(), 'Dewi Lestari', '081234567896', '${customerHash}', 'customer', 'active', 1, 100, NOW(), NOW()),
      (UUID(), 'Eko Prasetyo', '081234567897', '${customerHash}', 'customer', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Demo customers created');

    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Bakso Utama',
        description: 'Menu bakso utama kami',
        icon: '🍜',
        sort_order: 1,
      },
      {
        name: 'Bakso Kecil',
        description: 'Porsi kecil untuk yang lapar ringan',
        icon: '🥟',
        sort_order: 2,
      },
      {
        name: 'Minuman',
        description: 'Berbagai pilihan minuman segar',
        icon: '🥤',
        sort_order: 3,
      },
      {
        name: 'Makanan Pendamping',
        description: 'Teman makan bakso Anda',
        icon: '🍢',
        sort_order: 4,
      },
    ]);
    console.log('✅ Categories created');

    // Create products with stock and min_stock
    const products = await Product.bulkCreate([
      // Bakso Utama
      {
        category_id: categories[0].id,
        name: 'Bakso Beranak',
        description: 'Bakso besar isi bakso kecil + telur puyuh',
        price: 35000,
        image: '/uploads/products/bakso-beranak.jpg',
        is_featured: true,
        preparation_time: 10,
        spicy_level: 0,
        stock: 50,
        min_stock: 10,
        customizations: [
          { name: 'Level Pedas', options: ['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'], price: 0 },
          { name: 'Tambahan Mie', options: ['Ya'], price: 5000 },
        ],
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Komplit',
        description: 'Bakso halus + bakso urat + tahu + siomay',
        price: 30000,
        image: '/uploads/products/bakso-komplit.jpg',
        is_featured: true,
        preparation_time: 8,
        spicy_level: 0,
        stock: 60,
        min_stock: 15,
        customizations: [
          { name: 'Level Pedas', options: ['Tidak Pedas', 'Sedang', 'Pedas'], price: 0 },
        ],
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Urat',
        description: 'Bakso dengan tekstur urat yang kenyal',
        price: 25000,
        image: '/uploads/products/bakso-urat.jpg',
        is_featured: true,
        preparation_time: 8,
        spicy_level: 0,
        stock: 80,
        min_stock: 20,
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Halus',
        description: 'Bakso halus dengan kuah gurih',
        price: 20000,
        image: '/uploads/products/bakso-halus.jpg',
        is_featured: false,
        preparation_time: 8,
        spicy_level: 0,
        stock: 100,
        min_stock: 25,
      },

      // Bakso Kecil
      {
        category_id: categories[1].id,
        name: 'Bakso Kecil (5 butir)',
        description: 'Porsi kecil 5 butir bakso',
        price: 12000,
        image: '/uploads/products/bakso-kecil.jpg',
        is_featured: false,
        preparation_time: 5,
        spicy_level: 0,
        stock: 150,
        min_stock: 30,
      },
      {
        category_id: categories[1].id,
        name: 'Tahu Bakso',
        description: 'Tahu isi bakso dengan kuah',
        price: 10000,
        image: '/uploads/products/tahu-bakso.jpg',
        is_featured: false,
        preparation_time: 5,
        spicy_level: 0,
        stock: 100,
        min_stock: 20,
      },

      // Minuman
      {
        category_id: categories[2].id,
        name: 'Es Teh Manis',
        description: 'Teh manis dingin',
        price: 5000,
        image: '/uploads/products/es-teh.jpg',
        is_featured: false,
        preparation_time: 2,
        spicy_level: 0,
        stock: 200,
        min_stock: 50,
      },
      {
        category_id: categories[2].id,
        name: 'Es Jeruk',
        description: 'Jeruk peras segar',
        price: 8000,
        image: '/uploads/products/es-jeruk.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
        stock: 180,
        min_stock: 40,
      },
      {
        category_id: categories[2].id,
        name: 'Es Campur',
        description: 'Es campur spesial',
        price: 15000,
        image: '/uploads/products/es-campur.jpg',
        is_featured: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 80,
        min_stock: 15,
      },

      // Makanan Pendamping
      {
        category_id: categories[3].id,
        name: 'Gorengan (3 pcs)',
        description: 'Bakwan + Tahu Isi + Tempe',
        price: 10000,
        image: '/uploads/products/gorengan.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
        stock: 120,
        min_stock: 25,
      },
      {
        category_id: categories[3].id,
        name: 'Lumpia Goreng',
        description: 'Lumpia goreng renyah (2 pcs)',
        price: 12000,
        image: '/uploads/products/lumpia.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
        stock: 100,
        min_stock: 20,
      },
    ]);
    console.log('✅ Products created with stock management');

    // Create vouchers
    await Voucher.bulkCreate([
      {
        code: 'BAKSO10',
        name: 'Diskon 10%',
        description: 'Diskon 10% untuk pembelian minimal Rp 50.000',
        type: 'percentage',
        value: 10,
        min_purchase: 50000,
        max_discount: 20000,
        usage_limit: 100,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_active: true,
      },
      {
        code: 'NEWUSER',
        name: 'New User Discount',
        description: 'Diskon Rp 10.000 untuk pengguna baru',
        type: 'fixed',
        value: 10000,
        min_purchase: 30000,
        usage_limit: 50,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        is_active: true,
      },
    ]);
    console.log('✅ Vouchers created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Login credentials:');
    console.log('   Admin:     081234567890 / admin123');
    console.log('   Kitchen:   081234567891 / kitchen123');
    console.log('   Driver:    081234567892 / driver123');
    console.log('   Customer:  081234567893 / customer123 (Budi)');
    console.log('   Customer:  081234567894 / customer123 (Siti)');
    console.log('   Customer:  081234567895 / customer123 (Ahmad)');
    console.log('   Customer:  081234567896 / customer123 (Dewi)');
    console.log('   Customer:  081234567897 / customer123 (Eko)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
