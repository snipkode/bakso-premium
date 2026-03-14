/**
 * Admin Product Management E2E Test
 * Bakso Premium - Complete Admin Product Workflow Tests
 *
 * Scenarios:
 * 1. Admin login
 * 2. Create category
 * 3. Upload product image
 * 4. Create product with image
 * 5. View all products
 * 6. Update product details
 * 7. Update product stock
 * 8. Toggle product availability
 * 9. Filter and search products
 * 10. Delete product
 * 11. Handle low stock alerts
 * 12. Create multiple products (bulk simulation)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');

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
  categories: [],
  products: [],
  uploadedImages: [],
};

// ==================== HELPER FUNCTIONS ====================

async function adminLogin() {
  const response = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return response.data.token;
}

function createTestImage(label) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#F59E0B"/>
      <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
    </svg>
  `;
  
  const fileName = `test-${Date.now()}-${label.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  
  fs.writeFileSync(filePath, svg);
  return { fileName, filePath };
}

async function uploadImage(filePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

  const response = await axios.post(`${API_URL}/upload/product-image`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${state.adminToken}`,
    },
  });

  state.uploadedImages.push(response.data.filePath);
  return response.data;
}

async function createCategory(name, description) {
  const response = await axios.post(`${API_URL}/categories`, {
    name,
    description,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return response.data.category;
}

async function createProduct(categoryId, name, price, imageUrl, stock = 100) {
  const response = await axios.post(`${API_URL}/products`, {
    category_id: categoryId,
    name,
    price,
    image: imageUrl,
    stock,
    min_stock: 10,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return response.data.product;
}

// ==================== TEST SCENARIOS ====================

async function scenario1_Login() {
  logStep('Scenario 1: Admin Login');
  
  const results = [];
  
  results.push(await test('Admin can login successfully', async () => {
    const response = await axios.post(`${API_URL}/auth/staff`, {
      phone: '081234567890',
      password: 'admin123',
    });
    
    assert(response.data.success, 'Should return success');
    assert(response.data.token, 'Should return token');
    assert(response.data.user.role === 'admin', 'Should be admin role');
    
    state.adminToken = response.data.token;
    log(`      Logged in as: ${response.data.user.name}`);
  }));
  
  return results;
}

async function scenario2_CreateCategory() {
  logStep('Scenario 2: Create Category for Products');
  
  const results = [];
  
  results.push(await test('Create main bakso category', async () => {
    const category = await createCategory(
      'Bakso Test',
      'Kategori untuk testing produk bakso'
    );
    
    assert(category.id, 'Should have ID');
    assert(category.name === 'Bakso Test', 'Should have correct name');
    
    state.categories.push(category);
    log(`      Created category: ${category.name}`);
  }));
  
  results.push(await test('Create drinks category', async () => {
    const category = await createCategory(
      'Minuman Test',
      'Kategori untuk testing minuman'
    );
    
    assert(category.id, 'Should have ID');
    state.categories.push(category);
    log(`      Created category: ${category.name}`);
  }));
  
  return results;
}

async function scenario3_UploadImage() {
  logStep('Scenario 3: Upload Product Images');
  
  const results = [];
  
  results.push(await test('Upload product image (JPEG)', async () => {
    const { filePath } = createTestImage('Test Product 1');
    const uploadData = await uploadImage(filePath);
    
    assert(uploadData.success, 'Upload should succeed');
    assert(uploadData.imageUrl, 'Should return image URL');
    assert(fs.existsSync(uploadData.filePath), 'File should exist');
    
    log(`      Uploaded: ${uploadData.fileName}`);
    log(`      Size: ${(uploadData.fileSize / 1024).toFixed(2)} KB`);
    
    // Cleanup temp file
    fs.unlinkSync(filePath);
  }));
  
  results.push(await test('Upload second product image', async () => {
    const { filePath } = createTestImage('Test Product 2');
    const uploadData = await uploadImage(filePath);
    
    assert(uploadData.success, 'Upload should succeed');
    log(`      Uploaded: ${uploadData.fileName}`);
    
    fs.unlinkSync(filePath);
  }));
  
  return results;
}

async function scenario4_CreateProduct() {
  logStep('Scenario 4: Create Products with Images');
  
  const results = [];
  const categoryId = state.categories[0].id;
  
  results.push(await test('Create first product with image', async () => {
    const product = await createProduct(
      categoryId,
      'Bakso Super',
      25000,
      state.uploadedImages[0],
      50
    );
    
    assert(product.id, 'Should have ID');
    assert(product.name === 'Bakso Super', 'Should have correct name');
    assert(product.image === state.uploadedImages[0], 'Should have image URL');
    assert(product.stock === 50, 'Should have correct stock');
    
    state.products.push(product);
    log(`      Created: ${product.name} (Stock: ${product.stock})`);
  }));
  
  results.push(await test('Create second product with image', async () => {
    const product = await createProduct(
      categoryId,
      'Bakso Premium',
      30000,
      state.uploadedImages[1],
      30
    );
    
    assert(product.id, 'Should have ID');
    state.products.push(product);
    log(`      Created: ${product.name} (Stock: ${product.stock})`);
  }));
  
  results.push(await test('Create product without image', async () => {
    const product = await createProduct(
      categoryId,
      'Bakso Regular',
      15000,
      null,
      100
    );
    
    assert(product.id, 'Should have ID');
    state.products.push(product);
    log(`      Created: ${product.name} (No image)`);
  }));
  
  return results;
}

async function scenario5_ViewProducts() {
  logStep('Scenario 5: View All Products');
  
  const results = [];
  
  results.push(await test('Get all products', async () => {
    const response = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    const products = response.data.products || response.data.rows || [];
    assert(products.length >= 3, 'Should have at least 3 products');
    
    log(`      Total products: ${products.length}`);
  }));
  
  results.push(await test('Get product by ID', async () => {
    const productId = state.products[0].id;
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    assert(response.data.product.id === productId, 'Should return correct product');
    log(`      Retrieved: ${response.data.product.name}`);
  }));
  
  return results;
}

async function scenario6_UpdateProduct() {
  logStep('Scenario 6: Update Product Details');
  
  const results = [];
  const product = state.products[0];
  
  results.push(await test('Update product name and price', async () => {
    const response = await axios.put(
      `${API_URL}/products/${product.id}`,
      {
        name: 'Bakso Super Jumbo',
        price: 35000,
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.success, 'Should return success');
    assert(response.data.product.name === 'Bakso Super Jumbo', 'Name should be updated');
    assert(response.data.product.price === 35000, 'Price should be updated');
    
    log(`      Updated: ${response.data.product.name} - Rp ${response.data.product.price}`);
  }));
  
  results.push(await test('Update product description', async () => {
    const response = await axios.put(
      `${API_URL}/products/${product.id}`,
      {
        description: 'Bakso super besar dengan topping lengkap',
      },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.success, 'Should return success');
    log(`      Description updated`);
  }));
  
  return results;
}

async function scenario7_UpdateStock() {
  logStep('Scenario 7: Update Product Stock');
  
  const results = [];
  const product = state.products[1];
  
  results.push(await test('Update stock via API', async () => {
    const response = await axios.patch(
      `${API_URL}/products/${product.id}/stock`,
      { stock: 20, min_stock: 5 },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.success, 'Should return success');
    assert(response.data.product.stock === 20, 'Stock should be updated');
    assert(response.data.product.min_stock === 5, 'Min stock should be updated');
    
    log(`      Stock: ${product.stock} → ${response.data.product.stock}`);
    log(`      Min Stock: ${product.min_stock} → ${response.data.product.min_stock}`);
  }));
  
  results.push(await test('Reduce stock to low level', async () => {
    const response = await axios.patch(
      `${API_URL}/products/${product.id}/stock`,
      { stock: 3 },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.product.stock === 3, 'Stock should be 3');
    log(`      Low stock alert: ${response.data.product.stock} (min: ${response.data.product.min_stock})`);
  }));
  
  return results;
}

async function scenario8_ToggleAvailability() {
  logStep('Scenario 8: Toggle Product Availability');
  
  const results = [];
  const product = state.products[2];
  
  results.push(await test('Disable product availability', async () => {
    const response = await axios.patch(
      `${API_URL}/products/${product.id}/availability`,
      {},
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.product.is_available === false, 'Should be unavailable');
    log(`      ${product.name}: Available → Unavailable`);
  }));
  
  results.push(await test('Re-enable product availability', async () => {
    const response = await axios.patch(
      `${API_URL}/products/${product.id}/availability`,
      {},
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.product.is_available === true, 'Should be available');
    log(`      ${product.name}: Unavailable → Available`);
  }));
  
  return results;
}

async function scenario9_FilterSearch() {
  logStep('Scenario 9: Filter and Search Products');
  
  const results = [];
  
  results.push(await test('Search products by name', async () => {
    const response = await axios.get(`${API_URL}/products?search=Bakso`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    const products = response.data.products || [];
    assert(products.length > 0, 'Should find products');
    log(`      Found ${products.length} products matching "Bakso"`);
  }));
  
  results.push(await test('Filter by category', async () => {
    const response = await axios.get(
      `${API_URL}/products?category_id=${state.categories[0].id}`,
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    const products = response.data.products || [];
    assert(products.length > 0, 'Should find products in category');
    log(`      Found ${products.length} products in category`);
  }));
  
  return results;
}

async function scenario10_DeleteProduct() {
  logStep('Scenario 10: Delete Product');
  
  const results = [];
  const product = state.products[2];
  
  results.push(await test('Delete product', async () => {
    const response = await axios.delete(
      `${API_URL}/products/${product.id}`,
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );
    
    assert(response.data.success, 'Should return success');
    log(`      Deleted: ${product.name}`);
  }));
  
  results.push(await test('Verify product deleted', async () => {
    try {
      await axios.get(`${API_URL}/products/${product.id}`, {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      });
      throw new Error('Should have thrown 404');
    } catch (error) {
      assert(error.response?.status === 404, 'Should return 404');
      log(`      Verified: Product no longer exists`);
    }
  }));
  
  return results;
}

async function scenario11_LowStockAlert() {
  logStep('Scenario 11: Low Stock Alerts');
  
  const results = [];
  
  results.push(await test('Get low stock products', async () => {
    const response = await axios.get(`${API_URL}/products/stock/low`, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    
    const products = response.data.products || [];
    assert(Array.isArray(products), 'Should return array');
    log(`      Low stock products: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach(p => {
        log(`        - ${p.name}: ${p.stock} (min: ${p.min_stock})`);
      });
    }
  }));
  
  return results;
}

async function scenario12_BulkCreate() {
  logStep('Scenario 12: Bulk Product Creation (Simulation)');
  
  const results = [];
  const categoryId = state.categories[0].id;
  const testProducts = [
    { name: 'Bakso A', price: 20000, stock: 50 },
    { name: 'Bakso B', price: 22000, stock: 40 },
    { name: 'Bakso C', price: 25000, stock: 30 },
  ];
  
  results.push(await test('Create multiple products', async () => {
    for (const testData of testProducts) {
      const product = await createProduct(
        categoryId,
        testData.name,
        testData.price,
        null,
        testData.stock
      );
      state.products.push(product);
      log(`      Created: ${product.name}`);
    }
    
    assert(state.products.length >= 5, 'Should have at least 5 products');
  }));
  
  return results;
}

async function cleanup() {
  logStep('Cleanup: Removing uploaded test images');
  
  state.uploadedImages.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`      Deleted: ${path.basename(filePath)}`);
    }
  });
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   🛍️  ADMIN PRODUCT MANAGEMENT E2E TESTS                          ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Complete Admin Workflow:                                        ║', 'cyan');
  log('║   1. Admin Login                                                  ║', 'cyan');
  log('║   2. Create Categories                                            ║', 'cyan');
  log('║   3. Upload Product Images                                        ║', 'cyan');
  log('║   4. Create Products                                              ║', 'cyan');
  log('║   5. View Products                                                ║', 'cyan');
  log('║   6. Update Product Details                                       ║', 'cyan');
  log('║   7. Update Stock                                                 ║', 'cyan');
  log('║   8. Toggle Availability                                          ║', 'cyan');
  log('║   9. Filter & Search                                              ║', 'cyan');
  log('║   10. Delete Product                                              ║', 'cyan');
  log('║   11. Low Stock Alerts                                            ║', 'cyan');
  log('║   12. Bulk Creation                                               ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');

  const allResults = [];

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    log('✅ Created uploads directory', 'green');
  }

  // Run all scenarios
  allResults.push(...await scenario1_Login());
  allResults.push(...await scenario2_CreateCategory());
  allResults.push(...await scenario3_UploadImage());
  allResults.push(...await scenario4_CreateProduct());
  allResults.push(...await scenario5_ViewProducts());
  allResults.push(...await scenario6_UpdateProduct());
  allResults.push(...await scenario7_UpdateStock());
  allResults.push(...await scenario8_ToggleAvailability());
  allResults.push(...await scenario9_FilterSearch());
  allResults.push(...await scenario10_DeleteProduct());
  allResults.push(...await scenario11_LowStockAlert());
  allResults.push(...await scenario12_BulkCreate());
  
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

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 Fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
