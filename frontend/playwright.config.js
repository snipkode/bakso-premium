// Playwright Configuration for Bakso Premium Frontend E2E Tests
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  
  // Timeout for each test
  timeout: 60 * 1000, // 60 seconds
  
  // Timeout for expect assertions
  expect: {
    timeout: 5000,
  },
  
  // Run tests in parallel
  fullyParallel: false, // Set to true for faster execution, but may cause conflicts
  
  // Number of retries
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  // Shared settings for all browsers
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:9001',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Browser context options
    viewport: { width: 375, height: 667 }, // Mobile viewport (iPhone SE)
    
    // User agent
    userAgent: 'Playwright Test Bot',
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 }, // Mobile view
      },
    },
    
    // Test on mobile viewport
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    
    // Test on iPhone
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
    
    // Desktop testing
    {
      name: 'Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  
  // Web server configuration (optional - if you want Playwright to start the server)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:9001',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
  
  // Output directory for test results
  outputDir: 'test-results/',
  
  // Preserve test output
  preserveOutput: 'failures-only',
  
  // Update snapshots
  updateSnapshots: 'none',
  
  // Maximum number of failures
  maxFailures: process.env.CI ? 5 : undefined,
  
  // Print console logs
  reportSlowTests: {
    max: 5,
    threshold: 30000, // 30 seconds
  },
});
