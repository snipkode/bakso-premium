# 🧪 Fresh Database - Order Flow Testing Scenarios

**Seed Date:** 2026-03-15  
**Database:** Fresh (Cleaned & Re-seeded)  
**Status:** ✅ Ready for Testing

---

## 📊 Database Summary

| Entity | Count | Details |
|--------|-------|---------|
| **Staff Users** | 4 | 3 with PIN, 1 without (2FA test) |
| **Customer Users** | 2 | 1 with PIN, 1 without |
| **Categories** | 3 | Bakso, Minuman, Makanan Pendamping |
| **Products** | 6 | 3 Bakso, 2 Drinks, 1 Side |
| **Orders** | 5 | All different statuses |
| **Payments** | 5 | Various methods |
| **Vouchers** | 2 | Percentage & Fixed |

---

## 🔐 Login Credentials

### Staff Accounts:

| Role | Phone | Password | PIN | PIN Expiry | Notes |
|------|-------|----------|-----|------------|-------|
| **Admin** | 081234567890 | admin123 | 123456 | 1 month | ✅ 2FA complete |
| **Kitchen** | 081234567891 | admin123 | 123456 | 1 month | ✅ 2FA complete |
| **Driver** | 081234567892 | admin123 | 123456 | 1 month | ✅ 2FA complete |
| **New Staff** | 089999999998 | admin123 | ❌ NONE | N/A | ⚠️ 2FA REQUIRED |

### Customer Accounts:

| Name | Phone | PIN | PIN Expiry | Points | Orders |
|------|-------|-----|------------|--------|--------|
| **Customer Regular** | 089999999999 | 123456 | 3 months | 500 | 5 completed |
| **Customer New** | 089999999997 | ❌ NONE | N/A | 0 | 0 |

---

## 📦 Order Scenarios

### Order #001: COMPLETED (Dine-in)
```
Order Number: BSO/202603/0001
Type: Dine-in (Table 5)
Status: COMPLETED ✅
Customer: Customer Regular
Items:
  - 2x Bakso Urat (Rp 15.000)
  - 1x Es Teh Manis (Rp 5.000)
Total: Rp 35.000
Payment: QRIS (Verified)
Queue: #1
```

**Test Scenarios:**
- ✅ Customer can review order
- ✅ Loyalty points earned (350 points)
- ✅ Order appears in completed orders

---

### Order #002: READY (Takeaway)
```
Order Number: BSO/202603/0002
Type: Takeaway
Status: READY ✅
Customer: Customer Regular
Items:
  - 1x Bakso Beranak (Rp 25.000)
Total: Rp 25.000
Payment: Bank Transfer BCA (Verified)
Queue: #2
Estimated Time: 15 min
```

**Test Scenarios:**
- ✅ Kitchen can mark as completed
- ✅ Customer can pick up order
- ✅ Status can change to completed

---

### Order #003: PREPARING (Delivery)
```
Order Number: BSO/202603/0003
Type: Delivery
Status: PREPARING 🍳
Customer: Customer Regular
Delivery Address: Jl. Mawar No. 123, Jakarta
Items:
  - 2x Bakso Urat (Rp 15.000)
  - 1x Es Jeruk (Rp 8.000)
  - 1x Nasi Putih (Rp 5.000)
Subtotal: Rp 43.000
Delivery Fee: Rp 10.000
Total: Rp 53.000
Payment: GoPay (Verified)
Queue: #3
Estimated Time: 30 min
```

**Test Scenarios:**
- ✅ Kitchen can mark as ready
- ✅ Driver can be assigned
- ✅ Status can change to ready → out_for_delivery → completed
- ✅ Delivery address visible

---

### Order #004: PAID (Dine-in)
```
Order Number: BSO/202603/0004
Type: Dine-in (Table 3)
Status: PAID 💳
Customer: Customer Regular
Items:
  - 1x Bakso Telur (Rp 20.000)
Total: Rp 20.000
Payment: QRIS (Verified)
Queue: #4
```

