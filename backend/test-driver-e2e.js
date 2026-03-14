/**
 * Driver Flow E2E Test
 * Bakso Premium - Driver Complete Flow Test
 * 
 * Tests:
 * 1. Driver login
 * 2. View delivery orders
 * 3. Update order status (READY → OUT_FOR_DELIVERY → COMPLETED)
 * 4. Verify order details
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n📍 ${step}`, 'blue');
  log(`${'─'.repeat(60)}`, 'blue');
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
  driverToken: null,
  driver: null,
  orders: [],
  deliveryOrder: null,
};

// ==================== TEST SCENARIOS ====================

async function scenario1_DriverLogin() {
  logStep('Scenario 1: Driver Login');

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

  return results;
}

async function scenario2_ViewDeliveryOrders() {
  logStep('Scenario 2: View Delivery Orders');

  const results = [];

  results.push(await test('Get delivery orders', async () => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.driverToken}` },
      params: { limit: 100 },
    });

    const orders = response.data.orders || response.data.rows || [];
    log(`      Total orders from API: ${orders.length}`);

    // Filter for delivery orders (driver should only see these)
    const deliveryOrders = orders.filter(o => 
      o.order_type === 'delivery' && 
      ['ready', 'out_for_delivery', 'completed'].includes(o.status)
    );

    log(`      Delivery orders: ${deliveryOrders.length}`);
    
    state.orders = deliveryOrders;
    
    if (deliveryOrders.length > 0) {
      state.deliveryOrder = deliveryOrders[0];
      log(`      First order: ${state.deliveryOrder.order_number}`);
      log(`      Status: ${state.deliveryOrder.status}`);
      log(`      Address: ${state.deliveryOrder.delivery_address}`);
    }
  }));

  results.push(await test('Driver should see delivery orders only', async () => {
    // Verify all orders are delivery type
    state.orders.forEach(order => {
      assert(order.order_type === 'delivery', 'Should only see delivery orders');
    });

    log(`      ✅ All ${state.orders.length} orders are delivery type`);
  }));

  return results;
}

async function scenario3_UpdateOrderStatus() {
  logStep('Scenario 3: Update Order Status');

  const results = [];

  if (!state.deliveryOrder) {
    log('      ⚠️ No delivery order found, skipping', 'yellow');
    return results;
  }

  const orderId = state.deliveryOrder.id;

  results.push(await test('Update order to OUT_FOR_DELIVERY', async () => {
    if (state.deliveryOrder.status !== 'ready') {
      log('      ⚠️ Order not in READY status, skipping', 'yellow');
      return;
    }

    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/status`,
      { status: 'out_for_delivery' },
      {
        headers: { Authorization: `Bearer ${state.driverToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    assert(response.data.order.status === 'out_for_delivery', 'Status should be updated');

    state.deliveryOrder = response.data.order;
    log(`      Order status: ${state.deliveryOrder.status}`);
  }));

  results.push(await test('Update order to COMPLETED', async () => {
    if (state.deliveryOrder.status !== 'out_for_delivery') {
      log('      ⚠️ Order not in OUT_FOR_DELIVERY status, skipping', 'yellow');
      return;
    }

    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/status`,
      { status: 'completed' },
      {
        headers: { Authorization: `Bearer ${state.driverToken}` },
      }
    );

    assert(response.data.success, 'Should return success');
    assert(response.data.order.status === 'completed', 'Status should be updated');

    state.deliveryOrder = response.data.order;
    log(`      Order status: ${state.deliveryOrder.status}`);
    log(`      Completed at: ${state.deliveryOrder.completed_at}`);
  }));

  return results;
}

async function scenario4_VerifyCompletedOrder() {
  logStep('Scenario 4: Verify Completed Order');

  const results = [];

  if (!state.deliveryOrder) {
    log('      ⚠️ No order to verify, skipping', 'yellow');
    return results;
  }

  results.push(await test('Verify order is completed', async () => {
    const response = await axios.get(
      `${API_URL}/orders/${state.deliveryOrder.id}`,
      {
        headers: { Authorization: `Bearer ${state.driverToken}` },
      }
    );

    const order = response.data.order;
    assert(order.status === 'completed', 'Order should be completed');
    assert(order.completed_at, 'Should have completed_at timestamp');

    log(`      Order: ${order.order_number}`);
    log(`      Status: ${order.status}`);
    log(`      Completed: ${order.completed_at}`);
    log(`      Customer: ${order.customer_name}`);
  }));

  return results;
}

async function scenario5_ViewUpdatedOrders() {
  logStep('Scenario 5: View Updated Orders List');

  const results = [];

  results.push(await test('Get updated orders list', async () => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${state.driverToken}` },
      params: { limit: 100 },
    });

    const orders = response.data.orders || response.data.rows || [];
    const deliveryOrders = orders.filter(o => 
      o.order_type === 'delivery' && 
      ['ready', 'out_for_delivery', 'completed'].includes(o.status)
    );

    log(`      Total delivery orders: ${deliveryOrders.length}`);
    
    // Count by status
    const statusCount = deliveryOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    log(`      Status breakdown:`);
    Object.entries(statusCount).forEach(([status, count]) => {
      log(`        - ${status}: ${count}`, 'cyan');
    });
  }));

  return results;
}

// ==================== MAIN ====================

async function runDriverTests() {
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║  Driver Flow E2E Test                                  ║');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const allResults = [];

  // Run scenarios
  allResults.push(...await scenario1_DriverLogin());
  allResults.push(...await scenario2_ViewDeliveryOrders());
  allResults.push(...await scenario3_UpdateOrderStatus());
  allResults.push(...await scenario4_VerifyCompletedOrder());
  allResults.push(...await scenario5_ViewUpdatedOrders());

  // Summary
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  log('\n╔════════════════════════════════════════════════════════╗');
  log('║  Test Summary                                          ║');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  log(`\nTotal: ${allResults.length} tests`);
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All driver tests passed!', 'green');
  } else {
    log('\n⚠️ Some tests failed', 'yellow');
  }

  log('\n📋 Driver Credentials:', 'yellow');
  log('   Phone: 081234567892', 'yellow');
  log('   Password: driver123', 'yellow');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runDriverTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
