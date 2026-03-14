/**
 * Staff Authentication E2E Test
 * Bakso Premium - Staff Auth Flow Test
 * 
 * Tests:
 * 1. Admin login
 * 2. Kitchen login
 * 3. Driver login
 * 4. Invalid credentials
 * 5. Token validation
 * 6. Role-based access control
 */

const axios = require('axios');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

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

// State
const state = {
  adminToken: null,
  kitchenToken: null,
  driverToken: null,
  admin: null,
  kitchen: null,
  driver: null,
};

// ==================== TEST SCENARIOS ====================

async function scenario1_AdminLogin() {
  logStep('Scenario 1: Admin Login');

  const results = [];

  results.push(await test('Login as admin', async () => {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567890',
      password: 'admin123',
    });

    assert(response.data.success, 'Should return success');
    assert(response.data.token, 'Should return token');
    assert(response.data.user.role === 'admin', 'Should be admin role');

    state.admin = response.data.user;
    state.adminToken = response.data.token;

    log(`      Logged in: ${state.admin.name}`);
    log(`      Phone: ${state.admin.phone}`);
    log(`      Role: ${state.admin.role}`);
  }));

  results.push(await test('Admin token should be valid JWT', async () => {
    const tokenParts = state.adminToken.split('.');
    assert(tokenParts.length === 3, 'Token should have 3 parts');
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    assert(payload.role === 'admin', 'Token payload should contain admin role');
    assert(payload.id, 'Token payload should contain user id');
    
    log(`      Token expires in: ${new Date(payload.exp * 1000).toLocaleString()}`);
  }));

  return results;
}

async function scenario2_KitchenLogin() {
  logStep('Scenario 2: Kitchen Login');

  const results = [];

  results.push(await test('Login as kitchen', async () => {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567891',
      password: 'kitchen123',
    });

    assert(response.data.success, 'Should return success');
    assert(response.data.token, 'Should return token');
    assert(response.data.user.role === 'kitchen', 'Should be kitchen role');

    state.kitchen = response.data.user;
    state.kitchenToken = response.data.token;

    log(`      Logged in: ${state.kitchen.name}`);
    log(`      Phone: ${state.kitchen.phone}`);
    log(`      Role: ${state.kitchen.role}`);
  }));

  results.push(await test('Kitchen token should be valid JWT', async () => {
    const tokenParts = state.kitchenToken.split('.');
    assert(tokenParts.length === 3, 'Token should have 3 parts');
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    assert(payload.role === 'kitchen', 'Token payload should contain kitchen role');
    
    log(`      Token valid for kitchen role`);
  }));

  return results;
}

async function scenario3_DriverLogin() {
  logStep('Scenario 3: Driver Login');

  const results = [];

  results.push(await test('Login as driver', async () => {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567892',
      password: 'driver123',
    });

    assert(response.data.success, 'Should return success');
    assert(response.data.token, 'Should return token');
    assert(response.data.user.role === 'driver', 'Should be driver role');

    state.driver = response.data.user;
    state.driverToken = response.data.token;

    log(`      Logged in: ${state.driver.name}`);
    log(`      Phone: ${state.driver.phone}`);
    log(`      Role: ${state.driver.role}`);
  }));

  results.push(await test('Driver token should be valid JWT', async () => {
    const tokenParts = state.driverToken.split('.');
    assert(tokenParts.length === 3, 'Token should have 3 parts');
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    assert(payload.role === 'driver', 'Token payload should contain driver role');
    
    log(`      Token valid for driver role`);
  }));

  return results;
}

