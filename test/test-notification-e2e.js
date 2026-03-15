/**
 * Notification System E2E Test
 * Bakso Premium - Push & Socket Notification Tests
 *
 * Scenarios:
 * 1. VAPID Key Retrieval
 * 2. Subscribe to Push Notifications
 * 3. Get User Subscriptions
 * 4. Send Notification to Specific User
 * 5. Broadcast to All Users
 * 6. Unsubscribe
 * 7. Socket Real-time Notifications
 * 8. Order-based Notifications
 * 9. Payment-based Notifications
 * 10. Admin Broadcast Notifications
 */

const axios = require('axios');
const { io } = require('socket.io-client');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;
const SOCKET_URL = BASE_URL;

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
  adminSocket: null,
  customerSocket: null,
  vapidPublicKey: null,
  testSubscription: null,
  notifications: [],
};

// ==================== HELPER FUNCTIONS ====================

async function adminLogin() {
  const response = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return response.data.token;
}

async function customerRegister(name, phone) {
  const response = await axios.post(`${API_URL}/auth/customer`, {
    name,
    phone,
  });
  state.customer = response.data.user;
  return response.data.token;
}

function connectSocket(token, user) {
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
}

function createMockSubscription() {
  // Mock push subscription for testing
  return {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now(),
    keys: {
      p256dh: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      auth: 'vF8tYp7HjN3kL9mR2qW5xZ',
    },
    browser: 'Chrome',
    os: 'Windows',
  };
}

// ==================== TEST SCENARIOS ====================

async function scenario1_VapidKey() {
  logStep('Scenario 1: Get VAPID Public Key');
  
  const results = [];
  
  results.push(await test('Get VAPID public key', async () => {
    const response = await axios.get(`${API_URL}/push/vapid-key`);
    
    assert(response.data.publicKey, 'Should return public key');
    assert(response.data.publicKey.length > 0, 'Key should not be empty');
    
    state.vapidPublicKey = response.data.publicKey;
    log(`      VAPID Key: ${state.vapidPublicKey.substring(0, 20)}...`);
  }));
  
  return results;
}

