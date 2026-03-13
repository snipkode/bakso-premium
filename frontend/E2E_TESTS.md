# 🧪 Frontend E2E Tests - Bakso Premium

End-to-end tests using **Playwright** that simulate real human interactions with the frontend application.

## 📋 Test Scenarios

### 1. Customer Flow (4 tests)
- ✅ Complete journey: Browse → Add to cart → Checkout → Pay → Track order
- ✅ Customer login with phone number
- ✅ Dine-in order with table number
- ✅ Delivery order (handles business rule: new customers must order takeaway first)

### 2. Admin Flow (4 tests)
- ✅ Admin login and dashboard view
- ✅ Admin verifies pending payment
- ✅ Admin generates daily report (PDF download)
- ✅ Admin views all orders

### 3. Kitchen Flow (2 tests)
- ✅ Kitchen login and view orders
- ✅ Kitchen updates order status (paid → preparing → ready)

### 4. Driver Flow (1 test)
- ✅ Driver login and view deliveries

### 5. Real-time Updates (1 test)
- ✅ Order status updates in real-time (multi-tab test)

### 6. Error Handling (2 tests)
- ✅ Empty cart checkout shows error
- ✅ Invalid login shows error

## 🚀 Setup

### 1. Install Playwright

```bash
cd frontend
npm install -D @playwright/test
```

### 2. Install Browsers

```bash
npx playwright install
```

This will install Chromium, Firefox, and WebKit browsers for testing.

### 3. Install System Dependencies (Linux only)

```bash
npx playwright install-deps
```

## ▶️ Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run with Visible Browser (Headed)

```bash
npm run test:e2e:headed
```

### Run in Debug Mode

```bash
npm run test:e2e:debug
```

### Run with UI Mode

```bash
npm run test:e2e:ui
```

### View HTML Report

```bash
npm run test:e2e:report
```

## 📊 Test Configuration

| Setting | Value |
|---------|-------|
| **Base URL** | `http://localhost:9001` |
| **Timeout** | 60 seconds per test |
| **Viewport** | 375x667 (Mobile - iPhone SE) |
| **Browsers** | Chrome, Mobile Chrome, Mobile Safari, Desktop |
| **Parallel** | No (sequential to avoid conflicts) |
| **Retries** | 2 (in CI) |

## 🎯 Test Credentials

Tests use the same credentials as backend E2E tests:

```javascript
Admin:   081234567890 / admin123
Kitchen: 081234567891 / kitchen123
Driver:  081234567892 / driver123
Customer: Auto-generated (unique name per test)
```

## 📁 Test Structure

```
frontend/tests/
└── e2e.spec.js          # Main test file
    ├── Customer Flow
    │   ├── Complete customer journey
    │   ├── Customer login
    │   ├── Dine-in order
    │   └── Delivery order
    ├── Admin Flow
    │   ├── Login & dashboard
    │   ├── Payment verification
    │   ├── Report generation
    │   └── Order management
    ├── Kitchen Flow
    │   ├── Login & view orders
    │   └── Status updates
    ├── Driver Flow
    │   └── Login & view deliveries
    ├── Real-time Updates
    │   └── Multi-tab order update
    └── Error Handling
        ├── Empty cart error
        └── Invalid login error
```

## 🔍 Test Attributes

Tests use `data-testid` attributes for reliable selectors:

```jsx
// Product cards
data-testid="product-card"

// Cart
data-testid="cart-badge"
data-testid="cart-btn"
data-testid="cart-item"

// Navigation
data-testid="nav-home"
data-testid="nav-menu"
data-testid="nav-orders"
data-testid="nav-profile"

// Orders
data-testid="order-success-title"
data-testid="order-number"
data-testid="order-status"
data-testid="order-row"

// Dashboard
data-testid="stat-card"
data-testid="pending-count"
data-testid="preparing-count"
data-testid="ready-count"

// Actions
data-testid="add-to-cart-btn"
data-testid="verify-btn"
data-testid="start-preparing-btn"
data-testid="mark-ready-btn"
data-testid="delivery-card"
```

## 📸 Screenshots & Video

Tests automatically capture:
- **Screenshots** on failure
- **Video** on failure
- **Trace** on first retry

Artifacts are saved to `test-results/` directory.

## 📝 Example Test

```javascript
test('Complete customer journey', async ({ page }) => {
  // 1. Open homepage
  await page.goto(BASE_URL);
  
  // 2. Navigate to menu
  await page.click('text=Menu');
  
  // 3. Add product to cart
  await page.click('[data-testid="product-card"] >> nth=0');
  await page.click('[data-testid="add-to-cart-btn"]');
  
  // 4. Checkout
  await page.click('[data-testid="cart-btn"]');
  await page.click('text=Checkout');
  
  // 5. Place order
  await page.click('text=Buat Pesanan');
  
  // 6. Verify success
  await page.waitForURL(/\/order-success/);
});
```

## 🐛 Debugging Tips

1. **Run in headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use debug mode** to step through tests:
   ```bash
   npm run test:e2e:debug
   ```

3. **Add console logs** in tests:
   ```javascript
   console.log('Step 1: Opening homepage...');
   ```

4. **Check HTML report** for detailed results:
   ```bash
   npm run test:e2e:report
   ```

## 🔄 CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: |
    cd frontend
    npm install
    npx playwright install --with-deps

- name: Run E2E tests
  run: |
    cd frontend
    npm run test:e2e
```

## 📊 Comparison with Backend E2E

| Aspect | Backend E2E | Frontend E2E |
|--------|-------------|--------------|
| **Tool** | Axios + custom | Playwright |
| **Tests** | API endpoints | Browser interactions |
| **Speed** | Fast (~5s) | Slower (~30s) |
| **Coverage** | API logic | User experience |
| **Browsers** | N/A | Chrome, Safari, Firefox |
| **Best for** | API validation | UX validation |

Both test suites complement each other for full coverage!

## 🎯 When to Run

- **Development**: After making changes to checkout, orders, or admin features
- **Before deploy**: Always run full test suite
- **CI/CD**: Run on every pull request
- **Production**: Run smoke tests periodically

## ⚠️ Known Limitations

1. **Requires running frontend** on `http://localhost:9001`
2. **Sequential execution** to avoid order conflicts
3. **Test data cleanup** - tests create real orders in database
4. **Business rules** - delivery tests may fail if customer has no order history

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
