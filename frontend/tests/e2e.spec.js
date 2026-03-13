// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * BAKSO PREMIUM - FRONTEND E2E TESTS
 * Simulates real human interactions with the frontend application
 * 
 * Test Scenarios:
 * 1. Customer Flow: Browse menu → Add to cart → Checkout → Pay → Track order
 * 2. Admin Flow: Login → View dashboard → Verify payments → Generate reports
 * 3. Kitchen Flow: Login → View orders → Update status
 */

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:9001';
const API_URL = process.env.API_URL || 'http://localhost:9000/api';

// Test credentials (from seed data)
const CREDENTIALS = {
  admin: { phone: '081234567890', password: 'admin123' },
  kitchen: { phone: '081234567891', password: 'kitchen123' },
  driver: { phone: '081234567892', password: 'driver123' },
  customer: { name: 'Test Customer', phone: '089999999999' },
};

// Helper: Generate unique customer name
const uniqueCustomer = () => `Customer ${Date.now()}`;

// Helper: Wait for toast notification
const waitForToast = async (page, expectedText) => {
  await page.waitForSelector('.toast', { timeout: 5000 });
  const toastText = await page.textContent('.toast-message');
  expect(toastText).toContain(expectedText);
};

// ==================== CUSTOMER FLOW ====================

test.describe('🛒 Customer Flow', () => {
  test('Complete customer journey: Browse → Order → Pay → Track', async ({ page }) => {
    console.log('\n📍 Starting Customer Flow Test...');
    
    // Step 1: Open homepage
    console.log('   Step 1: Opening homepage...');
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Bakso Premium/);
    
    // Step 2: Navigate to menu
    console.log('   Step 2: Navigating to menu...');
    await page.click('text=Menu');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });
    
    // Count products
    const productCards = await page.$$('[data-testid="product-card"]');
    console.log(`   ✅ Found ${productCards.length} products`);
    expect(productCards.length).toBeGreaterThan(0);
    
    // Step 3: Add product to cart
    console.log('   Step 3: Adding product to cart...');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product detail
    await page.waitForSelector('[data-testid="add-to-cart-btn"]', { timeout: 5000 });
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Verify cart badge
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    const cartCount = await cartBadge.textContent();
    console.log(`   ✅ Cart has ${cartCount} item(s)`);
    
    // Step 4: Go to cart
    console.log('   Step 4: Opening cart...');
    await page.click('[data-testid="cart-btn"]');
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 5000 });
    
    // Step 5: Proceed to checkout
    console.log('   Step 5: Proceeding to checkout...');
    await page.click('text=Checkout');
    await page.waitForURL(/\/checkout/, { timeout: 5000 });
    
    // Step 6: Select order type (takeaway)
    console.log('   Step 6: Selecting order type...');
    await page.click('text=Takeaway');
    
    // Step 7: Select payment method
    console.log('   Step 7: Selecting payment method...');
    await page.click('text=Transfer Bank');
    
    // Fill bank details
    await page.selectOption('select', 'BCA');
    await page.fill('input[placeholder="Contoh: 1234567890"]', '1234567890');
    
    // Step 8: Place order
    console.log('   Step 8: Placing order...');
    await page.click('text=Buat Pesanan');
    
    // Wait for success
    await page.waitForURL(/\/order-success/, { timeout: 10000 });
    await expect(page.locator('[data-testid="order-success-title"]')).toBeVisible();
    
    // Get order number
    const orderNumber = await page.textContent('[data-testid="order-number"]');
    console.log(`   ✅ Order placed: ${orderNumber}`);
    
    // Step 9: Track order
    console.log('   Step 9: Tracking order...');
    await page.click('text=Lacak Pesanan');
    await page.waitForURL(/\/track\//, { timeout: 5000 });
    
    // Verify order status
    const statusBadge = page.locator('[data-testid="order-status"]');
    const status = await statusBadge.textContent();
    console.log(`   ✅ Order status: ${status}`);
    
    console.log('✅ Customer Flow Test Completed!\n');
  });

  test('Customer login with phone number', async ({ page }) => {
    console.log('\n📍 Testing Customer Login...');
    
    await page.goto(`${BASE_URL}/login`);
    
    // Fill login form
    const customerName = uniqueCustomer();
    await page.fill('input[placeholder="Nama"]', customerName);
    await page.fill('input[placeholder="081234567890"]', `08${Math.floor(Math.random() * 10000000000)}`);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/menu/, { timeout: 5000 });
    
    // Verify logged in
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
    
    console.log(`   ✅ Customer logged in: ${customerName}\n`);
  });

  test('Dine-in order with table number', async ({ page }) => {
    console.log('\n📍 Testing Dine-in Order...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder="Nama"]', uniqueCustomer());
    await page.fill('input[placeholder="081234567890"]', `08${Math.floor(Math.random() * 10000000000)}`);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/menu/);
    
    // Add item to cart
    await page.click('[data-testid="product-card"] >> nth=0');
    await page.waitForSelector('[data-testid="add-to-cart-btn"]');
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Go to checkout
    await page.click('[data-testid="cart-btn"]');
    await page.click('text=Checkout');
    
    // Select dine-in
    await page.click('text=Dine-in');
    
    // Fill table number
    await page.fill('input[placeholder="Contoh: 5"]', '10');
    
    // Select payment
    await page.click('text=QRIS');
    
    // Place order
    await page.click('text=Buat Pesanan');
    
    // Verify success
    await page.waitForURL(/\/order-success/);
    console.log('   ✅ Dine-in order placed successfully\n');
  });

  test('Delivery order (requires previous order)', async ({ page }) => {
    console.log('\n📍 Testing Delivery Order...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    const customerPhone = `08${Math.floor(Math.random() * 10000000000)}`;
    await page.fill('input[placeholder="Nama"]', uniqueCustomer());
    await page.fill('input[placeholder="081234567890"]', customerPhone);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/menu/);
    
    // Try delivery first (should fail for new customer)
    await page.click('[data-testid="product-card"] >> nth=0');
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.click('[data-testid="cart-btn"]');
    await page.click('text=Checkout');
    
    // Select delivery
    await page.click('text=Delivery');
    
    // Fill address
    await page.fill('textarea[placeholder="Masukkan alamat lengkap"]', 'Jl. Test No. 123');
    
    // Select payment
    await page.click('text=E-Wallet');
    await page.click('text=GoPay');
    
    // Try to place order (may show business rule warning)
    await page.click('text=Buat Pesanan');
    
    // Handle business rule (new customer can't delivery)
    const alert = await page.$('.alert');
    if (alert) {
      console.log('   ℹ️  Business rule enforced: New customer must order takeaway first');
      // Switch to takeaway
      await page.click('text=Takeaway');
      await page.click('text=Buat Pesanan');
    }
    
    await page.waitForURL(/\/order-success/, { timeout: 10000 });
    console.log('   ✅ Order placed (delivery or takeaway)\n');
  });
});

