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
    await User.create({
      name: 'Admin',
      phone: '081234567890',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      status: 'active',
    });
    console.log('✅ Admin created (phone: 081234567890, password: admin123)');

    // Create kitchen staff
    await User.create({
      name: 'Kitchen Staff',
      phone: '081234567891',
      password: await bcrypt.hash('kitchen123', 10),
      role: 'kitchen',
      status: 'active',
    });
    console.log('✅ Kitchen staff created');

    // Create driver
    await User.create({
      name: 'Driver',
      phone: '081234567892',
      password: await bcrypt.hash('driver123', 10),
      role: 'driver',
      status: 'active',
    });
    console.log('✅ Driver created');

    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Bakso Utama',
        description: 'Menu bakso utama kami',
        icon: '🍜',
        order: 1,
      },
      {
        name: 'Bakso Kecil',
        description: 'Porsi kecil untuk yang lapar ringan',
        icon: '🥟',
        order: 2,
      },
      {
        name: 'Minuman',
        description: 'Berbagai pilihan minuman segar',
        icon: '🥤',
        order: 3,
      },
      {
        name: 'Makanan Pendamping',
        description: 'Teman makan bakso Anda',
        icon: '🍢',
        order: 4,
      },
    ]);
    console.log('✅ Categories created');

    // Create products
    const products = await Product.bulkCreate([
      // Bakso Utama
      {
        category_id: categories[0].id,
        name: 'Bakso Beranak',
        description: 'Bakso besar isi bakso kecil + telur puyuh',
        price: 35000,
        image: '/images/bakso-beranak.jpg',
        is_featured: true,
        preparation_time: 10,
        spicy_level: 0,
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
        image: '/images/bakso-komplit.jpg',
        is_featured: true,
        preparation_time: 8,
        spicy_level: 0,
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Urat',
        description: 'Bakso dengan tekstur urat yang kenyal',
        price: 25000,
        image: '/images/bakso-urat.jpg',
        is_featured: true,
        preparation_time: 8,
        spicy_level: 0,
      },
      {
        category_id: categories[0].id,
        name: 'Bakso Halus',
        description: 'Bakso halus dengan kuah gurih',
        price: 20000,
        image: '/images/bakso-halus.jpg',
        is_featured: false,
        preparation_time: 8,
        spicy_level: 0,
      },

      // Bakso Kecil
      {
        category_id: categories[1].id,
        name: 'Bakso Kecil (5 butir)',
        description: 'Porsi kecil 5 butir bakso',
        price: 12000,
        image: '/images/bakso-kecil.jpg',
        is_featured: false,
        preparation_time: 5,
        spicy_level: 0,
      },
      {
        category_id: categories[1].id,
        name: 'Tahu Bakso',
        description: 'Tahu isi bakso dengan kuah',
        price: 10000,
        image: '/images/tahu-bakso.jpg',
        is_featured: false,
        preparation_time: 5,
        spicy_level: 0,
      },

      // Minuman
      {
        category_id: categories[2].id,
        name: 'Es Teh Manis',
        description: 'Teh manis dingin',
        price: 5000,
        image: '/images/es-teh.jpg',
        is_featured: false,
        preparation_time: 2,
        spicy_level: 0,
      },
      {
        category_id: categories[2].id,
        name: 'Es Jeruk',
        description: 'Jeruk peras segar',
        price: 8000,
        image: '/images/es-jeruk.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
      },
      {
        category_id: categories[2].id,
        name: 'Es Campur',
        description: 'Es campur spesial',
        price: 15000,
        image: '/images/es-campur.jpg',
        is_featured: true,
        preparation_time: 5,
        spicy_level: 0,
      },

      // Makanan Pendamping
      {
        category_id: categories[3].id,
        name: 'Gorengan (3 pcs)',
        description: 'Bakwan + Tahu Isi + Tempe',
        price: 10000,
        image: '/images/gorengan.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
      },
      {
        category_id: categories[3].id,
        name: 'Lumpia Goreng',
        description: 'Lumpia goreng renyah (2 pcs)',
        price: 12000,
        image: '/images/lumpia.jpg',
        is_featured: false,
        preparation_time: 3,
        spicy_level: 0,
      },
    ]);
    console.log('✅ Products created');

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
    console.log('   Admin:    081234567890 / admin123');
    console.log('   Kitchen:  081234567891 / kitchen123');
    console.log('   Driver:   081234567892 / driver123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