**Test Scenarios:**
- ✅ Kitchen can start preparing
- ✅ Status can change to preparing
- ✅ Customer waiting for food

---

### Order #005: PENDING_PAYMENT (Delivery)
```
Order Number: BSO/202603/0005
Type: Delivery
Status: PENDING_PAYMENT ⏳
Customer: Customer New (no PIN)
Delivery Address: Jl. Melati No. 456, Jakarta
Items:
  - 1x Bakso Urat (Rp 15.000)
Subtotal: Rp 15.000
Delivery Fee: Rp 10.000
Total: Rp 25.000
Payment: COD (Pending)
Queue: Not assigned
```

**Test Scenarios:**
- ⚠️ Customer needs to complete payment
- ⚠️ No queue number yet
- ⚠️ Order won't be processed until paid

---

## 🧪 Testing Scenarios

### Scenario 1: Staff 2FA Flow (NEW!)

**Test:** Login as staff without PIN

```bash
# Login with new staff account
Phone: 089999999998
Password: admin123

Expected:
✅ Backend returns requires_2fa_setup: true
✅ Backend returns setup_token (10 min)
✅ Frontend shows PIN setup modal
✅ User must set PIN before accessing dashboard
✅ After PIN set, gets full token
✅ Redirects to /driver
```

---

### Scenario 2: Customer PIN Login

**Test:** Login customer with PIN

```bash
# Login customer with PIN
Phone: 089999999999
PIN: 123456

Expected:
✅ Backend verifies PIN
✅ Backend returns full token (7 days)
✅ No 2FA modal (customer doesn't need 2FA)
✅ Redirects to /menu
✅ PIN expires in 3 months
```

---

### Scenario 3: Order Status Flow (Kitchen)

**Test:** Kitchen processes order

```bash
# Login as kitchen
Phone: 081234567891
Password: admin123
PIN: 123456

# Navigate to Kitchen View
# Find Order #004 (PAID)

# Actions:
1. Click "Start Cooking" → Status: PAID → PREPARING ✅
2. Click "Mark Ready" → Status: PREPARING → READY ✅

Expected:
✅ Kitchen can see paid orders
✅ Status updates correctly
✅ Customer receives notification
```

---

### Scenario 4: Order Status Flow (Driver)

**Test:** Driver delivers order

```bash
# Login as driver
Phone: 081234567892
Password: admin123
PIN: 123456

# Navigate to Driver View
# Find Order #003 (PREPARING → wait for READY)

# Actions:
1. Wait for kitchen to mark READY
2. Click "Pick Up Order" → Status: READY → OUT_FOR_DELIVERY ✅
3. Click "Mark Delivered" → Status: OUT_FOR_DELIVERY → COMPLETED ✅

Expected:
✅ Driver can see ready orders
✅ Can update to out_for_delivery
✅ Can update to completed
✅ Customer receives notification
```

---

### Scenario 5: Customer Places New Order

**Test:** Complete order flow

```bash
# Login as customer
Phone: 089999999997 (new customer, no PIN)

# Flow:
1. Browse menu
2. Add items to cart
3. Checkout (choose delivery)
4. Payment (choose QRIS)
5. Upload proof
6. Wait for verification

Expected:
✅ Order created with status: PENDING_PAYMENT
✅ Payment created with status: PENDING
✅ Admin can verify payment
✅ After verification: status → PAID
```

---

### Scenario 6: Admin Payment Verification

**Test:** Admin verifies pending payment

```bash
# Login as admin
Phone: 081234567890
Password: admin123
PIN: 123456

# Navigate to Admin > Payments
# Find pending payment (Order #005)

# Actions:
1. View proof image
2. Click "Verify" → Status: PENDING → VERIFIED ✅

Expected:
✅ Payment status changes to verified
✅ Order status changes to PAID
✅ Order moves to kitchen queue
✅ Customer receives notification
```

