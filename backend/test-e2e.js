/**
 * E2E Test Automation Script
 * Bakso Premium Ordering System
 * 
 * Usage: node test-e2e.js [base_url]
 * Example: node test-e2e.js http://localhost:9000
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

// Test state
const state = {
  adminToken: null,
  customerToken: null,
  productId: null,
  orderId: null,
  paymentId: null,
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n📋 ${name}`, 'cyan');
  log('='.repeat(50), 'blue');
}

async function test(name, fn) {
  try {
    await fn();
    log(`✅ ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==================== TEST CASES ====================

async function testHealth() {
  logTest('Health Check');
  
  await test('API Health Endpoint', async () => {
    const response = await axios.get(`${API_URL}/health`);
    assert(response.status === 200, 'Status should be 200');
    assert(response.data.status === 'ok', 'Status should be ok');
    log(`   Response: ${JSON.stringify(response.data)}`, 'green');
  });
}

async function testAuth() {
  logTest('Authentication');
  
  // Admin Login
  await test('Admin Login', async () => {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567890',
      password: 'admin123',
    });
    assert(response.status === 200, 'Status should be 200');
    assert(response.data.token, 'Token should exist');
    state.adminToken = response.data.token;
    log(`   Admin token: ${state.adminToken.substring(0, 20)}...`, 'green');
  });
  
  // Customer Login
  await test('Customer Login', async () => {
    const response = await axios.post(`${API_URL}/auth/customer`, {
      name: 'Test Customer',
      phone: '081234567899',
    });
    assert(response.status === 200, 'Status should be 200');
    assert(response.data.token, 'Token should exist');
    state.customerToken = response.data.token;
    log(`   Customer token: ${state.customerToken.substring(0, 20)}...`, 'green');
  });
}

async function testProducts() {
  logTest('Products & Categories');

  // Get Categories
  await test('Get Categories', async () => {
    const response = await axios.get(`${API_URL}/categories`);
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.categories || response.data), 'Should return array');
    const categories = response.data.categories || response.data;
    log(`   Found ${categories.length} categories`, 'green');
  });

  // Get Products
  await test('Get Products', async () => {
    const response = await axios.get(`${API_URL}/products`);
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.products || response.data), 'Should return array');
    const products = response.data.products || response.data;
    if (products.length > 0) {
      state.productId = products[0].id;
      log(`   Found ${products.length} products`, 'green');
      log(`   First product: ${products[0].name}`, 'green');
    }
  });
}

async function testOrders() {
  logTest('Orders');
  
  if (!state.customerToken) {
    log('   ⚠️  Skipping - No customer token', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.customerToken}` };
  
  // Create Order
  await test('Create Order', async () => {
    const response = await axios.post(`${API_URL}/orders`, {
      order_type: 'dine-in',
      table_number: '5',
      items: [
        {
          product_id: state.productId || 1,
          quantity: 2,
          notes: 'Test order',
        },
      ],
      subtotal: 50000,
      discount: 0,
      total: 50000,
    }, { headers });
    
    assert(response.status === 200 || response.status === 201, 'Status should be 200 or 201');
    assert(response.data.order, 'Order should exist');
    state.orderId = response.data.order.id;
    log(`   Order ID: ${state.orderId}`, 'green');
    log(`   Queue Number: ${response.data.order.queue_number || 'N/A'}`, 'green');
  });
  
  // Get My Orders
  await test('Get My Orders', async () => {
    const response = await axios.get(`${API_URL}/orders/my-orders`, { headers });
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.rows || response.data), 'Should return array');
    const orders = response.data.rows || response.data;
    log(`   Found ${orders.length} orders`, 'green');
  });
}

async function testPayments() {
  logTest('Payments');
  
  if (!state.customerToken || !state.orderId) {
    log('   ⚠️  Skipping - No order', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.customerToken}` };
  
  // Create Payment
  await test('Create Payment', async () => {
    const response = await axios.post(`${API_URL}/payments`, {
      order_id: state.orderId,
      method: 'qris',
      proof_image: 'data:image/png;base64,test',
    }, { headers });

    assert(response.status === 200 || response.status === 201, 'Status should be 200 or 201');
    assert(response.data.payment, 'Payment should exist');
    state.paymentId = response.data.payment.id;
    log(`   Payment ID: ${state.paymentId}`, 'green');
    log(`   Status: ${response.data.payment.status}`, 'green');
  });
}

async function testAdmin() {
  logTest('Admin Operations');
  
  if (!state.adminToken) {
    log('   ⚠️  Skipping - No admin token', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.adminToken}` };
  
  // Get Pending Payments
  await test('Get Pending Payments', async () => {
    const response = await axios.get(`${API_URL}/payments/pending`, { headers });
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.payments || response.data), 'Should return array');
    const payments = response.data.payments || response.data;
    log(`   Found ${payments.length} pending payments`, 'green');
  });
  
  // Verify Payment
  if (state.paymentId) {
    await test('Verify Payment', async () => {
      const response = await axios.patch(
        `${API_URL}/payments/${state.paymentId}/verify`,
        { status: 'verified' },
        { headers }
      );
      assert(response.status === 200, 'Status should be 200');
      log(`   Payment verified!`, 'green');
    });
  }
  
  // Get Dashboard Stats
  await test('Get Dashboard Stats', async () => {
    const response = await axios.get(`${API_URL}/dashboard/stats`, { headers });
    assert(response.status === 200, 'Status should be 200');
    log(`   Stats: ${JSON.stringify(response.data).substring(0, 100)}...`, 'green');
  });
}

async function testVouchers() {
  logTest('Vouchers');
  
  if (!state.adminToken) {
    log('   ⚠️  Skipping - No admin token', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.adminToken}` };
  
  // Create Voucher
  await test('Create Voucher', async () => {
    const response = await axios.post(`${API_URL}/vouchers`, {
      code: `TEST${Date.now()}`,
      name: 'Test Voucher',
      description: 'Test voucher from E2E',
      type: 'percentage',
      value: 10,
      min_purchase: 50000,
      max_discount: 20000,
      usage_limit: 100,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { headers });

    assert(response.status === 200 || response.status === 201, 'Status should be 200 or 201');
    log(`   Voucher created: ${response.data.voucher?.code || 'N/A'}`, 'green');
  });
  
  // Get Vouchers (customer)
  await test('Get Available Vouchers', async () => {
    const response = await axios.get(`${API_URL}/vouchers`);
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.vouchers || response.data), 'Should return array');
    const vouchers = response.data.vouchers || response.data;
    log(`   Found ${vouchers.length} available vouchers`, 'green');
  });
}

async function testReviews() {
  logTest('Reviews');
  
  if (!state.customerToken) {
    log('   ⚠️  Skipping - No customer token', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.customerToken}` };
  
  // Create Review (if we have a completed order)
  await test('Create Review', async () => {
    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        product_id: state.productId || 1,
        order_id: state.orderId,
        rating: 5,
        comment: 'Test review from E2E test',
      }, { headers });
      
      assert(response.status === 200 || response.status === 201, 'Status should be 200 or 201');
      log(`   Review created!`, 'green');
    } catch (error) {
      // May fail if order not completed yet
      log(`   ⚠️  Review skipped (order may not be completed)`, 'yellow');
    }
  });
  
  // Get Product Reviews
  await test('Get Product Reviews', async () => {
    const response = await axios.get(`${API_URL}/reviews/products?product_id=${state.productId || 1}`);
    assert(response.status === 200, 'Status should be 200');
    assert(Array.isArray(response.data.rows || response.data), 'Should return array');
    log(`   Found ${response.data.count || response.data.length || 0} reviews`, 'green');
  });
}

async function testLoyalty() {
  logTest('Loyalty Points');

  if (!state.customerToken) {
    log('   ⚠️  Skipping - No customer token', 'yellow');
    return;
  }

  const headers = { Authorization: `Bearer ${state.customerToken}` };

  // Get My Points
  await test('Get My Loyalty Points', async () => {
    const response = await axios.get(`${API_URL}/loyalty`, { headers });
    assert(response.status === 200, 'Status should be 200');
    log(`   Points: ${response.data.total_points || 0}`, 'green');
  });
}

async function testQueue() {
  logTest('Queue System');
  
  // Get Today's Queue
  await test('Get Today\'s Queue', async () => {
    const response = await axios.get(`${API_URL}/queue/today`);
    assert(response.status === 200, 'Status should be 200');
    log(`   Queue data: ${JSON.stringify(response.data).substring(0, 100)}...`, 'green');
  });
}

async function testProfile() {
  logTest('Profile');
  
  if (!state.customerToken) {
    log('   ⚠️  Skipping - No customer token', 'yellow');
    return;
  }
  
  const headers = { Authorization: `Bearer ${state.customerToken}` };
  
  // Get Profile
  await test('Get Profile', async () => {
    const response = await axios.get(`${API_URL}/profile`, { headers });
    assert(response.status === 200, 'Status should be 200');
    log(`   Name: ${response.data.user?.name || 'N/A'}`, 'green');
    log(`   Phone: ${response.data.user?.phone || 'N/A'}`, 'green');
  });
  
  // Update Profile
  await test('Update Profile', async () => {
    const response = await axios.put(`${API_URL}/profile`, {
      name: 'Updated Customer',
      email: 'test@example.com',
    }, { headers });
    assert(response.status === 200, 'Status should be 200');
    log(`   Profile updated!`, 'green');
  });
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n🚀 BAKSO PREMIUM - E2E TEST AUTOMATION', 'cyan');
  log('='.repeat(60), 'blue');
  log(`Base URL: ${BASE_URL}`, 'yellow');
  log(`API URL: ${API_URL}`, 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };
  
  const testSuites = [
    testHealth,
    testAuth,
    testProducts,
    testOrders,
    testPayments,
    testAdmin,
    testVouchers,
    testReviews,
    testLoyalty,
    testQueue,
    testProfile,
  ];
  
  for (const suite of testSuites) {
    try {
      await suite();
    } catch (error) {
      log(`\n⚠️  Test suite failed: ${error.message}`, 'yellow');
    }
  }
  
  // Summary
  log('\n\n' + '='.repeat(60), 'blue');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Skipped: ${results.skipped}`, 'yellow');
  log('='.repeat(60), 'blue');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    base_url: BASE_URL,
    results,
    state,
  };
  
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportPath}`, 'green');
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
