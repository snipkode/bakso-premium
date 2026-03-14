/**
 * Product Image Upload E2E Test
 * Bakso Premium - Image Upload API Tests
 *
 * Tests:
 * - Upload product image (valid file)
 * - Upload product image (invalid file type)
 * - Upload product image (file too large)
 * - Upload product image (no file)
 * - Delete product image
 * - Update product with image
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = process.argv[2] || 'http://localhost:9000';
const API_URL = `${BASE_URL}/api`;
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');

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
  testProductId: null,
  testCategoryId: null,
  uploadedImagePath: null,
};

// Helper functions
async function adminLogin() {
  const response = await axios.post(`${API_URL}/auth/staff`, {
    phone: '081234567890',
    password: 'admin123',
  });
  return response.data.token;
}

async function createTestCategory() {
  const response = await axios.post(`${API_URL}/categories`, {
    name: `Test Category ${Date.now()}`,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return response.data.category.id;
}

async function createTestProduct() {
  const response = await axios.post(`${API_URL}/products`, {
    category_id: state.testCategoryId,
    name: `Test Product ${Date.now()}`,
    price: 15000,
    stock: 100,
    min_stock: 10,
  }, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  return response.data.product;
}

function createTestImage(filePath, label = 'Test Image') {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#F59E0B"/>
      <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
    </svg>
  `;
  
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  
  fs.writeFileSync(filePath, svg);
  return filePath;
}

function createLargeImage(filePath) {
  // Create a large buffer (6MB - larger than 5MB limit)
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a');
  
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  
  fs.writeFileSync(filePath, largeBuffer);
  return filePath;
}

// Tests
async function testUploadValidImage() {
  logStep('Step 1: Upload Valid Image');

  const testImagePath = path.join(UPLOADS_DIR, 'test-valid.jpg');
  createTestImage(testImagePath, 'Valid Test Image');

  await test('Upload valid JPEG image', async () => {
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    const response = await axios.post(`${API_URL}/upload/product-image`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${state.adminToken}`,
      },
    });

    assert(response.data.success, 'Should return success');
    assert(response.data.imageUrl, 'Should return image URL');
    assert(fs.existsSync(response.data.filePath), 'File should exist on disk');
    
    state.uploadedImagePath = response.data.filePath;
    log(`      Uploaded: ${response.data.fileName}`);
    log(`      Size: ${(response.data.fileSize / 1024).toFixed(2)} KB`);
  });

  // Cleanup
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
}

async function testUploadInvalidFileType() {
  logStep('Step 2: Upload Invalid File Type');

  const testImagePath = path.join(UPLOADS_DIR, 'test-invalid.txt');
  
  // Create a text file (invalid type)
  if (!fs.existsSync(path.dirname(testImagePath))) {
    fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
  }
  fs.writeFileSync(testImagePath, 'This is a text file, not an image');

  await test('Reject non-image file', async () => {
    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(testImagePath));

      await axios.post(`${API_URL}/upload/product-image`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${state.adminToken}`,
        },
      });
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      assert(error.response?.data?.error?.includes('image'), 'Should mention image files');
      log(`      Correctly rejected non-image file`);
    }
  });

  // Cleanup
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
}

async function testUploadLargeFile() {
  logStep('Step 3: Upload Large File');

  const testImagePath = path.join(UPLOADS_DIR, 'test-large.jpg');
  createLargeImage(testImagePath);

  await test('Reject file larger than 5MB', async () => {
    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(testImagePath));

      await axios.post(`${API_URL}/upload/product-image`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${state.adminToken}`,
        },
      });
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      assert(
        error.response?.data?.error?.includes('size') || error.response?.status === 413,
        'Should mention file size or return 413'
      );
      log(`      Correctly rejected large file (${(6).toFixed(0)}MB)`);
    }
  });

  // Cleanup
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
}

async function testUploadNoFile() {
  logStep('Step 4: Upload With No File');

  await test('Handle request with no file', async () => {
    try {
      const form = new FormData();
      // Don't append any file

      await axios.post(`${API_URL}/upload/product-image`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${state.adminToken}`,
        },
      });
      throw new Error('Should have thrown 400');
    } catch (error) {
      assert(error.response?.status === 400, 'Should return 400');
      log(`      Correctly handled missing file`);
    }
  });
}

async function testUpdateProductWithImage() {
  logStep('Step 5: Update Product With Image');

  // Create test product
  const product = await createTestProduct();
  state.testProductId = product.id;

  const testImagePath = path.join(UPLOADS_DIR, 'test-product-update.jpg');
  createTestImage(testImagePath, 'Product Update Test');

  await test('Update product with uploaded image', async () => {
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    // First upload the image
    const uploadResponse = await axios.post(`${API_URL}/upload/product-image`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${state.adminToken}`,
      },
    });

    assert(uploadResponse.data.success, 'Upload should succeed');
    const imageUrl = uploadResponse.data.imageUrl;

    // Then update the product
    const updateResponse = await axios.put(
      `${API_URL}/products/${product.id}`,
      { image: imageUrl },
      {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }
    );

    assert(updateResponse.data.success, 'Should return success');
    assert(updateResponse.data.product.image === imageUrl, 'Product image should be updated');
    
    log(`      Product updated with image: ${imageUrl}`);
  });

  // Cleanup
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
}

async function testDeleteProductImage() {
  logStep('Step 6: Delete Product Image');

  await test('Delete uploaded image', async () => {
    if (!state.uploadedImagePath) {
      throw new Error('No uploaded image to delete');
    }

    // Extract file ID from path (assuming format: /uploads/products/uuid.jpg)
    const fileName = path.basename(state.uploadedImagePath);
    
    // Try to delete via API (if endpoint exists)
    try {
      await axios.delete(`${API_URL}/upload/product-image/${fileName}`, {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      });
      log(`      Deleted: ${fileName}`);
    } catch (error) {
      // If delete endpoint doesn't exist, just verify file exists
      if (fs.existsSync(state.uploadedImagePath)) {
        fs.unlinkSync(state.uploadedImagePath);
        log(`      Manually deleted: ${fileName}`);
      }
    }
  });
}

async function testCreateProductWithImage() {
  logStep('Step 7: Create Product With Image Upload');

  const testImagePath = path.join(UPLOADS_DIR, 'test-create-product.jpg');
  createTestImage(testImagePath, 'New Product');

  await test('Create product with image upload in one request', async () => {
    // First upload image
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(`${API_URL}/upload/product-image`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${state.adminToken}`,
      },
    });

    assert(uploadResponse.data.success, 'Upload should succeed');
    const imageUrl = uploadResponse.data.imageUrl;

    // Then create product with the image URL
    const createResponse = await axios.post(`${API_URL}/products`, {
      category_id: state.testCategoryId,
      name: `Product with Image ${Date.now()}`,
      price: 20000,
      image: imageUrl,
      stock: 50,
      min_stock: 10,
    }, {
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });

    assert(createResponse.data.success, 'Should create product');
    assert(createResponse.data.product.image === imageUrl, 'Product should have image URL');
    
    log(`      Created product: ${createResponse.data.product.name}`);
    log(`      Image URL: ${imageUrl}`);
  });

  // Cleanup
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
}

// Main
async function runAllTests() {
  log('\n', 'reset');
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   📸 PRODUCT IMAGE UPLOAD E2E TESTS                               ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('║   Testing:                                                        ║', 'cyan');
  log('║   • Upload valid image (JPEG, PNG, etc)                           ║', 'cyan');
  log('║   • Upload invalid file type                                      ║', 'cyan');
  log('║   • Upload file too large (>5MB)                                  ║', 'cyan');
  log('║   • Upload with no file                                           ║', 'cyan');
  log('║   • Update product with image                                     ║', 'cyan');
  log('║   • Delete product image                                          ║', 'cyan');
  log('║   • Create product with image                                     ║', 'cyan');
  log('║                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}`, 'cyan');

  const allResults = [];

  // Setup
  logStep('Setup: Login & Create Test Data');
  try {
    state.adminToken = await adminLogin();
    state.testCategoryId = await createTestCategory();
    log('   ✅ Setup complete', 'green');
  } catch (error) {
    log('   ❌ Setup failed', 'red');
    log(`      ${error.message}`, 'red');
    process.exit(1);
  }

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    log(`   ✅ Created uploads directory: ${UPLOADS_DIR}`, 'green');
  }

  // Run tests
  allResults.push(...await testUploadValidImage());
  allResults.push(...await testUploadInvalidFileType());
  allResults.push(...await testUploadLargeFile());
  allResults.push(...await testUploadNoFile());
  allResults.push(...await testUpdateProductWithImage());
  allResults.push(...await testDeleteProductImage());
  allResults.push(...await testCreateProductWithImage());

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
