/**
 * Reports E2E Test
 * Bakso Premium Ordering System - Reports API Tests
 *
 * Tests:
 * - Get dashboard stats (today, week, month, year)
 * - Get report list
 * - Generate daily report
 * - Generate weekly report
 * - Generate monthly report
 * - Generate staff performance report
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

// Test state
const state = {
  adminToken: null,
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

// ==================== HELPER FUNCTIONS ====================

async function adminLogin() {
  const response = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return response.data.token;
}

// ==================== REPORTS TESTS ====================

async function testGetStats() {
  logStep('Step 1: Get Dashboard Stats');

  const ranges = ['today', 'week', 'month', 'year'];

  for (const range of ranges) {
    await test(`Get stats for ${range}`, async () => {
      const headers = { Authorization: `Bearer ${state.adminToken}` };
      const response = await axios.get(`${API_URL}/reports/stats`, {
        headers,
        params: { range },
      });

      assert(response.data.success, 'Should return success');
      assert(response.data.stats, 'Should return stats');
      
      const stats = response.data.stats;
      assert(typeof stats.revenue === 'number', 'Should have revenue number');
      assert(typeof stats.orders === 'number', 'Should have orders count');
      assert(typeof stats.productsSold === 'number', 'Should have products sold count');
      assert(typeof stats.newCustomers === 'number', 'Should have new customers count');
      assert(typeof stats.completionRate === 'number', 'Should have completion rate');

      log(`      Revenue: Rp ${stats.revenue.toLocaleString('id-ID')}`, 'cyan');
      log(`      Orders: ${stats.orders}`, 'cyan');
      log(`      Products Sold: ${stats.productsSold}`, 'cyan');
      log(`      New Customers: ${stats.newCustomers}`, 'cyan');
      log(`      Completion Rate: ${stats.completionRate}%`, 'cyan');
    });
  }

  await test('Get stats with invalid range (should default to today)', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports/stats`, {
      headers,
      params: { range: 'invalid' },
    });

    assert(response.data.success, 'Should return success');
    assert(response.data.stats, 'Should return stats');
    log(`      Defaulted to today's stats`, 'cyan');
  });
}

async function testGetReportList() {
  logStep('Step 2: Get Report List');

  await test('Get list of generated reports', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports`, { headers });

    assert(response.data.success, 'Should return success');
    assert(Array.isArray(response.data.reports), 'Should return reports array');

    log(`      Total reports: ${response.data.reports.length}`, 'cyan');
    
    if (response.data.reports.length > 0) {
      const firstReport = response.data.reports[0];
      log(`      Latest: ${firstReport.fileName}`, 'cyan');
    }
  });
}

async function testGenerateDailyReport() {
  logStep('Step 3: Generate Daily Report');

  await test('Generate daily sales report', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports/daily`, {
      headers,
      params: { range: 'today' },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    assert(response.headers['content-type'] === 'application/pdf', 'Should be PDF');
    assert(response.data.size > 0, 'PDF should not be empty');

    log(`      PDF generated: ${response.data.size} bytes`, 'cyan');
  });

  await test('Generate daily report for specific date', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const response = await axios.get(`${API_URL}/reports/daily`, {
      headers,
      params: { date: dateStr },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    log(`      PDF for ${dateStr} generated`, 'cyan');
  });
}

async function testGenerateWeeklyReport() {
  logStep('Step 4: Generate Weekly Report');

  await test('Generate weekly sales report', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports/weekly`, {
      headers,
      params: { range: 'week' },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    assert(response.data.size > 0, 'PDF should not be empty');

    log(`      Weekly PDF generated: ${response.data.size} bytes`, 'cyan');
  });

  await test('Generate weekly report with specific start date', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const response = await axios.get(`${API_URL}/reports/weekly`, {
      headers,
      params: { weekStart: weekStart.toISOString() },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    log(`      Weekly PDF from ${weekStart.toISOString().split('T')[0]} generated`, 'cyan');
  });
}

async function testGenerateMonthlyReport() {
  logStep('Step 5: Generate Monthly Report');

  await test('Generate monthly sales report', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports/monthly`, {
      headers,
      params: { range: 'month' },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    assert(response.data.size > 0, 'PDF should not be empty');

    log(`      Monthly PDF generated: ${response.data.size} bytes`, 'cyan');
  });

  await test('Generate monthly report for specific month', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toISOString().split('T')[0];

    const response = await axios.get(`${API_URL}/reports/monthly`, {
      headers,
      params: { month: monthStr },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    log(`      Monthly PDF for ${monthStr} generated`, 'cyan');
  });
}

async function testGenerateStaffReport() {
  logStep('Step 6: Generate Staff Performance Report');

  await test('Generate staff performance report', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const response = await axios.get(`${API_URL}/reports/staff`, {
      headers,
      params: { period: 'week' },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    assert(response.data.size > 0, 'PDF should not be empty');

    log(`      Staff performance PDF generated: ${response.data.size} bytes`, 'cyan');
  });

  await test('Generate staff report with date range', async () => {
    const headers = { Authorization: `Bearer ${state.adminToken}` };
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const response = await axios.get(`${API_URL}/reports/staff`, {
      headers,
      params: { 
        period: 'custom',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      responseType: 'blob',
    });

    assert(response.data instanceof Blob, 'Should return PDF blob');
    log(`      Staff report for custom range generated`, 'cyan');
  });
}

async function testUnauthorizedAccess() {
  logStep('Step 7: Test Unauthorized Access');

  await test('Get stats without token (401)', async () => {
    try {
      await axios.get(`${API_URL}/reports/stats`);
      throw new Error('Should have thrown 401');
    } catch (error) {
      assert(error.response?.status === 401, 'Should return 401');
      log(`      Correctly returned 401 Unauthorized`, 'cyan');
    }
  });

  await test('Generate report without token (401)', async () => {
    try {
      await axios.get(`${API_URL}/reports/daily`, { responseType: 'blob' });
      throw new Error('Should have thrown 401');
    } catch (error) {
      assert(error.response?.status === 401, 'Should return 401');
      log(`      Correctly returned 401 Unauthorized`, 'cyan');
    }
  });

  await test('Get reports with customer token (403)', async () => {
    // First register/login as customer
    const customerResponse = await axios.post(`${API_URL}/auth/customer`, {
      name: 'Test Customer',
      phone: '089999999999',
    });
    
    const customerToken = customerResponse.data.token;

    try {
      await axios.get(`${API_URL}/reports/stats`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      throw new Error('Should have thrown 403');
    } catch (error) {
      assert(error.response?.status === 403, 'Should return 403');
      log(`      Correctly returned 403 Forbidden`, 'cyan');
    }
  });
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   📊 REPORTS API E2E TESTS                                        ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   • Dashboard Stats (today, week, month, year)                    ║', 'cyan');
  log('║   • Report List                                                   ║', 'cyan');
  log('║   • Generate Daily Report                                         ║', 'cyan');
  log('║   • Generate Weekly Report                                        ║', 'cyan');
  log('║   • Generate Monthly Report                                         ║', 'cyan');
  log('║   • Generate Staff Performance Report                             ║', 'cyan');
  log('║   • Unauthorized Access                                           ║', 'cyan');
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
    log(`      ${error.message}`, 'red');
    process.exit(1);
  }

  // Run all test scenarios
  const results = [
    await testGetStats(),
    await testGetReportList(),
    await testGenerateDailyReport(),
    await testGenerateWeeklyReport(),
    await testGenerateMonthlyReport(),
    await testGenerateStaffReport(),
    await testUnauthorizedAccess(),
  ];

  // Calculate totals
  results.forEach(r => {
    if (Array.isArray(r)) {
      r.forEach(result => {
        if (result?.passed) totalResults.passed++;
        else totalResults.failed++;
      });
    }
  });

  // Final summary
  const actualPassed = totalResults.passed;
  const actualFailed = totalResults.failed;

  log(`\n\n${'═'.repeat(70)}`, 'cyan');
  log('  📊 FINAL TEST SUMMARY', 'cyan');
  log(`${'═'.repeat(70)}`, 'cyan');
  log(`\n  ✅ Total Passed: ${actualPassed}`, 'green');
  log(`  ❌ Total Failed: ${actualFailed}`, 'red');
  log(`  📝 Total Tests:  ${actualPassed + actualFailed}`, 'cyan');

  const successRate = actualPassed + actualFailed > 0 
    ? ((actualPassed / (actualPassed + actualFailed)) * 100).toFixed(1)
    : '0.0';
  log(`  📈 Success Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

  log(`\n${'═'.repeat(70)}`, 'cyan');

  // Exit with appropriate code
  if (actualFailed > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
