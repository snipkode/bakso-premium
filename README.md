# 🍜 BAKSO PREMIUM ORDERING SYSTEM

A premium digital ordering system for bakso (Indonesian meatball) restaurants with real-time queue tracking, Apple-style design, and browser push notifications.

---

## ✨ FEATURES

### Customer Features
- 🍜 Browse menu with categories
- 🔍 Search and filter products
- 🛒 Shopping cart with customizations
- 📍 Dine-in, Takeaway, or Delivery options
- 💳 Multiple payment methods (Bank Transfer, QRIS, E-Wallet, COD)
- 🎫 Real-time queue number tracking
- ⏱️ Estimated wait time calculation
- 🔔 Browser push notifications
- 📊 Order history and tracking
- ⭐ Review and rating system
- 🎁 Loyalty points and vouchers

### Admin Features
- 📈 Real-time dashboard with analytics
- 👥 User management
- 🍽️ Product and category management
- 💰 Payment verification
- 📦 Order management
- 🎫 Voucher management
- 🔔 Push notification sender
- 👨‍🍳 Staff status tracking

### Kitchen Features
- 📋 Real-time order queue
- ⚡ Status updates (Preparing → Ready → Completed)
- 🎯 Queue number management

### Driver Features
- 🛵 Delivery order management
- 📍 Delivery address tracking

---

## 🛠️ TECH STACK

### Backend
- **Node.js** + **Express.js** - Server framework
- **SQLite** - Database (dev)
- **Sequelize** - ORM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **Web Push** - Browser notifications

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Socket.io Client** - Real-time
- **Lucide React** - Icons

---

## 📁 PROJECT STRUCTURE

```
/root/frontshop/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   ├── voucherController.js
│   │   │   ├── reviewController.js
│   │   │   ├── loyaltyController.js
│   │   │   ├── pushController.js
│   │   │   ├── dashboardController.js
│   │   │   └── queueController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Payment.js
│   │   │   ├── Voucher.js
│   │   │   ├── Review.js
│   │   │   ├── LoyaltyPoint.js
│   │   │   ├── PushSubscription.js
│   │   │   └── QueueSetting.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── voucherRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── loyaltyRoutes.js
│   │   │   ├── pushRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── queueRoutes.js
│   │   ├── utils/
│   │   │   └── seed.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── BaseComponents.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── Toaster.jsx
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetailPage.jsx
│   │   │   ├── TrackOrderPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── admin/
│   │   │   ├── kitchen/
│   │   │   └── driver/
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
└── System.md
```

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

#### 1. Clone and Setup Backend

```bash
cd /root/frontshop/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Seed database with initial data
npm run seed
```

#### 2. Setup Frontend

```bash
cd /root/frontshop/frontend

# Install dependencies (already done)
npm install

# Copy environment file
cp .env.example .env  # or create .env with VITE_API_URL
```

### Running the Application

#### Start Backend (Terminal 1)

```bash
cd /root/frontshop/backend
npm run dev
```

Backend will run on `http://localhost:3001`

#### Start Frontend (Terminal 2)

```bash
cd /root/frontshop/frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔐 DEFAULT LOGIN CREDENTIALS

After running `npm run seed`, you can login with:

| Role | Phone | Password |
|------|-------|----------|
| Admin | 081234567890 | admin123 |
| Kitchen | 081234567891 | kitchen123 |
| Driver | 081234567892 | driver123 |

**Customer Login:** Just enter any name and phone number (no password required).

---

## 📱 API ENDPOINTS

### Authentication
- `POST /api/auth/customer` - Customer login/register
- `POST /api/auth/staff` - Staff login
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile

### Products
- `GET /api/categories` - Get all categories
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/queue/today` - Get today's queue stats

### Payments
- `POST /api/payments` - Create payment (with proof upload)
- `GET /api/payments/pending` - Get pending payments (admin)
- `PATCH /api/payments/:id/verify` - Verify payment (admin)

### Queue
- `GET /api/queue/today` - Get today's queue
- `GET /api/queue/history` - Get queue history (admin)

### Dashboard (Admin)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get user activity
- `GET /api/dashboard/staff` - Get staff status

---

## 🔌 SOCKET.IO EVENTS

