# 🍜 BAKSO ORDERING SYSTEM - SYSTEM DOCUMENTATION

**Premium Digital Bakso Ordering Platform**  
*Web-based PWA with Apple-style Design*

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Socket.io Events](#socketio-events)
7. [Order Workflow](#order-workflow)
8. [Queue System](#queue-system)
9. [Payment Methods](#payment-methods)
10. [User Roles](#user-roles)
11. [Features](#features)
12. [Project Structure](#project-structure)
13. [Environment Setup](#environment-setup)
14. [Design System](#design-system)

---

## 🎯 SYSTEM OVERVIEW

### Purpose
Digital ordering system for Bakso restaurant with:
- Customer self-ordering (no registration required)
- Multiple payment methods with verification
- Real-time order tracking
- Staff online/offline visibility
- Browser push notifications
- Admin dashboard with analytics
- Kitchen order management

### Key Principles
- **NO KYC** - No document upload required
- **Progressive Trust** - Delivery allowed after 1+ completed order
- **Web-based PWA** - No app install needed
- **Apple Design** - Clean, minimal, premium UI
- **Real-time** - Socket.io for live updates
- **Browser Push** - Native notifications

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Mobile    │  │   Tablet    │  │   Desktop   │             │
│  │   Browser   │  │   Browser   │  │   Browser   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│         ┌────────────────▼────────────────┐                     │
│         │     React + Vite (PWA)          │                     │
│         │  - Tailwind CSS + Shadcn/ui     │                     │
│         │  - Framer Motion                │                     │
│         │  - Zustand State                │                     │
│         │  - Service Worker               │                     │
│         └────────────────┬────────────────┘                     │
│                          │                                      │
│         ┌────────────────▼────────────────┐                     │
│         │      Socket.io Client           │                     │
│         │      Web Push API               │                     │
│         └────────────────┬────────────────┘                     │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │      HTTPS / HTTP       │
              └────────────┬────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        SERVER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         ┌────────────────▼────────────────┐                     │
│         │     Node.js + Express.js        │                     │
│         │  - REST API                     │                     │
│         │  - JWT Auth (staff)             │                     │
│         │  - Multer Upload                │                     │
│         └────────────────┬────────────────┘                     │
│                          │                                      │
│         ┌────────────────▼────────────────┐                     │
│         │      Socket.io Server           │                     │
│         │  - Real-time tracking           │                     │
│         │  - User activity monitoring     │                     │
│         │  - Staff status broadcast       │                     │
│         └────────────────┬────────────────┘                     │
│                          │                                      │
│         ┌────────────────▼────────────────┐                     │
│         │     Sequelize ORM               │                     │
│         │  - Model layer                  │                     │
│         │  - Query builder                │                     │
│         └────────────────┬────────────────┘                     │
│                          │                                      │
│         ┌────────────────▼────────────────┐                     │
│         │      SQLite Database            │                     │
│         │  (Migratable to MySQL/PG)       │                     │
│         └─────────────────────────────────┘                     │
│                                                                 │
│         ┌──────────────────────────────┐                        │
│         │   File Storage (uploads/)    │                        │
│         │  - Payment proofs            │                        │
│         │  - Review images             │                        │
│         └──────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ TECH STACK

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite** | Build Tool + Dev Server |
| **JavaScript** | Programming Language (no TypeScript) |
| **Tailwind CSS** | Utility-first CSS |
| **Shadcn/ui** | Component Library |
| **Framer Motion** | iOS-style Animations |
| **Zustand** | State Management |
| **Socket.io Client** | Real-time Communication |
| **Web Push API** | Browser Notifications |
| **Service Worker** | PWA + Offline Support |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime Environment |
| **Express.js** | Web Framework |
| **Sequelize** | ORM (SQLite/MySQL/PostgreSQL) |
| **SQLite** | Database (Development) |
| **Socket.io** | Real-time WebSocket |
| **JWT** | Authentication (Staff) |
| **Multer** | File Upload Handler |
| **web-push** | Push Notification Service |
| **bcryptjs** | Password Hashing |
| **cors** | Cross-origin Resource Sharing |
| **dotenv** | Environment Variables |

---

## 🗄️ DATABASE SCHEMA

### ERD Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │    categories    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ name             │       │ name             │
│ phone            │       │ icon             │
│ role             │       │ created_at       │
│ department       │       └────────┬─────────┘
│ is_staff         │                │
│ show_status      │                │
│ total_completed  │                │
│ is_blacklisted   │                │
│ created_at       │                │
└────────┬─────────┘                │
         │                          │
         │                          │
         │    ┌─────────────────────┘
         │    │
         │    │    ┌──────────────────┐
         │    │    │    products      │
         │    │    ├──────────────────┤
         │    │    │ id (PK)          │
         │    │    │ name             │
         │    │    │ description      │
         │    │    │ price            │
         │    │    │ category_id (FK) │
         │    │    │ image            │
         │    │    │ is_available     │
         │    │    │ created_at       │
         │    │    └────────┬─────────┘
         │    │             │
         │    │             │
         ▼    │             ▼
┌──────────────────┐       ┌──────────────────┐
│ push_subscriptions│      │  orders          │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │       │ customer_name    │
│ endpoint         │       │ customer_phone   │
│ keys (JSON)      │       │ delivery_type    │
│ created_at       │       │ delivery_address │
└──────────────────┘       │ min_order_met    │
                           │ status           │
                           │ total            │
                           │ created_at       │
                           └────────┬─────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │   order_items    │ │    payments      │ │    reviews       │
     ├──────────────────┤ ├──────────────────┤ ├──────────────────┤
     │ id (PK)          │ │ id (PK)          │ │ id (PK)          │
     │ order_id (FK)    │ │ order_id (FK)    │ │ order_id (FK)    │
     │ product_id (FK)  │ │ amount           │ │ rating           │
     │ quantity         │ │ method           │ │ comment          │
     │ price            │ │ provider         │ │ images (JSON)    │
     │ notes            │ │ proof_image      │ │ created_at       │
     │ created_at       │ │ status           │ └──────────────────┘
     └──────────────────┘ │ verified_by (FK) │
                          │ verified_at      │
                          │ created_at       │
                          └──────────────────┘

┌──────────────────┐
│    vouchers      │
├──────────────────┤
│ id (PK)          │
│ code             │
│ type             │
│ value            │
│ min_purchase     │
│ valid_until      │
│ usage_limit      │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│ loyalty_points   │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ points           │
│ transaction_type │
│ description      │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│ queue_settings   │
├──────────────────┤
│ id (PK)          │
│ current_queue    │
│ daily_queue      │
│ last_reset_date  │
│ active           │
│ created_at       │
└──────────────────┘
```

---

### Table Definitions

#### 1. `users`
Customer and staff accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| name | TEXT | NOT NULL | Full name |
| phone | TEXT | NOT NULL UNIQUE | WhatsApp number |
| role | TEXT | NOT NULL DEFAULT 'customer' | customer/admin/kitchen/driver |
| department | TEXT | NULL | dapur/delivery/cs/management |
| is_staff | BOOLEAN | DEFAULT false | Is staff member |
| show_status | BOOLEAN | DEFAULT true | Visible to customers |
| total_completed_orders | INTEGER | DEFAULT 0 | Completed order count |
| is_blacklisted | BOOLEAN | DEFAULT false | Fraud prevention |
| created_at | DATETIME | NOT NULL | Registration date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 2. `categories`
Product categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| name | TEXT | NOT NULL | Category name |
| icon | TEXT | NULL | Emoji/icon |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 3. `products`
Menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| name | TEXT | NOT NULL | Product name |
| description | TEXT | NULL | Product description |
| price | INTEGER | NOT NULL | Price in IDR |
| category_id | INTEGER | FOREIGN KEY → categories.id | Category |
| image | TEXT | NULL | Image URL/path |
| is_available | BOOLEAN | DEFAULT true | Availability |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 4. `orders`
Order transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| customer_name | TEXT | NOT NULL | Customer name |
| customer_phone | TEXT | NOT NULL | WhatsApp number |
| delivery_type | TEXT | NOT NULL | dine_in/takeaway/delivery |
| delivery_address | TEXT | NULL | Delivery address |
| minimum_order_met | BOOLEAN | DEFAULT false | Min Rp 50K for delivery |
| status | TEXT | NOT NULL DEFAULT 'pending_payment' | Order status |
| total | INTEGER | NOT NULL | Total amount |
| created_at | DATETIME | NOT NULL | Order date |
| updated_at | DATETIME | NOT NULL | Last update |

**Order Status Values:**
- `pending_payment` - Waiting for payment
- `waiting_verification` - Payment proof uploaded
- `paid` - Payment verified
- `preparing` - Being prepared
- `ready` - Ready for pickup/delivery
- `completed` - Order completed
- `rejected` - Payment/order rejected
- `cancelled` - Order cancelled

#### 5. `order_items`
Order line items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| order_id | INTEGER | FOREIGN KEY → orders.id | Order reference |
| product_id | INTEGER | FOREIGN KEY → products.id | Product reference |
| quantity | INTEGER | NOT NULL | Quantity |
| price | INTEGER | NOT NULL | Unit price |
| notes | TEXT | NULL | Special requests |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 6. `payments`
Payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| order_id | INTEGER | FOREIGN KEY → orders.id | Order reference |
| amount | INTEGER | NOT NULL | Payment amount |
| method | TEXT | NOT NULL | bank_transfer/qris/e_wallet/cod |
| provider | TEXT | NULL | BCA/Mandiri/GoPay/OVO/etc |
| proof_image | TEXT | NULL | Upload path |
| status | TEXT | NOT NULL DEFAULT 'pending' | pending/verified/rejected |
| verified_by | INTEGER | FOREIGN KEY → users.id | Admin who verified |
| verified_at | DATETIME | NULL | Verification timestamp |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

**Payment Method Values:**
- `bank_transfer` - Bank transfer (BCA, Mandiri, BRI, BNI)
- `qris` - QRIS payment
- `e_wallet` - E-wallet (GoPay, OVO, DANA, ShopeePay)
- `cod` - Cash on delivery (auto-approved)

#### 7. `vouchers`
Promo/discount codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| code | TEXT | NOT NULL UNIQUE | Voucher code |
| type | TEXT | NOT NULL | percentage/fixed |
| value | INTEGER | NOT NULL | Discount value |
| min_purchase | INTEGER | DEFAULT 0 | Minimum purchase |
| valid_until | DATETIME | NULL | Expiry date |
| usage_limit | INTEGER | NULL | Max uses |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 8. `reviews`
Customer reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| order_id | INTEGER | FOREIGN KEY → orders.id | Order reference |
| rating | INTEGER | NOT NULL | 1-5 stars |
| comment | TEXT | NULL | Review text |
| images | TEXT | NULL | JSON array of image paths |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 9. `loyalty_points`
Reward points tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| user_id | INTEGER | FOREIGN KEY → users.id | User reference |
| points | INTEGER | NOT NULL | Points amount |
| transaction_type | TEXT | NOT NULL | earned/redeemed |
| description | TEXT | NULL | Description |
| created_at | DATETIME | NOT NULL | Transaction date |

#### 10. `push_subscriptions`
Browser push notification tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| user_id | INTEGER | FOREIGN KEY → users.id | User reference (nullable for guests) |
| endpoint | TEXT | NOT NULL | Push endpoint URL |
| keys | TEXT | NOT NULL | JSON { p256dh, auth } |
| created_at | DATETIME | NOT NULL | Subscription date |

#### 11. `queue_settings`
Queue number management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| current_queue | INTEGER | DEFAULT 0 | Current queue number being served |
| daily_queue | INTEGER | DEFAULT 0 | Today's queue count (resets daily) |
| last_reset_date | DATE | NULL | Last daily reset date |
| active | BOOLEAN | DEFAULT true | Is queue system active |
| created_at | DATETIME | NOT NULL | Creation date |
| updated_at | DATETIME | NOT NULL | Last update |

#### 12. `orders` (Updated)
Order transactions with queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID |
| customer_name | TEXT | NOT NULL | Customer name |
| customer_phone | TEXT | NOT NULL | WhatsApp number |
| delivery_type | TEXT | NOT NULL | dine_in/takeaway/delivery |
| delivery_address | TEXT | NULL | Delivery address |
| minimum_order_met | BOOLEAN | DEFAULT false | Min Rp 50K for delivery |
| queue_number | INTEGER | NULL | Queue number assigned |
| estimated_time | INTEGER | NULL | Estimated wait time (minutes) |
| status | TEXT | NOT NULL DEFAULT 'pending_payment' | Order status |
| total | INTEGER | NOT NULL | Total amount |
| created_at | DATETIME | NOT NULL | Order date |
| updated_at | DATETIME | NOT NULL | Last update |

---

## 🔌 API ENDPOINTS

### Authentication (Staff Only)

```
POST   /api/auth/login          - Staff login
POST   /api/auth/logout         - Staff logout
GET    /api/auth/me             - Get current staff
```

### Products

```
GET    /api/products            - List all products
GET    /api/products/:id        - Get product detail
POST   /api/products            - Create product (admin)
PUT    /api/products/:id        - Update product (admin)
DELETE /api/products/:id        - Delete product (admin)
```

### Categories

```
GET    /api/categories          - List all categories
POST   /api/categories          - Create category (admin)
PUT    /api/categories/:id      - Update category (admin)
DELETE /api/categories/:id      - Delete category (admin)
```

### Orders

```
POST   /api/orders              - Create new order
GET    /api/orders              - List orders (staff)
GET    /api/orders/:id          - Get order detail
GET    /api/orders/track/:phone - Track order by phone
PUT    /api/orders/:id/status   - Update order status (kitchen/admin)
DELETE /api/orders/:id          - Cancel order
```

### Payments

```
POST   /api/payments            - Upload payment proof
GET    /api/payments/:orderId   - Get payment by order
PUT    /api/payments/:id/verify - Verify payment (admin)
PUT    /api/payments/:id/reject - Reject payment (admin)
```

### Reviews

```
POST   /api/reviews             - Create review (completed orders)
GET    /api/reviews             - List all reviews (admin)
GET    /api/reviews/product/:id - Product reviews
```

### Vouchers

```
GET    /api/vouchers            - List active vouchers
GET    /api/vouchers/:code      - Validate voucher code
POST   /api/vouchers            - Create voucher (admin)
PUT    /api/vouchers/:id        - Update voucher (admin)
DELETE /api/vouchers/:id        - Delete voucher (admin)
```

### Loyalty Points

```
GET    /api/loyalty/:phone      - Get user points
POST   /api/loyalty/earn        - Add points (on completed order)
POST   /api/loyalty/redeem      - Redeem points
```

### Staff & Analytics

```
GET    /api/staff/online        - List online staff
PUT    /api/staff/status        - Update staff status (staff)
GET    /api/analytics/overview  - Dashboard overview (admin)
GET    /api/analytics/users     - Online users count (admin)
GET    /api/analytics/activity  - User activity feed (admin)
```

### Queue

```
GET    /api/queue/current       - Get current queue status
GET    /api/queue/:orderId      - Get order queue position
GET    /api/queue/stats         - Queue statistics
PUT    /api/queue/next          - Call next queue (kitchen)
PUT    /api/queue/complete      - Complete queue (kitchen)
```

### Notifications

```
POST   /api/notifications/subscribe     - Register push subscription
POST   /api/notifications/send          - Send push notification (admin)
GET    /api/notifications/history       - Notification history (admin)
```

---

## 🔌 SOCKET.IO EVENTS

### Client → Server

```javascript
// User tracking
socket.emit('user:online', { userId, page })
socket.emit('user:navigate', { page })
socket.emit('user:offline', { userId })

// Staff tracking
socket.emit('staff:online', { staffId, department })
socket.emit('staff:status', { status: 'online' | 'offline' | 'busy' })

// Order updates
socket.emit('order:update', { orderId, status })

// Queue updates
socket.emit('queue:next', { queueNumber })
socket.emit('queue:complete', { queueNumber })

// Join rooms
socket.emit('join:admin')
socket.emit('join:kitchen')
socket.emit('join:customer', { orderId })
```

### Server → Client

```javascript
// User tracking (admin)
socket.emit('users:count', { count, users: [...] })
socket.emit('user:activity', { userId, page, timestamp })

// Staff status (customer)
socket.emit('staff:updated', { staffId, department, status })
socket.emit('staff:list', { staff: [...] })

// Order updates (customer)
socket.emit('order:status_update', { orderId, status, timestamp })

// Queue updates (customer)
socket.emit('queue:update', { 
  queueNumber, 
  currentServing, 
  estimatedTime, 
  totalToday 
})

// New order (admin/kitchen)
socket.emit('order:new', { order })

// Payment updates (admin)
socket.emit('payment:pending', { payment })
socket.emit('payment:verified', { payment })

// Notifications
socket.emit('notification', { title, body, type })
```

---

## 📊 ORDER WORKFLOW

### State Machine

```
                                    ┌─────────────┐
                                    │  PENDING    │
                                    │  PAYMENT    │
                                    └──────┬──────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
               ┌────────────────┐ ┌────────────────┐ ┌───────────────┐
               │    WAITING     │ │    REJECTED    │ │  CANCELLED    │
               │  VERIFICATION  │ └────────────────┘ └───────────────┘
               └───────┬────────┘
                       │
           ┌───────────┼───────────┐
           │                       │
           ▼                       ▼
    ┌─────────────┐         ┌─────────────┐
    │    PAID     │         │  REJECTED   │
    └──────┬──────┘         └─────────────┘
           │
           ▼
    ┌─────────────┐
    │ PREPARING   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │    READY    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  COMPLETED  │
    └─────────────┘
```

### Status Transitions

| From | To | Trigger | Actor |
|------|-----|---------|-------|
| `pending_payment` | `waiting_verification` | Upload payment proof | Customer |
| `pending_payment` | `cancelled` | Cancel order | Customer |
| `waiting_verification` | `paid` | Verify payment | Admin |
| `waiting_verification` | `rejected` | Reject payment | Admin |
| `paid` | `preparing` | Start preparation | Kitchen |
| `preparing` | `ready` | Order ready | Kitchen |
| `ready` | `completed` | Customer receives order | Kitchen/Driver |
| Any | `cancelled` | Cancel order | Admin/Customer |

---

## 🎫 QUEUE SYSTEM

### Queue Number Assignment

When order status changes to `paid`, a queue number is automatically assigned:

```javascript
// Queue number format: #042
queue_number = daily_queue + 1
```

### Customer View - Queue Display

```
┌─────────────────────────────────────┐
│  🎫 STATUS ANTRIAN ANDA             │
├─────────────────────────────────────┤
│                                     │
│         #042                        │
│      Antrian Ke-42                  │
│                                     │
│  ─────────────────────────────────  │
│  📊 Antrian Saat Ini:               │
│                                     │
│  🍳 Dapur:                          │
│  ├─ #038  →  Sedang dimasak         │
│  ├─ #039  →  Sedang dimasak         │
│  ├─ #040  →  Plating                │
│  ├─ #041  →  Siap diambil           │
│  └─ #042  →  Antrian Anda           │
│                                     │
│  ⏱️ Estimasi: 15-20 menit           │
│                                     │
│  📦 Total Pesanan Hari Ini: 156     │
└─────────────────────────────────────┘
```

### Queue Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   WAITING    │ -> │  PREPARING   │ -> │    READY     │
└──────────────┘    └──────────────┘    └──────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  Assigned            Cooking             Completed
  #042                #038                #036
```

### Estimated Time Calculation

```javascript
// Base time per order: 5 minutes
// Pending orders ahead × 5 minutes
estimated_time = (queue_number - current_queue) × 5
```

### Real-time Updates

| Event | Trigger | Recipients |
|-------|---------|------------|
| `queue:update` | New order paid | All customers |
| `queue:next` | Kitchen calls next | All customers |
| `queue:complete` | Order completed | Kitchen/Admin |

### Kitchen Queue View

```
┌─────────────────────────────────────┐
│  🍳 ANTRIAN DAPUR                   │
├─────────────────────────────────────┤
│  Sedang Dimasak:                    │
│  ┌────────────────────────────────┐ │
│  │ #038 - Bakso Mercon (2x)       │ │
│  │ #039 - Bakso Urat (1x)         │ │
│  └────────────────────────────────┘ │
│                                     │
│  Siap Disajikan:                    │
│  ┌────────────────────────────────┐ │
│  │ #036 - Bakso Telur (1x) [DONE] │ │
│  │ #037 - Bakso Beranak (2x)      │ │
│  └────────────────────────────────┘ │
│                                     │
│  [PANGGIL NEXT]  [UPDATE STATUS]    │
└─────────────────────────────────────┘
```

### Daily Reset

Queue counter resets daily at 00:00:
- `daily_queue` → 0
- `last_reset_date` → today
- Queue numbers start from #001 each day

---

## 💳 PAYMENT METHODS

### 1. Bank Transfer

| Provider | Account |
|----------|---------|
| BCA | 1234567890 |
| Mandiri | 1234567890 |
| BRI | 1234567890 |
| BNI | 1234567890 |

**Flow:**
1. Customer selects Bank Transfer
2. Shows bank account details
3. Customer transfers manually
4. Upload proof (screenshot/photo)
5. Status: `waiting_verification`
6. Admin verifies → `paid`

### 2. QRIS

**Flow:**
1. Customer selects QRIS
2. Shows QR code
3. Customer scans & pays via e-wallet
4. Upload proof
5. Status: `waiting_verification`
6. Admin verifies → `paid`

### 3. E-Wallet

| Provider | Number |
|----------|--------|
| GoPay | 0812-xxxx-xxxx |
| OVO | 0812-xxxx-xxxx |
| DANA | 0812-xxxx-xxxx |
| ShopeePay | 0812-xxxx-xxxx |

**Flow:**
1. Customer selects E-Wallet
2. Shows wallet number
3. Customer transfers manually
4. Upload proof
5. Status: `waiting_verification`
6. Admin verifies → `paid`

### 4. COD (Cash on Delivery)

**Flow:**
1. Customer selects COD
2. Auto-approved
3. Status: `paid`
4. Pay on delivery/pickup

---

## 👥 USER ROLES

### Customer
- Browse menu
- Create order (name + phone only)
- Select delivery type
- Upload payment proof
- Track order status
- View staff online status
- Receive push notifications
- Leave review (after completed)
- Earn loyalty points

### Admin
- Dashboard analytics
- View online users count
- Track user activity
- Verify/reject payments
- Manage products
- Manage categories
- Manage vouchers
- Manage staff visibility
- View reviews
- Send notifications

### Kitchen
- View order queue
- Update order status (preparing → ready → completed)
- Receive real-time notifications
- View order details

### Driver
- View delivery orders
- Update delivery status
- Mark as delivered

---

## ✨ FEATURES

### Customer Features
- [x] No registration required
- [x] Browse menu by category
- [x] Search products
- [x] Shopping cart
- [x] Delivery type selection (Dine-in/Takeaway/Delivery)
- [x] Progressive trust delivery validation
- [x] Multiple payment methods
- [x] Payment proof upload
- [x] Order tracking
- [x] Real-time status updates
- [x] Staff online/offline visibility
- [x] Browser push notifications
- [x] Loyalty points system
- [x] Voucher/promo code support
- [x] Review & rating (completed orders only)
- [x] Order history by phone
- [x] **Queue number display**
- [x] **Estimated wait time**

### Admin Features
- [x] Dashboard overview
- [x] Real-time online users count
- [x] User activity tracking
- [x] Payment verification workflow
- [x] Product management (CRUD)
- [x] Category management
- [x] Voucher management
- [x] Staff status management
- [x] Order management
- [x] Review moderation
- [x] Analytics & reports
- [x] Push notification sender
- [x] Blacklist management

### Kitchen Features
- [x] Order queue view
- [x] Order status updates
- [x] Real-time notifications
- [x] Order details view
- [x] **Queue number management**
- [x] **Call next queue**
- [x] **Mark queue complete**

---

## 📁 PROJECT STRUCTURE

```
/root/frontshop/
│
├── backend/
│   ├── config/
│   │   ├── database.js          # SQLite configuration
│   │   ├── socket.js            # Socket.io setup
│   │   └── vapid.js             # VAPID keys for push
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── reviewController.js
│   │   ├── voucherController.js
│   │   ├── loyaltyController.js
│   │   ├── staffController.js
│   │   ├── analyticsController.js
│   │   ├── queueController.js   # Queue management
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── upload.js            # Multer configuration
│   │   └── socketAuth.js        # Socket authentication
│   ├── models/
│   │   ├── index.js             # Sequelize initialization
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Payment.js
│   │   ├── Voucher.js
│   │   ├── Review.js
│   │   ├── LoyaltyPoint.js
│   │   ├── PushSubscription.js
│   │   └── QueueSetting.js      # Queue management
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── reviews.js
│   │   ├── vouchers.js
│   │   ├── loyalty.js
│   │   ├── staff.js
│   │   ├── analytics.js
│   │   ├── queue.js             # Queue endpoints
│   │   └── notifications.js
│   ├── utils/
│   │   └── pushNotification.js  # Push notification helper
│   ├── uploads/
│   │   ├── payments/            # Payment proof images
│   │   └── reviews/             # Review images
│   ├── .env
│   ├── .gitignore
│   └── server.js                # Express entry point
│
├── frontend/
│   ├── public/
│   │   ├── icons/               # PWA icons
│   │   └── manifest.json        # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Dialog.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── StaffList.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   ├── PaymentUpload.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── OrderTimeline.jsx
│   │   │   ├── QueueDisplay.jsx   # Queue number display
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Order.jsx
│   │   │   ├── Tracking.jsx
│   │   │   ├── QueueStatus.jsx  # Queue status page
│   │   │   ├── Contact.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Categories.jsx
│   │   │   │   ├── Vouchers.jsx
│   │   │   │   ├── Staff.jsx
│   │   │   │   └── Analytics.jsx
│   │   │   └── kitchen/
│   │   │       └── Orders.jsx
│   │   ├── store/
│   │   │   ├── useOrderStore.js
│   │   │   ├── useUserStore.js
│   │   │   └── useSocketStore.js
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useNotification.js
│   │   ├── utils/
│   │   │   ├── registerPush.js
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── service-worker.js
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🔧 ENVIRONMENT SETUP

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_DIALECT=sqlite
DB_STORAGE=./backend/database.sqlite

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# VAPID Keys (for Web Push)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@bakso.com

# Upload
UPLOAD_DIR=./backend/uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
# API
VITE_API_URL=http://localhost:5000/api

# VAPID Public Key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

# Socket
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🎨 DESIGN SYSTEM

### Color Palette (Apple-style)

```css
/* Primary Colors */
--primary: #007AFF        /* Apple Blue */
--primary-hover: #0056CC

/* Status Colors */
--success: #34C759        /* Apple Green */
--warning: #FF9500        /* Apple Orange */
--error: #FF3B30          /* Apple Red */

/* Background */
--bg-primary: #F2F2F7     /* iOS Light Gray */
--bg-card: #FFFFFF        /* Pure White */
--bg-dark: #1C1C1E        /* iOS Black */

/* Text */
--text-primary: #1C1C1E
--text-secondary: #8E8E93
--text-inverse: #FFFFFF

/* Borders */
--border: #E5E5EA
--border-dark: #C7C7CC
```

### Typography

```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif

/* Sizes */
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 28px
```

### Spacing

```css
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
```

### Border Radius (iOS-style)

```css
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
--radius-xl: 20px
--radius-full: 9999px
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/docs

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-13 | Initial release with queue system |

---

## 📞 SUPPORT

For questions or issues, contact the development team.

---

**Built with ❤️ for Bakso Business**  
*Web-based PWA • Apple Design • Real-time • No KYC • Queue System*
