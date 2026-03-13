/**
 * User Management E2E Test
 * Bakso Premium Ordering System - Admin User CRUD Tests
 * 
 * Tests:
 * - List users with pagination and filters
 * - Get user by ID
 * - Create new user
 * - Update user
 * - Delete user
 * - Toggle user status
 * - Change user role
 * - Get user statistics
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

// Test state
const state = {
  adminToken: null,
  createdUserId: null,
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
    return true;
  } catch (error) {
    log(`   ❌ ${name}`, 'red');
    log(`      Error: ${error.message}`, 'red');
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==================== HELPER FUNCTIONS ====================

async function adminLogin() {
  const response = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return response.data.token;
}

// ==================== USER MANAGEMENT TESTS ====================

async function testListUsers() {
  logStep('Step 1: List Users');
  
  await test('Get all users', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users`, { headers });
    
    assert(response.data.success, 'Should return success');
    const users = response.data.users || response.data.rows || [];
    assert(Array.isArray(users), 'Should return users array');
    assert(users.length > 0, 'Should have at least one user');
    
    log(`      Total users: ${users.length}`, 'cyan');
  });
  
  await test('Get users with pagination', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users?page=1&limit=5`, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.pagination, 'Should return pagination');
    assert(response.data.pagination.page === 1, 'Should be page 1');
    assert(response.data.pagination.limit === 5, 'Should have limit 5');
    
    log(`      Page: ${response.data.pagination.page}/${response.data.pagination.totalPages}`, 'cyan');
  });
  
  await test('Filter users by role (admin)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users?role=admin`, { headers });
    
    assert(response.data.success, 'Should return success');
    const users = response.data.users || response.data.rows || [];
    users.forEach(user => {
      assert(user.role === 'admin', 'All users should be admin');
    });
    
    log(`      Admin users: ${users.length}`, 'cyan');
  });
  
  await test('Filter users by status (active)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users?status=active`, { headers });
    
    assert(response.data.success, 'Should return success');
    const users = response.data.users || response.data.rows || [];
    users.forEach(user => {
      assert(user.status === 'active', 'All users should be active');
    });
    
    log(`      Active users: ${users.length}`, 'cyan');
  });
  
  await test('Search users by name', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users?search=Admin`, { headers });
    
    assert(response.data.success, 'Should return success');
    const users = response.data.users || response.data.rows || [];
    users.forEach(user => {
      assert(
        user.name.toLowerCase().includes('admin'),
        'User name should contain "Admin"'
      );
    });
    
    log(`      Found ${users.length} users matching "Admin"`, 'cyan');
  });
}

async function testGetUserById() {
  logStep('Step 2: Get User By ID');
  
  await test('Get first user by ID', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const listResponse = await axios.get(`${API_URL}/users`, { headers });
    const users = listResponse.data.users || listResponse.data.rows || [];
    const firstUser = users[0];
    
    if (!firstUser) {
      throw new Error('No users found');
    }
    
    const response = await axios.get(`${API_URL}/users/${firstUser.id}`, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.id === firstUser.id, 'Should return correct user');
    assert(response.data.user.name === firstUser.name, 'Should have correct name');
    
    log(`      User: ${response.data.user.name}`, 'cyan');
  });
  
  await test('Get non-existent user (404)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    
    try {
      await axios.get(`${API_URL}/users/non-existent-id`, { headers });
      throw new Error('Should have thrown 404');
    } catch (error) {
      assert(error.response?.status === 404, 'Should return 404');
      log(`      Correctly returned 404`, 'cyan');
    }
  });
}

async function testCreateUser() {
  logStep('Step 3: Create New User');
  
  const testUser = {
    name: `Test User ${Date.now()}`,
    phone: `08${Math.floor(Math.random() * 10000000000)}`,
    email: `test${Date.now()}@example.com`,
    password: 'test123',
    role: 'customer',
    status: 'active',
  };
  
  await test('Create new customer user', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.post(`${API_URL}/users`, testUser, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user, 'Should return user');
    assert(response.data.user.name === testUser.name, 'Should have correct name');
    assert(response.data.user.role === 'customer', 'Should have customer role');
    
    state.createdUserId = response.data.user.id;
    log(`      Created user: ${response.data.user.name} (ID: ${state.createdUserId})`, 'cyan');
  });
  
  await test('Create admin user', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const adminUser = {
      name: `Admin Test ${Date.now()}`,
      phone: `08${Math.floor(Math.random() * 10000000000)}`,
      email: `admintest${Date.now()}@example.com`,
      password: 'admin123',
      role: 'admin',
    };
    
    const response = await axios.post(`${API_URL}/users`, adminUser, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.role === 'admin', 'Should have admin role');
    
    log(`      Created admin: ${response.data.user.name}`, 'cyan');
  });
  
  await test('Create kitchen staff', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const kitchenUser = {
      name: `Kitchen Test ${Date.now()}`,
      phone: `08${Math.floor(Math.random() * 10000000000)}`,
      password: 'kitchen123',
      role: 'kitchen',
    };
    
    const response = await axios.post(`${API_URL}/users`, kitchenUser, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.role === 'kitchen', 'Should have kitchen role');
    
    log(`      Created kitchen: ${response.data.user.name}`, 'cyan');
  });
  
  await test('Create user with duplicate phone (409)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    
    try {
      await axios.post(`${API_URL}/users`, {
        name: 'Duplicate User',
        phone: '081234567890', // Already exists
        password: 'test123',
      }, { headers });
      throw new Error('Should have thrown 409');
    } catch (error) {
      assert(error.response?.status === 409, 'Should return 409');
      log(`      Correctly returned 409 Conflict`, 'cyan');
    }
  });
  
  await test('Create user without required fields (400)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    
    try {
      await axios.post(`${API_URL}/users`, {
        email: 'test@example.com',
      }, { headers });
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Correctly returned 400 Bad Request`, 'cyan');
    }
  });
}

async function testUpdateUser() {
  logStep('Step 4: Update User');
  
  if (!state.createdUserId) {
    log('      ⚠️  Skipping - No user created', 'yellow');
    return;
  }
  
  await test('Update user name and email', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const updateData = {
      name: 'Updated Test User',
      email: 'updated@example.com',
    };
    
    const response = await axios.put(`${API_URL}/users/${state.createdUserId}`, updateData, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.name === 'Updated Test User', 'Should have updated name');
    assert(response.data.user.email === 'updated@example.com', 'Should have updated email');
    
    log(`      Updated user: ${response.data.user.name}`, 'cyan');
  });
  
  await test('Change user role to driver', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.patch(
      `${API_URL}/users/${state.createdUserId}/role`,
      { role: 'driver' },
      { headers }
    );
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.role === 'driver', 'Should have driver role');
    
    log(`      Changed role to: ${response.data.user.role}`, 'cyan');
  });
}

async function testToggleStatus() {
  logStep('Step 5: Toggle User Status');
  
  if (!state.createdUserId) {
    log('      ⚠️  Skipping - No user created', 'yellow');
    return;
  }
  
  await test('Deactivate user', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.patch(
      `${API_URL}/users/${state.createdUserId}/status`,
      { status: 'inactive' },
      { headers }
    );
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.status === 'inactive', 'Should be inactive');
    
    log(`      User status: ${response.data.user.status}`, 'cyan');
  });
  
  await test('Activate user', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.patch(
      `${API_URL}/users/${state.createdUserId}/status`,
      { status: 'active' },
      { headers }
    );
    
    assert(response.data.success, 'Should return success');
    assert(response.data.user.status === 'active', 'Should be active');
    
    log(`      User status: ${response.data.user.status}`, 'cyan');
  });
}

async function testGetStats() {
  logStep('Step 6: Get User Statistics');
  
  await test('Get user statistics', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/users/stats`, { headers });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.stats, 'Should return stats');
    assert(typeof response.data.stats.total === 'number', 'Should have total count');
    assert(typeof response.data.stats.active === 'number', 'Should have active count');
    assert(typeof response.data.stats.inactive === 'number', 'Should have inactive count');
    assert(response.data.stats.byRole, 'Should have byRole stats');
    
    log(`      Total: ${response.data.stats.total}`, 'cyan');
    log(`      Active: ${response.data.stats.active}`, 'cyan');
    log(`      Inactive: ${response.data.stats.inactive}`, 'cyan');
    log(`      By Role:`, 'cyan');
    Object.entries(response.data.stats.byRole).forEach(([role, count]) => {
      log(`        ${role}: ${count}`, 'cyan');
    });
  });
}

async function testDeleteUser() {
  logStep('Step 7: Delete User');
  
  if (!state.createdUserId) {
    log('      ⚠️  Skipping - No user created', 'yellow');
    return;
  }
  
  await test('Delete created user', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.delete(`${API_URL}/users/${state.createdUserId}`, { headers });
    
    assert(response.data.success, 'Should return success');
    log(`      Deleted user ID: ${state.createdUserId}`, 'cyan');
  });
  
  await test('Delete non-existent user (404)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    
    try {
      await axios.delete(`${API_URL}/users/non-existent-id`, { headers });
      throw new Error('Should have thrown 404');
    } catch (error) {
      assert(error.response?.status === 404, 'Should return 404');
      log(`      Correctly returned 404`, 'cyan');
    }
  });
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   👥 USER MANAGEMENT E2E TESTS                                    ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   • List users (pagination, filters, search)                      ║', 'cyan');
  log('║   • Get user by ID                                                ║', 'cyan');
  log('║   • Create user (customer, admin, kitchen, driver)                ║', 'cyan');
  log('║   • Update user (name, email, role)                               ║', 'cyan');
  log('║   • Toggle status (active/inactive)                               ║', 'cyan');
  log('║   • Get statistics                                                ║', 'cyan');
  log('║   • Delete user                                                   ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');
  
  const totalResults = { passed: 0, failed: 0 };
  
  // Login as admin
  logStep('Setup: Admin Login');
  try {
    state.adminToken = await adminLogin();
    log('   ✅ Admin logged in', 'green');
  } catch (error) {
    log('   ❌ Admin login failed', 'red');
    process.exit(1);
  }
  
  // Run all test scenarios
  const results = [
    await testListUsers(),
    await testGetUserById(),
    await testCreateUser(),
    await testUpdateUser(),
    await testToggleStatus(),
    await testGetStats(),
    await testDeleteUser(),
  ];
  
  // Calculate totals
  results.forEach(r => {
    if (r) totalResults.passed++;
    else totalResults.failed++;
  });
  
  // Final summary
  log(`\n\n${'═'.repeat(70)}`, 'cyan');
  log('  📊 FINAL TEST SUMMARY', 'cyan');
  log(`${'═'.repeat(70)}`, 'cyan');
  log(`\n  ✅ Total Passed: ${totalResults.passed}`, 'green');
  log(`  ❌ Total Failed: ${totalResults.failed}`, 'red');
  log(`  📝 Total Tests:  ${totalResults.passed + totalResults.failed}`, 'cyan');
  
  const successRate = ((totalResults.passed / (totalResults.passed + totalResults.failed)) * 100).toFixed(1);
  log(`  📈 Success Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  log(`\n${'═'.repeat(70)}`, 'cyan');
  
  // Exit with appropriate code
  if (totalResults.failed > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
