require('dotenv').config();
const { sequelize, User, Category, Product, Voucher } = require('../src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding production-ready database...\n');

    // Sync database (force clean)
    await sequelize.sync({ force: true });
    console.log('✅ Database cleaned and synced\n');

    // Create admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Administrator', '081234567890', '${adminHash}', 'admin', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Admin created');

    // Create kitchen staff
    const kitchenHash = await bcrypt.hash('kitchen123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Kitchen Staff', '081234567891', '${kitchenHash}', 'kitchen', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Kitchen staff created');

    // Create driver
    const driverHash = await bcrypt.hash('driver123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt)
      VALUES (UUID(), 'Driver Staff', '081234567892', '${driverHash}', 'driver', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Driver created');

    // Create demo customers
    const customerHash = await bcrypt.hash('customer123', 10);
    await sequelize.query(`INSERT INTO user (id, name, phone, password, role, status, completed_orders, loyalty_points, createdAt, updatedAt) VALUES
      (UUID(), 'Budi Santoso', '081234567893', '${customerHash}', 'customer', 'active', 5, 500, NOW(), NOW()),
      (UUID(), 'Siti Nurhaliza', '081234567894', '${customerHash}', 'customer', 'active', 3, 300, NOW(), NOW()),
      (UUID(), 'Ahmad Rizki', '081234567895', '${customerHash}', 'customer', 'active', 10, 1000, NOW(), NOW()),
      (UUID(), 'Dewi Lestari', '081234567896', '${customerHash}', 'customer', 'active', 1, 100, NOW(), NOW()),
      (UUID(), 'Eko Prasetyo', '081234567897', '${customerHash}', 'customer', 'active', 0, 0, NOW(), NOW())`);
    console.log('✅ Demo customers created\n');

    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Bakso Utama',
        description: 'Menu bakso utama dengan porsi besar',
        icon: '🍜',
        sort_order: 1,
        is_active: true,
      },
      {
        name: 'Bakso Kecil',
        description: 'Porsi kecil untuk yang lapar ringan',
        icon: '🥟',
        sort_order: 2,
        is_active: true,
      },
      {
        name: 'Minuman',
        description: 'Berbagai pilihan minuman segar',
        icon: '🥤',
        sort_order: 3,
        is_active: true,
      },
      {
        name: 'Makanan Pendamping',
        description: 'Teman makan bakso Anda',
        icon: '🍢',
        sort_order: 4,
        is_active: true,
      },
    ]);
    console.log('✅ Categories created\n');

    // Create products
    const products = await Product.bulkCreate([
      // Bakso Utama
      {
        category_id: categories[0].id,
        name: 'Bakso Beranak',
        description: 'Bakso besar isi bakso kecil + telur puyuh + kuah gurih',
        price: 35000,
        image: '/uploads/products/bakso-beranak.jpg',
        is_featured: true,
        is_available: true,
        preparation_time: 10,
        spicy_level: 0,
        stock: 50,
        min_stock: 10,
        total_sold: 120,
        customizations: [
          { name: 'Level Pedas', options: ['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'], price: 0 },
          { name: 'Tambahan Mie', options: ['Ya'], price: 5000 },
        ],
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Komplit',
        description: 'Bakso halus + bakso urat + tahu + siomay + pangsit',
        price: 30000,
        image: '/uploads/products/bakso-komplit.jpg',
        is_featured: true,
        is_available: true,
        preparation_time: 8,
        spicy_level: 0,
        stock: 60,
        min_stock: 15,
        total_sold: 95,
        customizations: [
          { name: 'Level Pedas', options: ['Tidak Pedas', 'Sedang', 'Pedas'], price: 0 },
        ],
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Urat Besar',
        description: 'Bakso dengan tekstur urat yang kenyal dan besar',
        price: 25000,
        image: '/uploads/products/bakso-urat.jpg',
        is_featured: true,
        is_available: true,
        preparation_time: 8,
        spicy_level: 0,
        stock: 80,
        min_stock: 20,
        total_sold: 78,
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Halus',
        description: 'Bakso halus dengan kuah kaldu sapi asli',
        price: 20000,
        image: '/uploads/products/bakso-halus.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 8,
        spicy_level: 0,
        stock: 100,
        min_stock: 25,
        total_sold: 65,
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Telur',
        description: 'Bakso besar dengan telur ayam di dalamnya',
        price: 28000,
        image: '/uploads/products/bakso-telur.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 10,
        spicy_level: 0,
        stock: 45,
        min_stock: 10,
        total_sold: 52,
      },

      // Bakso Kecil
      {
        category_id: categories[1].id,
        name: 'Bakso Kecil (5 butir)',
        description: 'Porsi kecil 5 butir bakso halus',
        price: 12000,
        image: '/uploads/products/bakso-kecil.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 150,
        min_stock: 30,
        total_sold: 200,
      },
      {
        category_id: categories[1].id,
        name: 'Tahu Bakso',
        description: 'Tahu putih isi bakso dengan kuah',
        price: 10000,
        image: '/uploads/products/tahu-bakso.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 100,
        min_stock: 20,
        total_sold: 88,
      },
      {
        category_id: categories[1].id,
        name: 'Siomay Bakso',
        description: 'Siomay ikan dengan bakso (5 pcs)',
        price: 15000,
        image: '/uploads/products/siomay.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 80,
        min_stock: 15,
        total_sold: 70,
      },

      // Minuman
      {
        category_id: categories[2].id,
        name: 'Es Teh Manis',
        description: 'Teh manis dingin segar',
        price: 5000,
        image: '/uploads/products/es-teh.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 2,
        spicy_level: 0,
        stock: 200,
        min_stock: 50,
        total_sold: 350,
      },
      {
        category_id: categories[2].id,
        name: 'Es Jeruk Peras',
        description: 'Jeruk peras segar tanpa pemanis buatan',
        price: 8000,
        image: '/uploads/products/es-jeruk.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 3,
        spicy_level: 0,
        stock: 180,
        min_stock: 40,
        total_sold: 280,
      },
      {
        category_id: categories[2].id,
        name: 'Es Campur Spesial',
        description: 'Es campur dengan buah, nata de coco, dan susu',
        price: 15000,
        image: '/uploads/products/es-campur.jpg',
        is_featured: true,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 80,
        min_stock: 15,
        total_sold: 120,
      },
      {
        category_id: categories[2].id,
        name: 'Es Coklat',
        description: 'Coklat dingin dengan susu dan whipped cream',
        price: 12000,
        image: '/uploads/products/es-coklat.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 3,
        spicy_level: 0,
        stock: 100,
        min_stock: 20,
        total_sold: 95,
      },
      {
        category_id: categories[2].id,
        name: 'Jus Alpukat',
        description: 'Alpukat segar dengan coklat dan susu',
        price: 18000,
        image: '/uploads/products/jus-alpukat.jpg',
        is_featured: true,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 60,
        min_stock: 10,
        total_sold: 85,
      },

      // Makanan Pendamping
      {
        category_id: categories[3].id,
        name: 'Gorengan Mix (3 pcs)',
        description: 'Bakwan + Tahu Isi + Tempe Mendoan',
        price: 10000,
        image: '/uploads/products/gorengan.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 3,
        spicy_level: 0,
        stock: 120,
        min_stock: 25,
        total_sold: 180,
      },
      {
        category_id: categories[3].id,
        name: 'Lumpia Goreng (2 pcs)',
        description: 'Lumpia goreng renyah isi sayuran',
        price: 12000,
        image: '/uploads/products/lumpia.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 3,
        spicy_level: 0,
        stock: 100,
        min_stock: 20,
        total_sold: 150,
      },
      {
        category_id: categories[3].id,
        name: 'Pangsit Goreng (5 pcs)',
        description: 'Pangsit goreng renyah dengan saus',
        price: 15000,
        image: '/uploads/products/pangsit.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 5,
        spicy_level: 0,
        stock: 90,
        min_stock: 15,
        total_sold: 110,
      },
      {
        category_id: categories[3].id,
        name: 'Kerupuk Putih',
        description: 'Kerupuk putih renyah (1 pack)',
        price: 5000,
        image: '/uploads/products/kerupuk.jpg',
        is_featured: false,
        is_available: true,
        preparation_time: 1,
        spicy_level: 0,
        stock: 200,
        min_stock: 50,
        total_sold: 220,
      },
    ]);
    console.log('✅ Products created with stock management\n');

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
        usage_count: 0,
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
        max_discount: 10000,
        usage_limit: 50,
        usage_count: 0,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        is_active: true,
      },
      {
        code: 'HEMAT5K',
        name: 'Hemat 5 Ribu',
        description: 'Diskon Rp 5.000 untuk pembelian minimal Rp 25.000',
        type: 'fixed',
        value: 5000,
        min_purchase: 25000,
        max_discount: 5000,
        usage_limit: 200,
        usage_count: 0,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        is_active: true,
      },
    ]);
    console.log('✅ Vouchers created\n');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   Admin:     081234567890 / admin123');
    console.log('   Kitchen:   081234567891 / kitchen123');
    console.log('   Driver:    081234567892 / driver123');
    console.log('');
    console.log('   Customer 1: 081234567893 / customer123 (Budi Santoso)');
    console.log('   Customer 2: 081234567894 / customer123 (Siti Nurhaliza)');
    console.log('   Customer 3: 081234567895 / customer123 (Ahmad Rizki)');
    console.log('   Customer 4: 081234567896 / customer123 (Dewi Lestari)');
    console.log('   Customer 5: 081234567897 / customer123 (Eko Prasetyo)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📦 DATA SUMMARY:');
    console.log('   - 4 Categories');
    console.log('   - 17 Products');
    console.log('   - 3 Vouchers');
    console.log('   - 8 Users (1 Admin, 1 Kitchen, 1 Driver, 5 Customers)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