### Client → Server
- `join` - Join room with user data
- `page:change` - Update current page
- `staff:status:update` - Update staff status

### Server → Client
- `users:count` - Online users count
- `staff:status` - Staff status update
- `order:updated` - Order status update
- `payment:verified` - Payment verification
- `queue:updated` - Queue number update
- `notification` - Push notification

---

## 🎨 DESIGN SYSTEM

### Colors (Apple-style)
- **Primary:** `#007AFF` (Apple Blue)
- **Success:** `#34C759` (Apple Green)
- **Warning:** `#FF9500` (Apple Orange)
- **Error:** `#FF3B30` (Apple Red)
- **Background:** `#FFFFFF` / `#000000` (Dark)
- **Surface:** `#F2F2F7` / `#1C1C1E` (Dark)

### Typography
- **Font:** -apple-system, SF Pro Display
- **Sizes:** xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24)

### Components
- Rounded corners: `12px` (iOS), `20px` (iOS-lg)
- Shadows: Soft, layered shadows
- Animations: Spring-based, smooth transitions

---

## 📊 DATABASE SCHEMA

### Tables (12)
1. **users** - Customer and staff accounts
2. **categories** - Product categories
3. **products** - Menu items
4. **orders** - Order headers
5. **order_items** - Order line items
6. **payments** - Payment records
7. **vouchers** - Promo codes
8. **reviews** - Product reviews
9. **loyalty_points** - Reward points
10. **push_subscriptions** - Browser push tokens
11. **queue_settings** - Daily queue management
12. **(timestamps auto)** - created_at, updated_at

---

## 🔄 ORDER WORKFLOW

```
1. PENDING_PAYMENT
   ↓ (customer pays)
2. WAITING_VERIFICATION
   ↓ (admin verifies)
3. PAID → Queue number assigned
   ↓ (kitchen starts)
4. PREPARING
   ↓ (kitchen finishes)
5. READY
   ↓ (driver delivers / customer picks up)
6. COMPLETED

Alternative flows:
- REJECTED (payment verification failed)
- CANCELLED (customer cancels)
```

---

## 🎫 QUEUE SYSTEM

### How It Works
1. Queue number assigned when payment is verified
2. Daily reset at 00:00 (starts from #001)
3. Estimated time = queue_position × 5 minutes
4. Real-time updates via Socket.io

### Customer View
```
🎫 Antrian Ke-#042
⏱️ Estimasi: 15-20 menit
📦 Total Hari Ini: 156
```

---

## 🔔 PUSH NOTIFICATIONS

### Setup
1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add keys to `.env`
3. Frontend requests permission
4. Store subscription in database
5. Send notifications via Socket.io or Web Push API

---

## 🚀 DEPLOYMENT

### Backend (Production)
```bash
# Change database to PostgreSQL/MySQL
# Update .env with production values
npm start
```

### Frontend (Production)
```bash
npm run build
# Deploy dist/ folder to static hosting
```

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DB_STORAGE=./database.sqlite
JWT_SECRET=your_secret_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🧪 TESTING

### Manual Testing Checklist
- [ ] Customer registration/login
- [ ] Browse menu and search
- [ ] Add to cart with customizations
- [ ] Checkout with different order types
- [ ] Payment proof upload
- [ ] Admin payment verification
- [ ] Queue number assignment
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Staff status visibility
- [ ] Review submission

---

## 📝 TODO / ENHANCEMENTS

### Pending Features
- [ ] Complete admin pages (Orders, Products, Payments, Users)
- [ ] Complete driver view
- [ ] Map integration for delivery
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Export reports (PDF, Excel)
- [ ] Multi-language support
- [ ] PWA offline mode
- [ ] Image optimization
- [ ] Rate limiting
- [ ] Caching layer

### Known Issues
- Some admin pages are placeholders
- Driver view needs implementation
- Toast notifications need enhancement

---

## 📄 LICENSE

MIT License - Feel free to use for your projects!

---

## 👨‍💻 DEVELOPED BY

Bakso Premium Team - 2024

---

## 🆘 SUPPORT

For issues or questions:
1. Check System.md for detailed documentation
2. Review API endpoints in this README
3. Check console logs for errors
4. Verify database connection
5. Ensure Socket.io is connected

---

**Happy Coding! 🍜🚀**