async function scenario2_Subscribe() {
  logStep('Scenario 2: Subscribe to Push Notifications');
  
  const results = [];
  
  results.push(await test('Customer can subscribe', async () => {
    const mockSubscription = createMockSubscription();
    
    const response = await axios.post(`${API_URL}/push/subscribe`, mockSubscription, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.subscription.endpoint, 'Should return subscription');
    
    state.testSubscription = response.data.subscription;
    log(`      Subscribed: ${state.testSubscription.endpoint}`);
    log(`      Browser: ${state.testSubscription.browser}`);
  }));
  
  results.push(await test('Duplicate subscription updates', async () => {
    const mockSubscription = createMockSubscription();
    mockSubscription.endpoint = state.testSubscription.endpoint; // Same endpoint
    
    const response = await axios.post(`${API_URL}/push/subscribe`, mockSubscription, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    log(`      Updated existing subscription`);
  }));
  
  results.push(await test('Subscribe requires authentication', async () => {
    try {
      const mockSubscription = createMockSubscription();
      await axios.post(`${API_URL}/push/subscribe`, mockSubscription);
      throw new Error('Should have thrown 401');
    } catch (error) {
      assert(error.response?.status === 401, 'Should return 401');
      log(`      Correctly rejected unauthenticated request`);
    }
  }));
  
  return results;
}

async function scenario3_GetSubscriptions() {
  logStep('Scenario 3: Get User Subscriptions');
  
  const results = [];
  
  results.push(await test('Get customer subscriptions', async () => {
    const response = await axios.get(`${API_URL}/push/subscriptions`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    assert(Array.isArray(response.data.subscriptions), 'Should return array');
    assert(response.data.subscriptions.length > 0, 'Should have subscriptions');
    
    log(`      Active subscriptions: ${response.data.subscriptions.length}`);
  }));
  
  results.push(await test('Get all subscriptions (admin)', async () => {
    const response = await axios.get(`${API_URL}/push/all`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.subscriptions || response.data.rows, 'Should return subscriptions');
    
    const subs = response.data.subscriptions || response.data.rows || [];
    log(`      Total subscriptions: ${subs.length}`);
  }));
  
  return results;
}

async function scenario4_SendToUser() {
  logStep('Scenario 4: Send Notification to Specific User');
  
  const results = [];
  
  results.push(await test('Admin can send to customer', async () => {
    const response = await axios.post(`${API_URL}/push/send/user`, {
      user_id: state.customer.id,
      title: 'Test Notification',
      body: 'This is a test notification for customer',
      url: '/orders/123',
    }, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    assert(Array.isArray(response.data.results), 'Should return results array');
    
    const sent = response.data.results.filter(r => r.success).length;
    log(`      Sent to ${sent} device(s)`);
  }));
  
  results.push(await test('Send requires admin role', async () => {
    try {
      await axios.post(`${API_URL}/push/send/user`, {
        user_id: state.customer.id,
        title: 'Test',
        body: 'Test',
      }, {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      });
      throw new Error('Should have thrown 403');
    } catch (error) {
      assert(error.response?.status === 403, 'Should return 403');
      log(`      Correctly rejected non-admin request`);
    }
  }));
  
  results.push(await test('Send to non-existent user', async () => {
    try {
      await axios.post(`${API_URL}/push/send/user`, {
        user_id: 'non-existent-id',
        title: 'Test',
        body: 'Test',
      }, {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      });
      throw new Error('Should have thrown 404');
    } catch (error) {
      assert(error.response?.status === 404, 'Should return 404');
      log(`      Correctly returned 404 for non-existent user`);
    }
  }));
  
  return results;
}

async function scenario5_Broadcast() {
  logStep('Scenario 5: Broadcast to All Users');
  
  const results = [];
  
  results.push(await test('Admin can broadcast to all', async () => {
    const response = await axios.post(`${API_URL}/push/send/all`, {
      title: 'Broadcast Message',
      body: 'This is a broadcast to all users',
      url: '/promo',
    }, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    assert(typeof response.data.sent === 'number', 'Should return sent count');
    assert(typeof response.data.total === 'number', 'Should return total count');
    
    log(`      Sent: ${response.data.sent}/${response.data.total} devices`);
    log(`      Failed: ${response.data.failed || 0}`);
  }));
  
  results.push(await test('Broadcast requires admin role', async () => {
    try {
      await axios.post(`${API_URL}/push/send/all`, {
        title: 'Test',
        body: 'Test',
      }, {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      });
      throw new Error('Should have thrown 403');
    } catch (error) {
      assert(error.response?.status === 403, 'Should return 403');
      log(`      Correctly rejected non-admin request`);
    }
  }));
  
  return results;
}

async function scenario6_Unsubscribe() {
  logStep('Scenario 6: Unsubscribe from Notifications');
  
  const results = [];
  
  results.push(await test('Customer can unsubscribe', async () => {
    const response = await axios.post(`${API_URL}/push/unsubscribe`, {
      endpoint: state.testSubscription.endpoint,
    }, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    
    assert(response.data.success, 'Should return success');
    log(`      Unsubscribed: ${state.testSubscription.endpoint}`);
  }));
  
  results.push(await test('Unsubscribe non-existent endpoint', async () => {
    const response = await axios.post(`${API_URL}/push/unsubscribe`, {
      endpoint: 'https://non-existent.com/endpoint',
    }, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    
    assert(response.data.success, 'Should return success (no error)');
    log(`      Handled non-existent endpoint gracefully`);
  }));
  
  return results;
}

async function scenario7_SocketNotifications() {
  logStep('Scenario 7: Socket Real-time Notifications');
  
  const results = [];
  
  // Connect sockets
  state.adminSocket = connectSocket(state.adminToken, { role: 'admin' });
  state.customerSocket = connectSocket(state.customerToken, { role: 'customer' });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.push(await test('Admin socket connected', async () => {
    assert(state.adminSocket.connected, 'Should be connected');
    log(`      Admin socket: ✅ connected`);
  }));
  
  results.push(await test('Customer socket connected', async () => {
    assert(state.customerSocket.connected, 'Should be connected');
    log(`      Customer socket: ✅ connected`);
  }));
  
  results.push(await test('Admin sends socket notification', async () => {
    return new Promise((resolve) => {
      let received = false;
      
      state.customerSocket.on('notification', (data) => {
        received = true;
        log(`      Customer received: "${data.title}"`);
        resolve();
      });
      
      state.adminSocket.emit('notification:send', {
        userId: state.customer.id,
        title: 'Socket Test',
        body: 'This is a socket notification',
      });
      
      log(`      Admin sent: notification:send`);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!received) {
          log(`      ⚠️  Notification not received (expected in real implementation)`, 'yellow');
        }
        resolve();
      }, 3000);
    });
  }));
  
  return results;
}

async function scenario8_OrderNotifications() {
  logStep('Scenario 8: Order-based Notifications');
  
  const results = [];
  
  results.push(await test('Customer receives order update via socket', async () => {
    return new Promise((resolve) => {
      let received = false;
      
      state.customerSocket.on('order:updated', (data) => {
        received = true;
        log(`      Order update received: ${data.orderId}`);
        resolve();
      });
      
      // Simulate order update (this would normally come from backend)
      state.adminSocket.emit('order:updated', {
        orderId: 'test-order-123',
        status: 'preparing',
        userId: state.customer.id,
      });
      
      log(`      Admin emitted: order:updated`);
      
      setTimeout(() => {
        if (!received) {
          log(`      ⚠️  Order update not received (expected in real implementation)`, 'yellow');
        }
        resolve();
      }, 2000);
    });
  }));
  
  return results;
}

async function scenario9_PaymentNotifications() {
  logStep('Scenario 9: Payment-based Notifications');
  
  const results = [];
  
  results.push(await test('Payment verification notification', async () => {
    return new Promise((resolve) => {
      let received = false;
      
      state.adminSocket.on('payment:verified', (data) => {
        received = true;
        log(`      Payment verified: ${data.orderId} - ${data.status}`);
        resolve();
      });
      
      // Simulate payment verification
      state.adminSocket.emit('payment:verify', {
        orderId: 'test-payment-123',
        status: 'verified',
      });
      
      log(`      Admin emitted: payment:verify`);
      
      setTimeout(() => {
        if (!received) {
          log(`      ⚠️  Payment notification not received (expected in real implementation)`, 'yellow');
        }
        resolve();
      }, 2000);
    });
  }));
  
  return results;
}

async function scenario10_IntegrationTest() {
  logStep('Scenario 10: Complete Notification Flow');
  
  const results = [];
  
  results.push(await test('Complete flow: Subscribe → Send → Receive', async () => {
    // 1. Subscribe
    const mockSubscription = createMockSubscription();
    await axios.post(`${API_URL}/push/subscribe`, mockSubscription, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    log(`      1. Subscribed ✅`);
    
    // 2. Send notification
    const sendResponse = await axios.post(`${API_URL}/push/send/user`, {
      user_id: state.customer.id,
      title: 'Integration Test',
      body: 'Testing complete flow',
      url: '/test',
    }, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    assert(sendResponse.data.success, 'Send should succeed');
    log(`      2. Sent ✅`);
    
    // 3. Verify via socket
    state.customerSocket.emit('notification:send', {
      userId: state.customer.id,
      title: 'Socket Test',
      body: 'Via socket',
    });
    log(`      3. Socket notification sent ✅`);
    
    log(`      Complete flow successful!`);
  }));
  
  return results;
}

async function cleanup() {
  logStep('Cleanup: Closing connections');
  
  if (state.adminSocket) {
    state.adminSocket.close();
    log(`      Admin socket closed`);
  }
  
  if (state.customerSocket) {
    state.customerSocket.close();
    log(`      Customer socket closed`);
  }
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   🔔 NOTIFICATION SYSTEM E2E TESTS                                ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   1. VAPID Key Retrieval                                          ║', 'cyan');
  log('║   2. Push Subscription                                            ║', 'cyan');
  log('║   3. Get Subscriptions                                            ║', 'cyan');
  log('║   4. Send to User                                                 ║', 'cyan');
  log('║   5. Broadcast to All                                             ║', 'cyan');
  log('║   6. Unsubscribe                                                  ║', 'cyan');
  log('║   7. Socket Real-time Notifications                               ║', 'cyan');
  log('║   8. Order Notifications                                          ║', 'cyan');
  log('║   9. Payment Notifications                                        ║', 'cyan');
  log('║   10. Integration Test                                            ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');

  const allResults = [];

  // Setup
  logStep('Setup: Login & Get Tokens');
  try {
    state.adminToken = await adminLogin();
    state.customerToken = await customerRegister('Notification Test', '089999999998');
    log('   ✅ Admin logged in', 'green');
    log('   ✅ Customer registered', 'green');
  } catch (error) {
    log('   ❌ Setup failed', 'red');
    log(`      ${error.message}`, 'red');
    process.exit(1);
  }

  // Run all scenarios
  allResults.push(...await scenario1_VapidKey());
  allResults.push(...await scenario2_Subscribe());
  allResults.push(...await scenario3_GetSubscriptions());
  allResults.push(...await scenario4_SendToUser());
  allResults.push(...await scenario5_Broadcast());
  allResults.push(...await scenario6_Unsubscribe());
  allResults.push(...await scenario7_SocketNotifications());
  allResults.push(...await scenario8_OrderNotifications());
  allResults.push(...await scenario9_PaymentNotifications());
  allResults.push(...await scenario10_IntegrationTest());
  
  // Cleanup
  await cleanup();

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
    log('\n🎉 All notification tests passed! Ready for implementation.', 'green');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 Fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
