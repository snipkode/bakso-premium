/**
 * 🔐 Two-Factor Auth - Staff Only Implementation
 * 
 * Summary of Changes:
 * 
 * STAFF (admin, kitchen, driver):
 * - ✅ 2FA REQUIRED
 * - ✅ Must set PIN before first login
 * - ✅ PIN expires every 1 month
 * - ✅ Setup token (10 min) → Full token (30 days)
 * 
 * CUSTOMER:
 * - ✅ NO 2FA required
 * - ✅ Can set PIN optionally
 * - ✅ PIN expires every 3 months
 * - ✅ Direct login with PIN
 * 
 */

// ============================================================================
// BACKEND CHANGES - COMPLETED ✅
// ============================================================================

/**
 * 1. authController.js - staffLogin endpoint
 *    - Check if user is staff: isStaff = ['admin', 'kitchen', 'driver'].includes(role)
 *    - If staff without PIN: return setup_token + requires_2fa_setup: true
 *    - If staff with PIN OR customer: return full_token
 * 
 * 2. customerPinController.js - setPIN endpoint
 *    - Staff: PIN expires in 1 month
 *    - Customer: PIN expires in 3 months
 * 
 * 3. customerPinController.js - verifyPIN endpoint
 *    - Check expiry for both staff and customer
 *    - Different expiry messages (1 bulan vs 3 bulan)
 */


// ============================================================================
// FRONTEND CHANGES - NEEDED ⏳
// ============================================================================

/**
 * LoginPage.jsx - handleStaffLogin
 * 
 * Add this check AFTER staff login:
 */

const result = await staffLogin(phone, password);

// ✅ NEW: Check for 2FA setup requirement (STAFF ONLY)
if (result?.requires_2fa_setup) {
  // This will ONLY happen for staff without PIN
  // Customers never get this response
  
  console.log('🔐 Staff 2FA setup required');
  
  setPendingStaffData({
    setupToken: result.setup_token, // 10 min expiry
    user: result.user,
    needsPIN: !result.user.is_pin_set,
    needsPassword: result.user.needs_password_setup,
  });
  
  showSetupModal();
  return; // Don't redirect
}

// Staff with PIN OR customer - proceed normally
localStorage.setItem('token', result.token);
navigate('/admin' | '/kitchen' | '/driver' | '/menu');


// ============================================================================
// CUSTOMER FLOW - UNCHANGED ✅
// ============================================================================

/**
 * Customer login continues to work as before:
 * 
 * 1. Customer enters phone
 * 2. Backend checks if PIN exists
 * 3. If no PIN: redirect to onboarding (existing flow)
 * 4. If PIN exists: verify PIN (existing flow)
 * 5. Return token (existing flow)
 * 
 * NO 2FA modal for customers!
 */


// ============================================================================
// STAFF FLOW - NEW ⚠️
// ============================================================================

/**
 * Staff login NEW flow:
 * 
 * FIRST TIME (no PIN):
 * 1. Staff enters phone + password
 * 2. Backend: is_staff=true, is_pin_set=false
 * 3. Backend returns: setup_token + requires_2fa_setup: true
 * 4. Frontend: Show PIN setup modal
 * 5. Staff sets 6-digit PIN
 * 6. Backend: Save PIN, expiry = 1 month
 * 7. Frontend: Login again with new PIN
 * 8. Backend: Return full_token
 * 9. Frontend: Redirect to dashboard
 * 
 * SUBSEQUENT (PIN set):
 * 1. Staff enters phone + PIN
 * 2. Backend: Verify PIN, check expiry
 * 3. Backend: Return full_token
 * 4. Frontend: Redirect to dashboard
 * 
 * PIN EXPIRED (after 1 month):
 * 1. Staff enters phone + PIN
 * 2. Backend: PIN expired
 * 3. Backend: Clear PIN, return error
 * 4. Frontend: Show "PIN expired" message
 * 5. Staff must set new PIN
 */


// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Test Staff Flow:
 * 
 * 1. ✅ Staff without PIN
 *    - Login with password
 *    - Should see setup modal
 *    - Set PIN
 *    - Should redirect to dashboard
 * 
 * 2. ✅ Staff with PIN
 *    - Login with PIN
 *    - Should redirect directly to dashboard
 * 
 * 3. ✅ Staff expired PIN
 *    - Login with expired PIN
 *    - Should see "PIN kadaluarsa (reset 1 bulan)"
 *    - Must set new PIN
 * 
 * Test Customer Flow:
 * 
 * 4. ✅ Customer without PIN
 *    - Login with phone
 *    - Should redirect to onboarding (existing flow)
 * 
 * 5. ✅ Customer with PIN
 *    - Login with phone + PIN
 *    - Should work normally (existing flow)
 * 
 * 6. ✅ Customer expired PIN
 *    - Login after 3 months
 *    - Should see "PIN kadaluarsa (reset 3 bulan)"
 *    - Must set new PIN
 */


// ============================================================================
// API RESPONSE EXAMPLES
// ============================================================================

/**
 * Staff WITHOUT PIN (NEW):
 * 
 * POST /api/auth/staff
 * { "phone": "081234567891", "password": "kitchen123" }
 * 
 * Response:
 * {
 *   "success": true,
 *   "requires_2fa_setup": true,
 *   "setup_token": "eyJhbGci...", // 10 min expiry
 *   "user": {
 *     "id": "...",
 *     "role": "kitchen",
 *     "is_pin_set": false,
 *     "needs_password_setup": false
 *   }
 * }
 * 
 * 
 * Staff WITH PIN:
 * 
 * POST /api/auth/staff
 * { "phone": "081234567890", "password": "admin123" }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGci...", // 30 days expiry
 *   "user": {
 *     "id": "...",
 *     "role": "admin",
 *     "is_pin_set": true,
 *     "needs_password_setup": false
 *   }
 * }
 * 
 * 
 * Customer (UNCHANGED):
 * 
 * POST /api/auth/customer
 * { "name": "John", "phone": "081234567899" }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGci...", // 30 days expiry
 *   "user": {
 *     "id": "...",
 *     "role": "customer",
 *     "is_pin_set": false, // or true if set
 *     "pin_expires": "2026-06-15T00:00:00.000Z" // 3 months from now
 *   }
 * }
 */


// ============================================================================
// SUMMARY
// ============================================================================

export default {
  staff: {
    twoFARequired: true,
    pinExpiry: '1 month',
    setupToken: '10 minutes',
    fullToken: '30 days',
    flow: 'Login → 2FA Setup (if needed) → Dashboard'
  },
  customer: {
    twoFARequired: false,
    pinExpiry: '3 months',
    setupToken: 'N/A',
    fullToken: '30 days',
    flow: 'Login → Dashboard (no 2FA)'
  }
};