---

### Scenario 7: Voucher Usage

**Test:** Apply voucher to order

```bash
# Vouchers available:
1. BAKSO10 - 10% off (min 50k, max 20k discount)
2. GRATIS5 - Rp 5k off (min 30k)

# Test order:
Items: Rp 55.000
Voucher: BAKSO10
Discount: Rp 5.500 (10%)
Total: Rp 49.500

Expected:
✅ Voucher code validated
✅ Discount calculated correctly
✅ Min purchase checked
✅ Max discount applied
```

---

### Scenario 8: Loyalty Points

**Test:** Earn and redeem points

```bash
# Customer 1 has 500 points

# Earn points:
Order total: Rp 100.000
Points earned: 1000 (1% of total)
New balance: 1500 points

# Redeem points:
Order total: Rp 50.000
Points to redeem: 500 (Rp 5.000 value)
Final total: Rp 45.000

Expected:
✅ Points calculated (1% of total)
✅ Points added after order completed
✅ Points can be redeemed
✅ Discount applied correctly
```

---

## 📋 Testing Checklist

### Staff 2FA:
- [ ] Admin login with PIN (should work)
- [ ] Kitchen login with PIN (should work)
- [ ] Driver login with PIN (should work)
- [ ] New staff login without PIN (should show 2FA modal)
- [ ] Set PIN for new staff (should redirect to dashboard)
- [ ] Wrong PIN 5 times (should lock account)

### Customer Flow:
- [ ] Customer with PIN login (should work)
- [ ] Customer without PIN login (should redirect to onboarding)
- [ ] Customer places order (should create order)
- [ ] Customer uploads payment proof (should create payment)

### Kitchen Flow:
- [ ] Kitchen sees paid orders
- [ ] Kitchen starts cooking (status: PAID → PREPARING)
- [ ] Kitchen marks ready (status: PREPARING → READY)

### Driver Flow:
- [ ] Driver sees ready orders
- [ ] Driver picks up (status: READY → OUT_FOR_DELIVERY)
- [ ] Driver delivers (status: OUT_FOR_DELIVERY → COMPLETED)

### Admin Flow:
- [ ] Admin verifies payment (status: PENDING → VERIFIED)
- [ ] Admin sees all orders
- [ ] Admin can update any order status

### Order Flow:
- [ ] Order #001: COMPLETED (can review)
- [ ] Order #002: READY (can complete)
- [ ] Order #003: PREPARING (kitchen can process)
- [ ] Order #004: PAID (kitchen can start)
- [ ] Order #005: PENDING_PAYMENT (admin can verify)

---

## 🎯 Quick Test Commands

### Test Staff Login (with PIN):
```bash
curl -X POST http://localhost:9000/api/auth/staff \
  -H "Content-Type: application/json" \
  -d '{"phone":"081234567890","password":"admin123"}'
```

### Test Staff Login (without PIN - 2FA test):
```bash
curl -X POST http://localhost:9000/api/auth/staff \
  -H "Content-Type: application/json" \
  -d '{"phone":"089999999998","password":"admin123"}'
```

### Test Customer PIN Login:
```bash
curl -X POST http://localhost:9000/api/customer-pin/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"089999999999","pin":"123456"}'
```

### Get All Orders (Admin):
```bash
curl -X GET http://localhost:9000/api/orders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📝 Notes

1. **PIN for all staff:** `123456`
2. **PIN expiry:** 1 month for staff, 3 months for customers
3. **Rate limiting:** 5 attempts, 15 min lockout
4. **Queue starts at:** #4 (3 orders already in queue)
5. **All passwords:** `admin123`

---

**Database Status:** ✅ READY FOR TESTING  
**Last Updated:** 2026-03-15  
**Seed Script:** `backend/scripts/seed-fresh-order-flow.js`