async function scenario4_InvalidCredentials() {
  logStep('Scenario 4: Invalid Credentials');

  const results = [];

  results.push(await test('Login with wrong password', async () => {
    let error = null;
    try {
      await axios.post(`${API_URL}/auth/staff`, {
        phone: '081234567890',
        password: 'wrongpassword',
      });
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    assert(error.response.status === 401, 'Should return 401');
    assert(error.response.data.error, 'Should return error message');
    
    log(`      Correctly rejected wrong password`);
  }));

  results.push(await test('Login with non-existent phone', async () => {
    let error = null;
    try {
      await axios.post(`${API_URL}/auth/staff`, {
        phone: '081234567899',
        password: 'admin123',
      });
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    // Should return 401 or 404 (either is acceptable)
    assert([401, 404].includes(error.response.status), 'Should return 401 or 404');
    
    log(`      Correctly rejected non-existent phone`);
  }));

  results.push(await test('Login without phone', async () => {
    let error = null;
    try {
      await axios.post(`${API_URL}/auth/staff`, {
        password: 'admin123',
      });
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    assert(error.response.status === 400, 'Should return 400');
    
    log(`      Correctly rejected missing phone`);
  }));

  results.push(await test('Login without password', async () => {
    let error = null;
    try {
      await axios.post(`${API_URL}/auth/staff`, {
        phone: '081234567890',
      });
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    assert(error.response.status === 400, 'Should return 400');
    
    log(`      Correctly rejected missing password`);
  }));

  return results;
}

async function scenario5_RoleBasedAccess() {
  logStep('Scenario 5: Role-Based Access Control');

  const results = [];

  // Admin can access all
  results.push(await test('Admin can access admin orders', async () => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });

    assert(response.data.orders || response.data.rows, 'Should return orders');
    log(`      Admin can access orders (count: ${response.data.count || 'N/A'})`);
  }));

  // Kitchen can access orders
  results.push(await test('Kitchen can access orders', async () => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.kitchenToken}` },
    });

    assert(response.data.orders || response.data.rows, 'Should return orders');
    log(`      Kitchen can access orders (count: ${response.data.count || 'N/A'})`);
  }));

  // Driver can access orders
  results.push(await test('Driver can access orders', async () => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.driverToken}` },
    });

    assert(response.data.orders || response.data.rows, 'Should return orders');
    log(`      Driver can access orders (count: ${response.data.count || 'N/A'})`);
  }));

  // Driver can update order status
  results.push(await test('Driver can update order status', async () => {
    // Find a delivery order in 'ready' status
    const ordersResponse = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.driverToken}` },
      params: { limit: 100 },
    });

    const orders = ordersResponse.data.orders || ordersResponse.data.rows || [];
    const deliveryOrder = orders.find(o => 
      o.order_type === 'delivery' && 
      ['ready', 'out_for_delivery'].includes(o.status)
    );

    if (!deliveryOrder) {
      log('      ⚠️ No delivery order found, skipping', 'yellow');
      return;
    }

    const newStatus = deliveryOrder.status === 'ready' ? 'out_for_delivery' : 'completed';
    
    const response = await axios.patch(
      `${API_URL}/orders/${deliveryOrder.id}/status`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${state.driverToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    assert(response.data.order.status === newStatus, 'Status should be updated');
    
    log(`      Driver updated order ${deliveryOrder.order_number} to ${newStatus}`);
  }));

  return results;
}

async function scenario6_TokenValidation() {
  logStep('Scenario 6: Token Validation');

  const results = [];

  results.push(await test('Access without token should fail', async () => {
    let error = null;
    try {
      await axios.get(`${API_URL}/orders`);
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    assert(error.response.status === 401, 'Should return 401');
    assert(error.response.data.error === 'Authentication required', 'Should return auth error');
    
    log(`      Correctly rejected request without token`);
  }));

  results.push(await test('Access with invalid token should fail', async () => {
    let error = null;
    try {
      await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer invalid.token.here` },
      });
    } catch (err) {
      error = err;
    }

    assert(error, 'Should throw error');
    assert(error.response.status === 401, 'Should return 401');
    
    log(`      Correctly rejected invalid token`);
  }));

  return results;
}

// ==================== MAIN ====================

async function runStaffAuthTests() {
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║  Staff Authentication E2E Test                         ║');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const allResults = [];

  // Run scenarios
  allResults.push(...await scenario1_AdminLogin());
  allResults.push(...await scenario2_KitchenLogin());
  allResults.push(...await scenario3_DriverLogin());
  allResults.push(...await scenario4_InvalidCredentials());
  allResults.push(...await scenario5_RoleBasedAccess());
  allResults.push(...await scenario6_TokenValidation());

  // Summary
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const total = allResults.length;

  log('\n╔════════════════════════════════════════════════════════╗');
  log('║  Test Summary                                          ║');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  log(`\nTotal: ${total} tests`);
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All staff auth tests passed!', 'green');
  } else {
    log('\n⚠️ Some tests failed', 'yellow');
  }

  log('\n📋 Staff Credentials Used:', 'yellow');
  log('   - Admin:   081234567890 / admin123', 'yellow');
  log('   - Kitchen: 081234567891 / kitchen123', 'yellow');
  log('   - Driver:  081234567892 / driver123', 'yellow');

  log('\n');
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runStaffAuthTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
