/**
 * Voucher System E2E Test
 * Bakso Premium - Voucher Functionality Tests
 * 
 * Test Scenarios:
 * 1. Admin creates voucher (percentage & fixed)
 * 2. Customer applies voucher to order
 * 3. Voucher discount calculation
 * 4. Voucher usage limits
 * 5. Voucher expiry validation
 * 6. Voucher minimum purchase
 * 7. Voucher max discount (percentage type)
 * 8. Voucher redemption
 */

const axios = require('axios');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

// Colors
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

function logSection(title) {
  log(`\n${'═'.repeat(70)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'═'.repeat(70)}`, 'cyan');
}

function logStep(step) {
  log(`\n📍 ${step}`, 'blue');
  log(`${'─'.repeat(50)}`, 'blue');
}

async function test(name, fn) {
  try {
    await fn();
    log(`   ✅ ${name}`, 'green');
    return { passed: true };
  } catch (error) {
    log(`   ❌ ${name}`, 'red');
    log(`      Error: ${error.message}`, 'red');
    return { passed: false };
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test State
const state = {
  adminToken: null,
  customerToken: null,
  customer: null,
  vouchers: [],
  orders: [],
};

// ==================== HELPER FUNCTIONS ====================

async function adminLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567890',
      password: 'admin123',
    });
    
    // Handle 2FA setup required
    if (response.data.requires_2fa_setup) {
      console.log('   ℹ️  Admin 2FA setup required, setting up PIN...');
      const setupToken = response.data.setup_token;
      
      // Set PIN for admin
      await axios.post(
        `${API_URL}/customer-pin/set`,
        { pin: '123456' },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      
      // Login again with PIN to get full token
      const fullLoginResponse = await axios.post(`${API_URL}/auth/staff`, {
        phone: '081234567890',
        pin: '123456',
      });
      
      return fullLoginResponse.data.token;
    }
    
    return response.data.token;
  } catch (error) {
    // If admin login fails, try with PIN directly
    if (error.response?.status === 401) {
      console.log('   ℹ️  Trying admin login with PIN...');
      const response = await axios.post(`${API_URL}/auth/staff`, {
        phone: '081234567890',
        pin: '123456',
      });
      return response.data.token;
    }
    throw error;
  }
}

async function customerRegister(name, phone) {
  try {
    const response = await axios.post(`${API_URL}/auth/customer`, {
      name,
      phone,
    });
    state.customer = response.data.user;
    return response.data.token;
  } catch (error) {
    // If user already exists (409), login with PIN instead
    if (error.response?.status === 409) {
      console.log(`   ℹ️  Customer ${phone} already exists, logging in with PIN...`);
      // Try to login with default PIN
      try {
        const loginResponse = await axios.post(`${API_URL}/customer-pin/verify`, {
          phone,
          pin: '123456', // Default test PIN
        });
        state.customer = loginResponse.data.user;
        return loginResponse.data.token;
      } catch (loginError) {
        console.log(`   ⚠️  PIN login failed, using anonymous customer`);
        // Create new customer with different phone
        const newPhone = phone + Math.floor(Math.random() * 1000);
        const retryResponse = await axios.post(`${API_URL}/auth/customer`, {
          name,
          phone: newPhone,
        });
        state.customer = retryResponse.data.user;
        return retryResponse.data.token;
      }
    }
    throw error;
  }
}

