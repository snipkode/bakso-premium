# 🔐 Two-Factor Auth Flow - Visual Guide

## Will User Login Be Affected?

### Short Answer: **NO** ✅

Customer login remains **100% unchanged**. Only staff login has new security flow.

---

## Login Flow Comparison

### BEFORE (Current):
```
Staff Login → Check Password → Return Token → Redirect
                  ↓
            ⚠️ SECURITY GAP: No 2FA enforcement!
```

### AFTER (New):
```
Staff Login → Check Password → Check 2FA Status
                  ↓                    ↓
         2FA NOT Set            2FA Set
              ↓                        ↓
    Return SETUP Token        Return FULL Token
    (10 min, limited)         (30 days, full)
              ↓                        ↓
    Show Setup Modal          Redirect to Dashboard
              ↓
    User sets PIN
              ↓
    Return FULL Token
              ↓
    Redirect to Dashboard
```

---

## Impact by User Type

### 1. **CUSTOMER** (🟢 NO IMPACT)

```
Customer Login
     ↓
Backend: Skip 2FA check (role === 'customer')
     ↓
Return token normally
     ↓
Navigate to /menu
```

**Result:** ✅ Works exactly as before

---

### 2. **STAFF WITH PIN SET** (🟢 NO IMPACT)

```
Staff Login (PIN already set)
     ↓
Backend: Check is_pin_set === true
     ↓
Return FULL token (30 days)
     ↓
Navigate to /admin or /kitchen or /driver
```

**Result:** ✅ Works exactly as before

---

### 3. **STAFF WITHOUT PIN SET** (🟡 NEW FLOW)

```
Staff Login (no PIN)
     ↓
Backend: Check is_pin_set === false
     ↓
Return SETUP token (10 min, limited) + requires_2fa_setup: true
     ↓
Frontend: Show PIN setup modal
     ↓
User enters PIN (6 digits)
     ↓
Backend: Save PIN hash
     ↓
Frontend: Login again with new PIN
     ↓
Backend: Return FULL token
     ↓
Navigate to /admin or /kitchen or /driver
```

**Result:** ⚠️ New step added (INTENDED - forces 2FA setup)

---

## Token Comparison

| Token Type | Expiry | Scope | Can Access |
|------------|--------|-------|------------|
| **SETUP Token** | 10 minutes | `pin_setup_only` | Only `/customer-pin/set` endpoint |
| **FULL Token** | 30 days | `full_access` | All protected endpoints |

---

## Security Improvements

### BEFORE:
```javascript
// ❌ Vulnerable
localStorage.setItem('token', result.token); // Saved immediately
navigate('/admin'); // Redirect immediately
// User could access admin without PIN!
```

### AFTER:
```javascript
// ✅ Secure
if (result.requires_2fa_setup) {
  // Store limited token temporarily
  setPendingStaffData({ setupToken: result.setup_token });
  showSetupModal();
  return; // Don't redirect!
}

// Only save full token after 2FA complete
localStorage.setItem('token', result.token);
navigate('/admin');
```

---

## Error Scenarios & Handling

### Scenario 1: Setup Token Expires

```
User takes > 10 minutes to set PIN
     ↓
Setup token expires
     ↓
API returns: 401 "Setup token expired"
     ↓
Frontend: Show error, redirect to login
     ↓
User must login again
```

**User Impact:** ⚠️ Minor inconvenience (re-login required)

---

### Scenario 2: Wrong PIN (5 times)

```
User enters wrong PIN 5 times
     ↓
Backend: Lock account for 15 minutes
     ↓
Frontend: Show "Too many attempts" message
     ↓
User must wait 15 minutes
```

**User Impact:** ⚠️ Security feature (prevents brute force)

---

### Scenario 3: Network Error During Setup

```
User submits PIN
     ↓
Network error
     ↓
Frontend: Show error toast
     ↓
User can retry (setup token still valid)
```

**User Impact:** ✅ Minimal (can retry)

---

## Rollback Plan

If login breaks, here's how to rollback:

### Option 1: Comment Out 2FA Check

```javascript
// Comment out this section in LoginPage.jsx:

// if (result?.requires_2fa_setup) {
//   setPendingStaffData({ ... });
//   showSetupModal();
//   return;
// }

// Login will work as before
```

### Option 2: Backend Disable

```javascript
// In authController.js, comment out 2FA check:

// if (requires2FASetup) {
//   return res.json({ requires_2fa_setup: true, ... });
// }

// Backend will return full token for everyone
```

---

## Testing Checklist

### Before Production:

- [ ] Customer login works (no 2FA prompt)
- [ ] Staff with PIN can login (direct to dashboard)
- [ ] Staff without PIN sees setup modal
- [ ] Setup token expires after 10 min
- [ ] Wrong PIN locks after 5 attempts
- [ ] Network error allows retry
- [ ] Rollback works if needed

### After Production:

- [ ] Monitor failed login attempts
- [ ] Check setup completion rate
- [ ] Review support tickets
- [ ] Verify no legitimate users blocked

---

## User Communication

### For Staff Without PIN:

Show friendly message:
```
🔐 Security Upgrade!

Untuk keamanan akun Anda, silakan atur PIN 6 digit.
PIN ini akan digunakan untuk login two-factor authentication.

[1][2][3][4][5][6]

[  Atur PIN & Lanjut  ]
```

### For Locked Accounts:

```
⚠️ Terlalu Banyak Percobaan

Akun Anda dikunci selama 15 menit untuk keamanan.
Silakan coba lagi setelah waktu tersebut.

Waktu tersisa: 14:32
```

---

## Summary

| Aspect | Impact | Notes |
|--------|--------|-------|
| **Customer Login** | ✅ None | Works as before |
| **Staff with PIN** | ✅ None | Works as before |
| **Staff without PIN** | ⚠️ New step | Must set PIN first |
| **Security** | 🔴 Improved | Prevents unauthorized access |
| **UX** | 🟡 Slightly longer | One extra step for new staff |
| **Rollback** | ✅ Easy | Can disable anytime |

**Conclusion:** Login will NOT be disrupted for existing users with PIN set. Only new staff or staff without PIN will see the new setup flow (which is intended for security).