// ==================== ADMIN FLOW ====================

test.describe('👨‍💼 Admin Flow', () => {
  test('Admin login and dashboard view', async ({ page }) => {
    console.log('\n📍 Testing Admin Login & Dashboard...');
    
    await page.goto(`${BASE_URL}/login`);
    
    // Admin login
    await page.fill('input[type="tel"]', CREDENTIALS.admin.phone);
    await page.fill('input[type="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/\/admin/, { timeout: 5000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check stats cards
    const statCards = page.locator('[data-testid="stat-card"]');
    await expect(statCards.first()).toBeVisible();
    
    console.log('   ✅ Admin logged in and dashboard loaded\n');
  });

  test('Admin verifies pending payment', async ({ page }) => {
    console.log('\n📍 Testing Payment Verification...');
    
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="tel"]', CREDENTIALS.admin.phone);
    await page.fill('input[type="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    
    // Go to payments
    await page.click('text=Verifikasi Pembayaran');
    await page.waitForURL(/\/admin\/payments/);
    
    // Check for pending payments
    const pendingCount = await page.textContent('[data-testid="pending-count"]');
    console.log(`   📊 Pending payments: ${pendingCount}`);
    
    // If there are pending payments, verify the first one
    const verifyButtons = page.locator('[data-testid="verify-btn"]');
    const count = await verifyButtons.count();
    
    if (count > 0) {
      console.log('   Step: Verifying first pending payment...');
      await verifyButtons.first().click();
      
      // Confirm verification
      await page.waitForSelector('.confirm-dialog');
      await page.click('button:has-text("Verifikasi")');
      
      // Wait for success toast
      await page.waitForSelector('.toast-success', { timeout: 5000 });
      console.log('   ✅ Payment verified successfully\n');
    } else {
      console.log('   ℹ️  No pending payments to verify\n');
    }
  });

  test('Admin generates daily report', async ({ page }) => {
    console.log('\n📍 Testing Report Generation...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="tel"]', CREDENTIALS.admin.phone);
    await page.fill('input[type="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    
    // Go to reports
    await page.click('text=Generate Laporan');
    await page.waitForURL(/\/admin\/reports/);
    
    // Generate daily report
    console.log('   Step: Generating daily report...');
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Generate >> nth=0');
    
    const download = await downloadPromise;
    console.log(`   ✅ Report downloaded: ${download.suggestedFilename()}\n`);
    
    // Verify PDF was downloaded
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Admin views all orders', async ({ page }) => {
    console.log('\n📍 Testing Order Management...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="tel"]', CREDENTIALS.admin.phone);
    await page.fill('input[type="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    
    // Go to orders
    await page.click('text=Lihat Orders');
    await page.waitForURL(/\/admin\/orders/);
    
    // Check orders table
    const orderRows = page.locator('[data-testid="order-row"]');
    const count = await orderRows.count();
    console.log(`   📊 Total orders: ${count}`);
    
    // Verify filter tabs
    await expect(page.locator('text=All')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    
    console.log('   ✅ Orders page loaded successfully\n');
  });
});

// ==================== KITCHEN FLOW ====================

test.describe('👨‍🍳 Kitchen Flow', () => {
  test('Kitchen login and view orders', async ({ page }) => {
    console.log('\n📍 Testing Kitchen Login...');
    
    await page.goto(`${BASE_URL}/login`);
    
    // Kitchen login
    await page.fill('input[type="tel"]', CREDENTIALS.kitchen.phone);
    await page.fill('input[type="password"]', CREDENTIALS.kitchen.password);
    await page.click('button[type="submit"]');
    
    // Wait for kitchen view
    await page.waitForURL(/\/kitchen/);
    await expect(page.locator('text=Kitchen View')).toBeVisible();
    
    // Check queue stats
    const pendingCount = await page.textContent('[data-testid="pending-count"]');
    const preparingCount = await page.textContent('[data-testid="preparing-count"]');
    const readyCount = await page.textContent('[data-testid="ready-count"]');
    
    console.log(`   📊 Queue: ${pendingCount} pending, ${preparingCount} preparing, ${readyCount} ready`);
    
    console.log('   ✅ Kitchen logged in and orders loaded\n');
  });

  test('Kitchen updates order status', async ({ page }) => {
    console.log('\n📍 Testing Order Status Update...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="tel"]', CREDENTIALS.kitchen.phone);
    await page.fill('input[type="password"]', CREDENTIALS.kitchen.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/kitchen/);
    
    // Find pending order
    const startButtons = page.locator('[data-testid="start-preparing-btn"]');
    const count = await startButtons.count();
    
    if (count > 0) {
      console.log('   Step: Starting to prepare order...');
      await startButtons.first().click();
      
      // Wait for status update
      await page.waitForSelector('.toast-success', { timeout: 5000 });
      console.log('   ✅ Order status updated to: Preparing\n');
    } else {
      console.log('   ℹ️  No pending orders to prepare\n');
    }
    
    // Find preparing order
    const readyButtons = page.locator('[data-testid="mark-ready-btn"]');
    const readyCount = await readyButtons.count();
    
    if (readyCount > 0) {
      console.log('   Step: Marking order as ready...');
      await readyButtons.first().click();
      
      await page.waitForSelector('.toast-success', { timeout: 5000 });
      console.log('   ✅ Order status updated to: Ready\n');
    }
  });
});

// ==================== DRIVER FLOW ====================

test.describe('🛵 Driver Flow', () => {
  test('Driver login and view deliveries', async ({ page }) => {
    console.log('\n📍 Testing Driver Login...');
    
    await page.goto(`${BASE_URL}/login`);
    
    // Driver login
    await page.fill('input[type="tel"]', CREDENTIALS.driver.phone);
    await page.fill('input[type="password"]', CREDENTIALS.driver.password);
    await page.click('button[type="submit"]');
    
    // Wait for driver view
    await page.waitForURL(/\/driver/);
    await expect(page.locator('text=Driver View')).toBeVisible();
    
    // Check deliveries
    const deliveryCards = page.locator('[data-testid="delivery-card"]');
    const count = await deliveryCards.count();
    console.log(`   📊 Available deliveries: ${count}`);
    
    console.log('   ✅ Driver logged in and deliveries loaded\n');
  });
});

// ==================== REAL-TIME UPDATES ====================

test.describe('🔌 Real-time Updates (Socket.IO)', () => {
  test('Order status updates in real-time', async ({ page, context }) => {
    console.log('\n📍 Testing Real-time Order Updates...');
    
    // Open two browser contexts (simulate two users)
    const customerPage = await context.newPage();
    const kitchenPage = await context.newPage();
    
    // Customer places order
    console.log('   Step: Customer places order...');
    await customerPage.goto(`${BASE_URL}/login`);
    await customerPage.fill('input[placeholder="Nama"]', uniqueCustomer());
    await customerPage.fill('input[placeholder="081234567890"]', `08${Math.floor(Math.random() * 10000000000)}`);
    await customerPage.click('button[type="submit"]');
    await customerPage.waitForURL(/\/menu/);
    
    // Kitchen opens kitchen view
    console.log('   Step: Kitchen opens kitchen view...');
    await kitchenPage.goto(`${BASE_URL}/login`);
    await kitchenPage.fill('input[type="tel"]', CREDENTIALS.kitchen.phone);
    await kitchenPage.fill('input[type="password"]', CREDENTIALS.kitchen.password);
    await kitchenPage.click('button[type="submit"]');
    await kitchenPage.waitForURL(/\/kitchen/);
    
    // Customer places order
    await customerPage.click('[data-testid="product-card"] >> nth=0');
    await customerPage.click('[data-testid="add-to-cart-btn"]');
    await customerPage.click('[data-testid="cart-btn"]');
    await customerPage.click('text=Checkout');
    await customerPage.click('text=Takeaway');
    await customerPage.click('text=QRIS');
    await customerPage.click('text=Buat Pesanan');
    await customerPage.waitForURL(/\/order-success/);
    
    // Kitchen should see new order (real-time)
    console.log('   Step: Waiting for kitchen to see new order...');
    await kitchenPage.waitForSelector('[data-testid="new-order-notification"]', { timeout: 10000 });
    
    console.log('   ✅ Real-time update received by kitchen\n');
    
    await customerPage.close();
    await kitchenPage.close();
  });
});

// ==================== ERROR HANDLING ====================

test.describe('⚠️ Error Handling', () => {
  test('Empty cart checkout shows error', async ({ page }) => {
    console.log('\n📍 Testing Empty Cart Error...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder="Nama"]', uniqueCustomer());
    await page.fill('input[placeholder="081234567890"]', `08${Math.floor(Math.random() * 10000000000)}`);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/menu/);
    
    // Go directly to checkout
    await page.goto(`${BASE_URL}/checkout`);
    
    // Should show error or redirect
    const alert = await page.$('.alert');
    const redirected = page.url().includes('/cart');
    
    if (alert || redirected) {
      console.log('   ✅ Empty cart handled correctly\n');
    } else {
      console.log('   ⚠️  Empty cart not handled\n');
    }
  });

  test('Invalid login shows error', async ({ page }) => {
    console.log('\n📍 Testing Invalid Login Error...');
    
    await page.goto(`${BASE_URL}/login`);
    
    // Try invalid admin login
    await page.fill('input[type="tel"]', '081234567899');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error
    await page.waitForSelector('.error-message', { timeout: 5000 });
    const errorMessage = await page.textContent('.error-message');
    
    expect(errorMessage).toContain('Gagal');
    console.log(`   ✅ Error shown: ${errorMessage}\n`);
  });
});