async function getProducts() {
  const response = await axios.get(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return response.data.products || response.data.rows || [];
}

// ==================== VOUCHER CREATION TESTS ====================

async function scenario1_CreateVouchers() {
  logStep('Scenario 1: Admin Creates Vouchers');

  const results = [];

  results.push(await test('Admin can create percentage voucher', async () => {
    const response = await axios.post(
      `${API_URL}/vouchers`,
      {
        code: 'BAKSO10',
        name: 'Diskon Bakso 10%',
        description: 'Diskon 10% untuk pembelian bakso',
        type: 'percentage',
        value: 10,
        min_purchase: 50000,
        max_discount: 20000,
        usage_limit: 100,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    assert(response.data.voucher.code === 'BAKSO10', 'Should have correct code');
    assert(response.data.voucher.type === 'percentage', 'Should be percentage type');

    state.vouchers.push(response.data.voucher);
    log(`      Voucher created: ${response.data.voucher.code}`);
    log(`      Type: ${response.data.voucher.type}`);
    log(`      Value: ${response.data.voucher.value}%`);
    log(`      Max Discount: Rp ${response.data.voucher.max_discount}`);
  }));

  results.push(await test('Admin can create fixed voucher', async () => {
    const response = await axios.post(
      `${API_URL}/vouchers`,
      {
        code: 'GRATIS5',
        name: 'Potongan 5rb',
        description: 'Potongan 5rb untuk minimal pembelian 30rb',
        type: 'fixed',
        value: 5000,
        min_purchase: 30000,
        usage_limit: 50,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    assert(response.data.voucher.code === 'GRATIS5', 'Should have correct code');
    assert(response.data.voucher.type === 'fixed', 'Should be fixed type');

    state.vouchers.push(response.data.voucher);
    log(`      Voucher created: ${response.data.voucher.code}`);
    log(`      Type: ${response.data.voucher.type}`);
    log(`      Value: Rp ${response.data.voucher.value}`);
  }));

  results.push(await test('Admin can create free delivery voucher', async () => {
    const response = await axios.post(
      `${API_URL}/vouchers`,
      {
        code: 'FREEDELIV',
        name: 'Gratis Ongkir',
        description: 'Gratis ongkir untuk delivery order',
        type: 'fixed',
        value: 15000, // Covers typical delivery fee
        min_purchase: 100000,
        usage_limit: 200,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        is_active: true,
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    state.vouchers.push(response.data.voucher);
    log(`      Voucher created: ${response.data.voucher.code}`);
  }));

  return results;
}

// ==================== VOUCHER VALIDATION TESTS ====================

async function scenario2_VoucherValidation() {
  logStep('Scenario 2: Voucher Validation');

  const results = [];

  results.push(await test('Cannot create voucher with invalid code', async () => {
    try {
      await axios.post(
        `${API_URL}/vouchers`,
        {
          code: 'ab', // Too short
          name: 'Invalid Voucher',
          type: 'fixed',
          value: 1000,
        },
        {
          headers: { Authorization: `Bearer ${state.adminToken}` },
        }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      assert(error.response?.data?.error === 'Validasi gagal', 'Should have validation error');
      log(`      Validation error caught: ${error.response?.data?.details?.[0]?.message}`);
    }
  }));

  results.push(await test('Cannot create voucher with invalid type', async () => {
    try {
      await axios.post(
        `${API_URL}/vouchers`,
        {
          code: 'INVALID',
          name: 'Invalid Type',
          type: 'invalid_type', // Invalid type
          value: 1000,
        },
        {
          headers: { Authorization: `Bearer ${state.adminToken}` },
        }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Validation error caught: ${error.response?.data?.details?.[0]?.message}`);
    }
  }));

  results.push(await test('Cannot create voucher with negative value', async () => {
    try {
      await axios.post(
        `${API_URL}/vouchers`,
        {
          code: 'NEGATIVE',
          name: 'Negative Value',
          type: 'fixed',
          value: -1000, // Negative value
        },
        {
          headers: { Authorization: `Bearer ${state.adminToken}` },
        }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Validation error caught: ${error.response?.data?.details?.[0]?.message}`);
    }
  }));

  return results;
}

// ==================== VOUCHER USAGE TESTS ====================

async function scenario3_VoucherUsage() {
  logStep('Scenario 3: Customer Uses Voucher');

  const results = [];

  results.push(await test('Customer can view active vouchers', async () => {
    const response = await axios.get(`${API_URL}/vouchers`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });

    const vouchers = response.data.vouchers || [];
    assert(vouchers.length > 0, 'Should have vouchers');

    const activeVouchers = vouchers.filter(v => v.is_active);
    log(`      Total vouchers: ${vouchers.length}`);
    log(`      Active vouchers: ${activeVouchers.length}`);
  }));

  results.push(await test('Customer can apply percentage voucher to order', async () => {
    // First create an order
    const products = await getProducts();
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      {
        order_type: 'delivery',
        items: [
          {
            product_id: products[0].id,
            quantity: 4, // Make sure total > min_purchase
          },
        ],
        voucher_code: 'BAKSO10',
      },
      {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      }
    );

    assert(orderResponse.data.success, 'Should create order with voucher');
    assert(orderResponse.data.order.voucher_code === 'BAKSO10', 'Should apply voucher');
    assert(orderResponse.data.order.discount > 0, 'Should have discount');

    state.orders.push(orderResponse.data.order);
    log(`      Order created: ${orderResponse.data.order.order_number}`);
    log(`      Subtotal: Rp ${orderResponse.data.order.subtotal}`);
    log(`      Discount: Rp ${orderResponse.data.order.discount}`);
    log(`      Total: Rp ${orderResponse.data.order.total}`);
  }));

  results.push(await test('Customer can apply fixed voucher to order', async () => {
    const products = await getProducts();
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      {
        order_type: 'takeaway',
        items: [
          {
            product_id: products[0].id,
            quantity: 3,
          },
        ],
        voucher_code: 'GRATIS5',
      },
      {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      }
    );

    assert(orderResponse.data.success, 'Should create order with voucher');
    assert(orderResponse.data.order.voucher_code === 'GRATIS5', 'Should apply voucher');
    assert(orderResponse.data.order.discount === 5000, 'Should have fixed discount');

    state.orders.push(orderResponse.data.order);
    log(`      Order created: ${orderResponse.data.order.order_number}`);
    log(`      Discount: Rp ${orderResponse.data.order.discount}`);
  }));

  return results;
}

// ==================== VOUCHER RESTRICTION TESTS ====================

async function scenario4_VoucherRestrictions() {
  logStep('Scenario 4: Voucher Restrictions');

  const results = [];

  results.push(await test('Cannot use voucher below min purchase', async () => {
    const products = await getProducts();
    
    try {
      await axios.post(
        `${API_URL}/orders`,
        {
          order_type: 'delivery',
          items: [
            {
              product_id: products[0].id,
              quantity: 1, // Too small, below min_purchase
            },
          ],
          voucher_code: 'BAKSO10',
        },
        {
          headers: { Authorization: `Bearer ${state.customerToken}` },
        }
      );
      throw new Error('Should have failed - below min purchase');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Restriction enforced: ${error.response?.data?.error}`);
    }
  }));

  results.push(await test('Cannot use expired voucher', async () => {
    // Create expired voucher
    await axios.post(
      `${API_URL}/vouchers`,
      {
        code: 'EXPIRED',
        name: 'Expired Voucher',
        type: 'fixed',
        value: 1000,
        valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        valid_until: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        is_active: true,
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );

    const products = await getProducts();
    
    try {
      await axios.post(
        `${API_URL}/orders`,
        {
          order_type: 'delivery',
          items: [
            {
              product_id: products[0].id,
              quantity: 2,
            },
          ],
          voucher_code: 'EXPIRED',
        },
        {
          headers: { Authorization: `Bearer ${state.customerToken}` },
        }
      );
      throw new Error('Should have failed - voucher expired');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Expiry enforced: ${error.response?.data?.error}`);
    }
  }));

  results.push(await test('Percentage discount respects max_discount', async () => {
    // Create order with large total to test max_discount
    const products = await getProducts();
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      {
        order_type: 'delivery',
        items: [
          {
            product_id: products[0].id,
            quantity: 20, // Large quantity
          },
        ],
        voucher_code: 'BAKSO10',
      },
      {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      }
    );

    const discount = orderResponse.data.order.discount;
    const maxDiscount = 20000; // BAKSO10 max_discount
    
    assert(discount <= maxDiscount, `Discount ${discount} should not exceed max ${maxDiscount}`);
    log(`      Order total: Rp ${orderResponse.data.order.subtotal}`);
    log(`      10% would be: Rp ${Math.round(orderResponse.data.order.subtotal * 0.1)}`);
    log(`      Actual discount: Rp ${discount} (capped at max)`);
  }));

  return results;
}

// ==================== VOUCHER USAGE LIMIT TESTS ====================

async function scenario5_VoucherUsageLimits() {
  logStep('Scenario 5: Voucher Usage Limits');

  const results = [];

  results.push(await test('Voucher usage count increments', async () => {
    // Get voucher usage before
    const beforeResponse = await axios.get(`${API_URL}/vouchers`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    const voucher = beforeResponse.data.vouchers.find(v => v.code === 'BAKSO10');
    const usedCountBefore = voucher.used_count || 0;

    // Create order with voucher
    const products = await getProducts();
    await axios.post(
      `${API_URL}/orders`,
      {
        order_type: 'delivery',
        items: [
          {
            product_id: products[0].id,
            quantity: 4,
          },
        ],
        voucher_code: 'BAKSO10',
      },
      {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      }
    );

    // Get voucher usage after
    const afterResponse = await axios.get(`${API_URL}/vouchers`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    const voucherAfter = afterResponse.data.vouchers.find(v => v.code === 'BAKSO10');
    const usedCountAfter = voucherAfter.used_count || 0;

    assert(usedCountAfter > usedCountBefore, 'Usage count should increment');
    log(`      Usage before: ${usedCountBefore}`);
    log(`      Usage after: ${usedCountAfter}`);
    log(`      Incremented by: ${usedCountAfter - usedCountBefore}`);
  }));

  return results;
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   🎫 VOUCHER SYSTEM E2E TESTS                                     ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   1. Voucher Creation (Percentage & Fixed)                        ║', 'cyan');
  log('║   2. Voucher Validation                                           ║', 'cyan');
  log('║   3. Voucher Usage                                                ║', 'cyan');
  log('║   4. Voucher Restrictions                                         ║', 'cyan');
  log('║   5. Voucher Usage Limits                                         ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');

  const allResults = [];

  // Setup - Admin login
  logStep('Setup: Admin Login');
  try {
    state.adminToken = await adminLogin();
    log('   ✅ Admin logged in', 'green');
  } catch (error) {
    log('   ❌ Admin login failed', 'red');
    log(`      ${error.message}`, 'red');
    process.exit(1);
  }

  // Setup - Customer registration
  logStep('Setup: Customer Registration');
  try {
    state.customerToken = await customerRegister('Voucher Tester', '08999999995');
    log('   ✅ Customer registered', 'green');
  } catch (error) {
    log('   ❌ Customer registration failed', 'red');
    log(`      ${error.message}`, 'red');
  }

  // Run all scenarios
  allResults.push(...await scenario1_CreateVouchers());
  allResults.push(...await scenario2_VoucherValidation());
  allResults.push(...await scenario3_VoucherUsage());
  allResults.push(...await scenario4_VoucherRestrictions());
  allResults.push(...await scenario5_VoucherUsageLimits());

  // Summary
  const passed = allResults.filter(r => r?.passed).length;
  const failed = allResults.filter(r => r && !r?.passed).length;
  const total = passed + failed;

  log(`\n\n${'═'.repeat(70)}`, 'cyan');
  log('  📊 FINAL TEST SUMMARY', 'cyan');
  log(`${'═'.repeat(70)}`, 'cyan');
  log(`\n  ✅ Passed: ${passed}`, 'green');
  log(`  ❌ Failed: ${failed}`, 'red');
  log(`  📝 Total:  ${total}`, 'cyan');

  const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  log(`  📈 Success: ${rate}%`, rate === '100.0' ? 'green' : 'yellow');
  log(`${'═'.repeat(70)}`, 'cyan');

  if (rate === '100.0') {
    log('\n🎉 Voucher system working correctly!', 'green');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 Fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
