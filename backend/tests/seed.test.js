const { sequelize, User } = require('../src/models');

describe('Database Seeder - User Tests', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Staff Users', () => {
    test('should have admin user', async () => {
      const admin = await User.findOne({ where: { role: 'admin' } });
      
      expect(admin).toBeTruthy();
      expect(admin.name).toBe('Admin');
      expect(admin.phone).toBe('081234567890');
      expect(admin.role).toBe('admin');
      expect(admin.status).toBe('active');
      expect(admin.password).toBeDefined();
      expect(admin.password.length).toBeGreaterThan(50);
    });

    test('should have kitchen staff user', async () => {
      const kitchen = await User.findOne({ where: { role: 'kitchen' } });
      
      expect(kitchen).toBeTruthy();
      expect(kitchen.name).toBe('Kitchen Staff');
      expect(kitchen.phone).toBe('081234567891');
      expect(kitchen.role).toBe('kitchen');
      expect(kitchen.status).toBe('active');
      expect(kitchen.password).toBeDefined();
      expect(kitchen.password.length).toBeGreaterThan(50);
    });

    test('should have driver user', async () => {
      const driver = await User.findOne({ where: { role: 'driver' } });
      
      expect(driver).toBeTruthy();
      expect(driver.name).toBe('Driver');
      expect(driver.phone).toBe('081234567892');
      expect(driver.role).toBe('driver');
      expect(driver.status).toBe('active');
      expect(driver.password).toBeDefined();
      expect(driver.password.length).toBeGreaterThan(50);
    });
  });

  describe('Demo Customers', () => {
    test('should have 5 demo customers', async () => {
      const customers = await User.findAll({ where: { role: 'customer' } });
      
      expect(customers.length).toBe(5);
    });

    test('should have customer Budi Santoso', async () => {
      const budi = await User.findOne({ where: { phone: '081234567893' } });
      
      expect(budi).toBeTruthy();
      expect(budi.name).toBe('Budi Santoso');
      expect(budi.role).toBe('customer');
      expect(budi.status).toBe('active');
      expect(budi.completed_orders).toBe(5);
      expect(budi.loyalty_points).toBe(500);
      expect(budi.password).toBeDefined();
      expect(budi.password.length).toBeGreaterThan(50);
    });

    test('should have customer Siti Nurhaliza', async () => {
      const siti = await User.findOne({ where: { phone: '081234567894' } });
      
      expect(siti).toBeTruthy();
      expect(siti.name).toBe('Siti Nurhaliza');
      expect(siti.role).toBe('customer');
      expect(siti.status).toBe('active');
      expect(siti.completed_orders).toBe(3);
      expect(siti.loyalty_points).toBe(300);
      expect(siti.password).toBeDefined();
      expect(siti.password.length).toBeGreaterThan(50);
    });

    test('should have customer Ahmad Rizki', async () => {
      const ahmad = await User.findOne({ where: { phone: '081234567895' } });
      
      expect(ahmad).toBeTruthy();
      expect(ahmad.name).toBe('Ahmad Rizki');
      expect(ahmad.role).toBe('customer');
      expect(ahmad.status).toBe('active');
      expect(ahmad.completed_orders).toBe(10);
      expect(ahmad.loyalty_points).toBe(1000);
      expect(ahmad.password).toBeDefined();
      expect(ahmad.password.length).toBeGreaterThan(50);
    });

    test('should have customer Dewi Lestari', async () => {
      const dewi = await User.findOne({ where: { phone: '081234567896' } });
      
      expect(dewi).toBeTruthy();
      expect(dewi.name).toBe('Dewi Lestari');
      expect(dewi.role).toBe('customer');
      expect(dewi.status).toBe('active');
      expect(dewi.completed_orders).toBe(1);
      expect(dewi.loyalty_points).toBe(100);
      expect(dewi.password).toBeDefined();
      expect(dewi.password.length).toBeGreaterThan(50);
    });

    test('should have customer Eko Prasetyo (new user)', async () => {
      const eko = await User.findOne({ where: { phone: '081234567897' } });
      
      expect(eko).toBeTruthy();
      expect(eko.name).toBe('Eko Prasetyo');
      expect(eko.role).toBe('customer');
      expect(eko.status).toBe('active');
      expect(eko.completed_orders).toBe(0);
      expect(eko.loyalty_points).toBe(0);
      expect(eko.password).toBeDefined();
      expect(eko.password.length).toBeGreaterThan(50);
    });
  });

  describe('User Data Validation', () => {
    test('all users should have unique phone numbers', async () => {
      const users = await User.findAll();
      const phones = users.map(u => u.phone);
      const uniquePhones = [...new Set(phones)];
      
      expect(phones.length).toBe(uniquePhones.length);
    });

    test('all users should have hashed passwords', async () => {
      const users = await User.findAll();
      
      users.forEach(user => {
        // bcrypt hashes start with $2a$, $2b$, or $2y$
        expect(user.password).toMatch(/^\$2[aby]\$/);
      });
    });

    test('all users should have valid status', async () => {
      const users = await User.findAll();
      const validStatuses = ['active', 'inactive', 'blocked'];
      
      users.forEach(user => {
        expect(validStatuses).toContain(user.status);
      });
    });

    test('all users should have valid role', async () => {
      const users = await User.findAll();
      const validRoles = ['customer', 'admin', 'kitchen', 'driver'];
      
      users.forEach(user => {
        expect(validRoles).toContain(user.role);
      });
    });
  });

  describe('User Count Summary', () => {
    test('should have total 8 users', async () => {
      const totalUsers = await User.count();
      expect(totalUsers).toBe(8);
    });

    test('should have correct user distribution', async () => {
      const adminCount = await User.count({ where: { role: 'admin' } });
      const kitchenCount = await User.count({ where: { role: 'kitchen' } });
      const driverCount = await User.count({ where: { role: 'driver' } });
      const customerCount = await User.count({ where: { role: 'customer' } });
      
      expect(adminCount).toBe(1);
      expect(kitchenCount).toBe(1);
      expect(driverCount).toBe(1);
      expect(customerCount).toBe(5);
    });
  });
});
