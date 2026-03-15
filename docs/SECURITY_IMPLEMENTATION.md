# 🔐 Two-Factor Authentication Security Implementation

## Priority 1 (CRITICAL) - COMPLETED ✅

### 1. Backend: Setup Token vs Full Token

**File:** `backend/src/controllers/authController.js`

**Changes:**
- Added `generateSetupToken()` function
- Returns limited token (10 min expiry, `pin_setup_only` scope) when 2FA not complete
- Returns full token (30 day expiry) only when 2FA complete
- Response includes `requires_2fa_setup: true` flag

**Code:**
```javascript
if (requires2FASetup) {
  const setupToken = generateSetupToken(user);
  return res.json({
    success: true,
    requires_2fa_setup: true,
    setup_token: setupToken, // Limited - 10 min, pin_setup_only
    user: { ... }
  });
}

// 2FA complete
const token = generateToken(user);
return res.json({
  success: true,
  token: token, // Full access - 30 days
  user: { ... }
});
```

---

### 2. Backend: Rate Limiting for PIN Attempts

**File:** `backend/src/middleware/twoFactorAuth.js` (NEW)

**Features:**
- Max 5 attempts before lockout
- 15 minute lockout period
- In-memory tracking (can upgrade to Redis)

**Code:**
```javascript
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

exports.trackFailedPINAttempt = (phone) => {
  const key = `pin:${phone}`;
  const attempts = pinAttempts.get(key) || { count: 0, lockedUntil: 0 };
  
  attempts.count += 1;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_TIME;
  }
  
  pinAttempts.set(key, attempts);
  return {
    remaining: Math.max(0, MAX_ATTEMPTS - attempts.count),
    locked: attempts.lockedUntil > Date.now(),
    lockedUntil: attempts.lockedUntil,
  };
};
```

**Usage in:** `backend/src/controllers/customerPinController.js`
```javascript
const isValid = await bcrypt.compare(pin, user.pin_hash);
if (!isValid) {
  const attemptInfo = trackFailedPINAttempt(phone);
  return res.status(401).json({ 
    error: 'PIN salah',
    attempts_remaining: attemptInfo.remaining,
    locked: attemptInfo.locked,
  });
}

// Reset on success
resetPINAttempts(phone);
```

---

### 3. Backend: 2FA Enforcement Middleware

**File:** `backend/src/middleware/twoFactorAuth.js` (NEW)

**Middleware:** `enforce2FA`

**Usage:**
```javascript
// Add to protected routes
router.get('/admin/dashboard', 
  authorize('admin'), 
  enforce2FA, // ← Enforces PIN setup
  dashboardController.adminDashboard
);
```

**Logic:**
```javascript
exports.enforce2FA = async (req, res, next) => {
  const user = req.user;
  
  if (user.role === 'customer') return next();
  
  if (!user.is_pin_set) {
    const setupToken = generateSetupToken(user);
    return res.status(403).json({
      error: 'Two-factor authentication setup required',
      requires_2fa_setup: true,
      setup_token: setupToken,
    });
  }
  
  next();
};
```

---

### 4. Frontend: Handle Setup Token

**File:** `frontend/src/pages/LoginPage.jsx`

**Changes Needed:**
```javascript
const result = await staffLogin(phone, password);

if (result?.requires_2fa_setup) {
  // Store SETUP token (limited permissions)
  setPendingStaffData({
    setupToken: result.setup_token, // NOT full token!
    user: result.user,
    needsPIN: !result.user.is_pin_set,
    needsPassword: result.user.needs_password_setup,
  });
  
  showSetupModal();
  return; // Don't redirect
}

// 2FA complete - store FULL token
localStorage.setItem('token', result.token);
localStorage.setItem('user', JSON.stringify(result.user));
navigate('/admin');
```

---

### 5. Frontend: PIN Setup API Call

**File:** `frontend/src/components/ui/StaffPINSetupModal.jsx`

**Current:** Uses `customerPINAPI.setPIN(pin)`

**Should Use:** Setup token for authentication
```javascript
const handleSubmit = async (finalPin) => {
  try {
    // Use setup token from pendingStaffData
    const { setupToken } = pendingStaffData;
    
    await axios.post('/api/customer-pin/set', 
      { pin: finalPin },
      { headers: { Authorization: `Bearer ${setupToken}` } }
    );
    
    // Now get full token
    const { data } = await staffLogin(phone, finalPin);
    localStorage.setItem('token', data.token);
    navigate('/admin');
  } catch (error) {
    // Handle error
  }
};
```

---

## Security Improvements Summary

| Issue | Before | After |
|-------|--------|-------|
| **Token before setup** | Full token saved | Setup token only (10 min) |
| **2FA enforcement** | Frontend only | Backend middleware |
| **Rate limiting** | None | 5 attempts, 15min lockout |
| **Token scope** | Full access | Limited (`pin_setup_only`) |
| **Session invalidation** | Not implemented | Planned (Phase 2) |

---

## Testing Checklist

### Backend:
- [ ] Login without PIN returns `setup_token`
- [ ] Login with PIN returns `full_token`
- [ ] 5 failed PIN attempts triggers lockout
- [ ] Setup token expires after 10 minutes
- [ ] Protected routes reject setup tokens

### Frontend:
- [ ] Setup modal shows when `requires_2fa_setup: true`
- [ ] Cannot bypass setup (no full token stored)
- [ ] Redirect only after setup complete
- [ ] Error messages show remaining attempts

---

## Next Steps (Phase 2)

1. **Session Invalidation:**
   - Add `token_version` to User model
   - Include version in JWT payload
   - Increment on PIN change

2. **Client-Side PIN Hashing:**
   - Hash PIN before sending
   - Use phone number as salt

3. **Audit Logging:**
   - Log all 2FA events
   - Track setup, changes, failed attempts

4. **Protected Routes:**
   - Add `enforce2FA` middleware to all staff routes
   - Test each route returns 403 without PIN

---

## Files Changed

### Backend:
- ✅ `src/middleware/twoFactorAuth.js` (NEW)
- ✅ `src/controllers/authController.js`
- ✅ `src/controllers/customerPinController.js`

### Frontend:
- ⏳ `src/pages/LoginPage.jsx` (needs update)
- ⏳ `src/components/ui/StaffPINSetupModal.jsx` (needs update)

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend: Setup Token | ✅ Done | Returns limited token |
| Backend: Rate Limiting | ✅ Done | 5 attempts, 15min |
| Backend: 2FA Middleware | ✅ Done | Ready to use |
| Frontend: Handle Setup Token | ⏳ Pending | Needs implementation |
| Frontend: PIN Setup Flow | ⏳ Pending | Use setup token |
| Protected Routes | ⏳ Pending | Add middleware |

---

## Rollback Plan

If issues occur:
1. Revert `authController.js` changes
2. Remove `twoFactorAuth.js` middleware
3. Revert frontend changes
4. Clear token cache

---

**Implementation Date:** 2026-03-15
**Security Level:** HIGH
**Priority:** CRITICAL
