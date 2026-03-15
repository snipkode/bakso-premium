/**
 * 🔐 Two-Factor Auth Frontend Integration
 * 
 * This file contains the changes needed for LoginPage.jsx
 * Apply these changes to enable 2FA security
 */

// ============================================================================
// CHANGE 1: Update handleStaffLogin function
// Location: Around line 372-580 in LoginPage.jsx
// ============================================================================

/**
 * REPLACE the 2FA check section with this:
 */

// Inside handleStaffLogin, after successful staff login:
const result = await staffLogin(formData.phone, formData.password);

// ✅ NEW: Check for 2FA setup requirement
if (result?.requires_2fa_setup) {
  console.log('🔐 2FA setup required - storing SETUP token (limited)');
  
  // Store setup token temporarily (NOT in localStorage!)
  // This token has LIMITED permissions - only for PIN setup
  setPendingStaffData({
    setupToken: result.setup_token, // 10 min expiry, pin_setup_only scope
    user: result.user,
    needsPIN: !result.user.is_pin_set,
    needsPassword: result.user.needs_password_setup,
  });
  
  // Show setup modals
  if (!result.user.is_pin_set) {
    setRequiresPINSetup(true);
  }
  if (result.user.needs_password_setup) {
    setRequiresPasswordSetup(true);
  }
  
  toast({
    title: 'Setup Diperlukan',
    description: 'Silakan set PIN untuk keamanan akun Anda.',
    variant: 'warning',
  });
  return; // ⛔ DO NOT redirect - must setup first
}

// ✅ 2FA complete - store FULL token and redirect
console.log('✅ 2FA complete - storing FULL access token');
localStorage.setItem('token', result.token);
localStorage.setItem('user', JSON.stringify(result.user));

// Redirect based on role
if (role === 'admin') navigate('/admin');
else if (role === 'kitchen') navigate('/kitchen');
else if (role === 'driver') navigate('/driver');


// ============================================================================
// CHANGE 2: Update handlePINSetupComplete function
// Location: Around line 590-620 in LoginPage.jsx
// ============================================================================

/**
 * REPLACE handlePINSetupComplete with this:
 */

const handlePINSetupComplete = async (pin) => {
  try {
    console.log('🔑 Setting PIN with setup token...');
    
    // Use setup token for authentication (NOT regular token)
    const { setupToken, user } = pendingStaffData;
    
    // Call PIN API with setup token
    const { data } = await customerPINAPI.setPIN(pin, setupToken);
    
    console.log('✅ PIN set successfully:', data);
    setRequiresPINSetup(false);
    
    // If password also needs setup, show that modal next
    if (pendingStaffData.needsPassword) {
      console.log('🔐 Password setup still needed');
      return;
    }
    
    // ✅ Both 2FA complete - get FULL token now
    console.log('🔑 Getting full access token...');
    const { data: loginData } = await staffLogin(user.phone, pin);
    
    // Store FULL token (30 day expiry)
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    
    toast({
      title: 'PIN Berhasil Diset',
      description: 'Login berhasil dengan two-factor auth.',
      variant: 'success',
    });
    
    // Redirect based on role
    const role = loginData.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'kitchen') navigate('/kitchen');
    else if (role === 'driver') navigate('/driver');
    
  } catch (error) {
    console.error('❌ Failed to set PIN:', error);
    toast({
      title: 'Gagal Set PIN',
      description: error.response?.data?.error || 'Terjadi kesalahan.',
      variant: 'error',
    });
  }
};


// ============================================================================
// CHANGE 3: Update customerPINAPI.setPIN to accept token
// Location: frontend/src/lib/api.js
// ============================================================================

/**
 * UPDATE customerPINAPI.setPIN to accept optional token parameter:
 */

export const customerPINAPI = {
  // Set PIN - accepts optional token parameter for setup
  setPIN: (pin, token) => {
    const headers = token 
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    return api.post('/customer-pin/set', { pin }, headers);
  },
  
  verifyPIN: (phone, pin) => api.post('/customer-pin/verify', { phone, pin }),
  // ... rest of API
};


// ============================================================================
// IMPACT ANALYSIS - Will this break existing login?
// ============================================================================

/**
 * ✅ CUSTOMER LOGIN: NO IMPACT
 * - Customers don't have is_pin_set check
 * - Backend returns token normally
 * - Flow unchanged
 * 
 * ✅ STAFF WITH PIN SET: NO IMPACT  
 * - Backend returns full_token immediately
 * - requires_2fa_setup: false
 * - Flow unchanged
 * 
 * ⚠️ STAFF WITHOUT PIN SET: CHANGED
 * - Backend returns setup_token (limited)
 * - Shows setup modal before redirect
 * - This is the INTENDED behavior - forces 2FA setup
 * 
 * ✅ BACKWARDS COMPATIBILITY: MAINTAINED
 * - Old code still works
 * - New fields are optional
 * - Graceful degradation
 */


// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Before deploying, test:
 * 
 * 1. ✅ Customer login (no PIN required)
 *    - Should work normally
 *    - No setup modal
 * 
 * 2. ✅ Staff login with PIN set
 *    - Should get full token
 *    - Direct redirect to dashboard
 * 
 * 3. ✅ Staff login without PIN
 *    - Should get setup token
 *    - Show setup modal
 *    - After setup, get full token
 *    - Redirect to dashboard
 * 
 * 4. ✅ Wrong PIN (5 times)
 *    - Should lock after 5 attempts
 *    - Show "too many attempts" message
 * 
 * 5. ✅ Setup token expiry
 *    - Wait 10 minutes
 *    - Should expire
 *    - User must login again
 */


// ============================================================================
// ROLLBACK PLAN (if issues occur)
// ============================================================================

/**
 * If login breaks, revert these changes:
 * 
 * 1. Remove the `if (result?.requires_2fa_setup)` check
 * 2. Restore old handlePINSetupComplete
 * 3. Revert customerPINAPI.setPIN
 * 
 * OR simply comment out the 2FA check:
 * 
 * // if (result?.requires_2fa_setup) { ... }
 */

export default {
  description: 'Two-Factor Auth Frontend Integration',
  priority: 'CRITICAL',
  estimatedTime: '30 minutes',
  riskLevel: 'LOW (backwards compatible)',
};
