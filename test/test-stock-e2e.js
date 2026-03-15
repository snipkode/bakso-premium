/**
 * Stock Management E2E Test
 * Bakso Premium - Product Stock API Tests
 *
 * Tests:
 * - Get products with stock info
 * - Update product stock
 * - Get low stock products
 * - Create order with stock validation
 * - Auto reduce stock on order
 * - Auto unavailable when stock = 0
 */

const axios = require('axios');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;

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

// State
const state = {
  adminToken: null,
  customerToken: null,
  testProductId: null,
  testCategoryId: null,
};

// Helper functions
async function adminLogin() {
  const res = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return res.data.token;
}

async function customerLogin() {
  const res = await axios.post(`${API_URL}/auth/customer`, {
    name: 'Test Customer',
    phone: '089999999999',
  });
  return res.data.token;
}

async function createTestCategory() {
  const res = await axios.post(`${API_URL}/categories`, {
    name: `Test Category ${Date.now()}`,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return res.data.category.id;
}

async function createTestProduct(stock = 50) {
  const res = await axios.post(`${API_URL}/products`, {
    category_id: state.testCategoryId,
    name: `Test Product ${Date.now()}`,
    price: 15000,
    stock: stock,
    min_stock: 10,
    is_available: true,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return res.data.product;
}

// Tests
async function testGetProducts() {
  logStep('Step 1: Get Products with Stock Info');

  const results = [];

  results.push(await test('Get all products includes stock field', async () => {
    const res = await axios.get(`${API_URL}/products`);
    const products = res.data.products || [];
    
    assert(products.length > 0, 'Should have products');
    const product = products[0];
    assert('stock' in product, 'Should have stock field');
    assert('min_stock' in product, 'Should have min_stock field');
    
    log(`      Product: ${product.name}`);
    log(`      Stock: ${product.stock}`);
    log(`      Min Stock: ${product.min_stock}`);
  }));

  return results;
}

async function testUpdateStock() {
  logStep('Step 2: Update Product Stock');

  // Create test product
  const product = await createTestProduct(50);
  state.testProductId = product.id;
  
  const results = [];

  results.push(await test('Update stock to specific value', async () => {
    const res = await axios.patch(
      `${API_URL}/products/${product.id}/stock`,
      { stock: 30 },
      { headers: { Authorization: `Bearer ${state.adminToken}` } }
    );

    assert(res.data.success, 'Should return success');
    assert(res.data.product.stock === 30, 'Stock should be updated to 30');
    log(`      Stock updated to: ${res.data.product.stock}`);
  }));

  results.push(await test('Update min_stock threshold', async () => {
    const res = await axios.patch(
      `${API_URL}/products/${product.id}/stock`,
      { min_stock: 5 },
      { headers: { Authorization: `Bearer ${state.adminToken}` } }
    );

    assert(res.data.success, 'Should return success');
    assert(res.data.product.min_stock === 5, 'Min stock should be updated to 5');
    log(`      Min stock updated to: ${res.data.product.min_stock}`);
  }));

  results.push(await test('Reject negative stock', async () => {
    try {
      await axios.patch(
        `${API_URL}/products/${product.id}/stock`,
        { stock: -5 },
        { headers: { Authorization: `Bearer ${state.adminToken}` } }
      );
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Correctly rejected negative stock`);
    }
  }));

  results.push(await test('Auto set unavailable when stock = 0', async () => {
    // Set stock to 0
    await axios.patch(
      `${API_URL}/products/${product.id}/stock`,
      { stock: 0 },
      { headers: { Authorization: `Bearer ${state.adminToken}` } }
    );

    // Get product to check availability
    const res = await axios.get(`${API_URL}/products/${product.id}`);
    assert(res.data.product.stock === 0, 'Stock should be 0');
    assert(res.data.product.is_available === false, 'Should be unavailable when stock is 0');
    log(`      Auto-set unavailable when stock = 0`);
  }));

  // Restore stock for next tests
  await axios.patch(
    `${API_URL}/products/${product.id}/stock`,
    { stock: 50 },
    { headers: { Authorization: `Bearer ${state.adminToken}` } }
  );

  return results;
}

async function testLowStockProducts() {
  logStep('Step 3: Get Low Stock Products');

  // Create low stock product
  const lowStockProduct = await createTestProduct(5);
  const results = [];
  
  results.push(await test('Get products with stock ≤ min_stock', async () => {
    const res = await axios.get(
      `${API_URL}/products/stock/low`,
      { headers: { Authorization: `Bearer ${state.adminToken}` } }
    );

    assert(res.data.success, 'Should return success');
    const products = res.data.products || [];
    
    log(`      Low stock products found: ${products.length}`);
    if (products.length > 0) {
      const found = products.find(p => p.id === lowStockProduct.id);
      assert(found, 'Should include low stock product');
      log(`      ✅ Found: ${found.name} (stock: ${found.stock}, min: ${found.min_stock})`);
    }
  }));

  return results;
}

async function testOrderStockValidation() {
  logStep('Step 4: Order Stock Validation');

  // Create fresh product with limited stock just for this test
  const testProduct = await createTestProduct(10);
  log(`      Created test product: ${testProduct.name} (stock: ${testProduct.stock})`);

  const results = [];

  results.push(await test('Reject order when quantity > stock', async () => {
    try {
      await axios.post(`${API_URL}/orders`, {
        order_type: 'takeaway',
        items: [{
          product_id: testProduct.id,
          quantity: 15, // More than stock (10)
        }],
      }, {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      });
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      assert(error.response?.data?.error?.includes('Stock tidak cukup'), 'Should mention insufficient stock');
      log(`      ✅ Correctly rejected order with insufficient stock`);
    }
  }));

  // Create another fresh product for the "allow order" test
  const orderProduct = await createTestProduct(20);
  
  results.push(await test('Allow order when quantity ≤ stock', async () => {
    const res = await axios.post(`${API_URL}/orders`, {
      order_type: 'takeaway',
      items: [{
        product_id: orderProduct.id,
        quantity: 5, // Less than stock (20)
      }],
    }, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });

    assert(res.data.success, 'Should create order successfully');
    log(`      ✅ Order created: ${res.data.order.order_number}`);
  }));

  return results;
}

async function testStockReduction() {
  logStep('Step 5: Auto Stock Reduction on Order');

  // Create product with known stock
  const product = await createTestProduct(100);
  state.testProductId = product.id;
  const initialStock = product.stock;
  const orderQuantity = 3;
  
  const results = [];

  results.push(await test('Reduce stock after order creation', async () => {
    // Create order
    await axios.post(`${API_URL}/orders`, {
      order_type: 'takeaway',
      items: [{
        product_id: product.id,
        quantity: orderQuantity,
      }],
    }, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });

    // Check stock after order
    const res = await axios.get(`${API_URL}/products/${product.id}`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });

    const newStock = res.data.product.stock;
    assert(newStock === initialStock - orderQuantity, `Stock should be reduced from ${initialStock} to ${initialStock - orderQuantity}`);
    log(`      Stock reduced: ${initialStock} → ${newStock}`);
  }));

  return results;
}

async function testMultipleItemsOrder() {
  logStep('Step 6: Multiple Items Order Stock Reduction');

  // Create 2 fresh test products with known stock
  const product1 = await createTestProduct(50);
  const product2 = await createTestProduct(30);
  
  const initialStock1 = product1.stock;
  const initialStock2 = product2.stock;
  const qty1 = 5;
  const qty2 = 3;
  
  const results = [];

  results.push(await test('Reduce stock for all items in order', async () => {
    // Create order with multiple items
    const orderRes = await axios.post(`${API_URL}/orders`, {
      order_type: 'takeaway',
      items: [
        { product_id: product1.id, quantity: qty1 },
        { product_id: product2.id, quantity: qty2 },
      ],
    }, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });

    assert(orderRes.data.success, 'Should create order successfully');

    // Wait a moment for stock reduction
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check stock for both products
    const res1 = await axios.get(`${API_URL}/products/${product1.id}`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    const res2 = await axios.get(`${API_URL}/products/${product2.id}`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });

    const expectedStock1 = initialStock1 - qty1;
    const expectedStock2 = initialStock2 - qty2;
    
    assert(res1.data.product.stock === expectedStock1, `Product 1 stock should be ${expectedStock1}, got ${res1.data.product.stock}`);
    assert(res2.data.product.stock === expectedStock2, `Product 2 stock should be ${expectedStock2}, got ${res2.data.product.stock}`);
    
    log(`      Product 1: ${initialStock1} → ${res1.data.product.stock}`);
    log(`      Product 2: ${initialStock2} → ${res2.data.product.stock}`);
  }));

  return results;
}

// Main
async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   📦 STOCK MANAGEMENT E2E TESTS                                   ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   • Get products with stock info                                  ║', 'cyan');
  log('║   • Update product stock                                          ║', 'cyan');
  log('║   • Get low stock products                                        ║', 'cyan');
  log('║   • Order stock validation                                        ║', 'cyan');
  log('║   • Auto stock reduction on order                                 ║', 'cyan');
  log('║   • Multiple items order                                          ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');

  const allResults = [];

  // Setup
  logStep('Setup: Login & Create Test Data');
  try {
    state.adminToken = await adminLogin();
    state.customerToken = await customerLogin();
    state.testCategoryId = await createTestCategory();
    log('   ✅ Setup complete', 'green');
  } catch (error) {
    log('   ❌ Setup failed', 'red');
    log(`      ${error.message}`, 'red');
    process.exit(1);
  }

  // Run tests and collect results
  const testGroups = [
    await testGetProducts(),
    await testUpdateStock(),
    await testLowStockProducts(),
    await testOrderStockValidation(),
    await testStockReduction(),
    await testMultipleItemsOrder(),
  ];
  
  testGroups.forEach(group => {
    if (Array.isArray(group)) {
      allResults.push(...group);
    } else if (group) {
      allResults.push(group);
    }
  });

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

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 Fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
