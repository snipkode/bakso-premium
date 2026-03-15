# Design Guidelines - Bakso Premium Admin

## Typography Scale

### Headings
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 / Page Title | `text-lg` (18px) | `font-bold` (700) | Page titles, order numbers |
| H2 / Section Title | `text-sm` (14px) | `font-bold` (700) | Card section headers |
| H3 / Subsection | `text-xs` (12px) | `font-semibold` (600) | Sub-section labels |

### Body Text
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Primary Content | `text-sm` (14px) | `font-medium` (500) | Main readable content |
| Secondary Content | `text-xs` (12px) | `font-medium` (500) | Supporting info, labels |
| Tertiary/Meta | `text-[10px]` (10px) | `font-medium` (500) | Timestamps, hints, captions |

### Numbers & Prices
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Large Total | `text-lg` (18px) | `font-bold` (700) | Grand totals (highlighted) |
| Price Display | `text-xs` (12px) | `font-bold` (700) | Item prices |
| Counter/Badge | `text-xs` (12px) | `font-bold` (700) | Quantity badges |

---

## Spacing System

### Padding
| Context | Class | Pixels |
|---------|-------|--------|
| Card Inner | `p-3` | 12px |
| Card Compact | `p-2` | 8px |
| Element Inner | `px-2.5 py-1.5` | 10px × 6px |

### Gap (Spacing Between Elements)
| Context | Class | Pixels |
|---------|-------|--------|
| Major Sections | `gap-2` | 8px |
| Related Items | `gap-1.5` | 6px |
| Tight Groups | `gap-1` | 4px |

### Space-Y (Vertical Stacking)
| Context | Class | Pixels |
|---------|-------|--------|
| Card Sections | `space-y-3` | 12px |
| List Items | `space-y-2` | 8px |
| Inline Elements | `space-y-1.5` | 6px |

---

## Element Sizes

### Icons
| Context | Size | Class |
|---------|------|-------|
| Standard Icons | 16×16px | `w-4 h-4` |
| Small Icons | 14×14px | `w-3.5 h-3.5` |
| Mini Icons | 10×10px | `w-2.5 h-2.5` |

### Avatar/Icon Containers
| Context | Size | Class |
|---------|------|-------|
| Section Icons | 32×32px | `w-8 h-8 rounded-lg` |
| User Avatar | 32×32px | `w-8 h-8 rounded-full` |
| Quantity Badge | 36×36px | `w-9 h-9 rounded-lg` |

### Status Indicators
| Context | Size | Class |
|---------|------|-------|
| Progress Circle | 28×28px | `w-7 h-7 rounded-full` |
| Status Dot | 8×8px | `w-2 h-2 rounded-full` |

### Buttons
| Context | Height | Class |
|---------|--------|-------|
| Icon Button | 32px | `w-8 h-8` |
| Action Button | Auto | `px-2.5 py-1.5 text-xs h-auto` |
| Badge Button | Auto | `px-2.5 py-1 text-xs` |

---

## Layout Structure

### Page Container
```jsx
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
```

### Sticky Header
```jsx
<div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
  <div className="px-3 py-2.5">
```

### Content Area
```jsx
<div className="p-3 space-y-3">
```

### Card Component
```jsx
<Card className="p-3">
  <div className="flex items-center gap-2 mb-2">
    {/* Icon + Title */}
  </div>
  <div className="space-y-2">
    {/* Content */}
  </div>
</Card>
```

---

## Color System

### Status Colors
| Status | Gradient | Badge Variant |
|--------|----------|---------------|
| Warning/Pending | `from-orange-500 to-amber-500` | `warning` |
| Primary/Active | `from-blue-500 to-cyan-500` | `primary` |
| Success | `from-green-500 to-emerald-500` | `success` |
| Error | `from-red-500 to-pink-500` | `error` |

### Background Accents
| Type | Light Mode | Dark Mode |
|------|------------|-----------|
| Blue Accent | `bg-blue-50` | `bg-blue-900/20` |
| Orange Accent | `bg-orange-50` | `bg-orange-900/20` |
| Green Accent | `bg-green-50` | `bg-green-900/20` |
| Red Accent | `bg-red-50` | `bg-red-900/20` |
| Gray Surface | `bg-gray-50` | `bg-gray-800/50` |

### Border Colors
| Context | Light Mode | Dark Mode |
|---------|------------|-----------|
| Default | `border-gray-200` | `border-gray-700` |
| Blue Accent | `border-blue-200` | `border-blue-800` |
| Orange Accent | `border-orange-200` | `border-orange-800` |
| Green Accent | `border-green-200` | `border-green-900/30` |

---

## Design Principles

### 1. Compact But Readable
- Use smaller fonts but maintain readability
- Reduce padding but keep touch targets accessible
- Tight spacing but preserve visual hierarchy

### 2. Consistent Visual Language
- All cards use `p-3` padding
- All section headers use `text-sm font-bold`
- All icons use `w-4 h-4` standard size
- All rounded corners use `rounded-lg` or `rounded-xl`

### 3. Color-Coded Information
- Orange: Highlights, totals, important actions
- Blue: Information, delivery addresses
- Green: Success states, discounts
- Gray: Neutral content, metadata

### 4. Gradient Accents
- Icons use gradient backgrounds for visual interest
- Buttons use gradient for call-to-action emphasis
- Status indicators use gradient for completion states

### 5. Shadow Hierarchy
| Element | Shadow |
|---------|--------|
| Cards | Default (from Card component) |
| Icons | `shadow-md` |
| Buttons | `shadow-md` |
| Status Circles | `shadow-md` |
| Progress (active) | `shadow-lg` + ring |

---

## Component Patterns

### Section Header Pattern
```jsx
<div className="flex items-center gap-2 mb-2">
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-{color}-500 to-{color}-500 flex items-center justify-center shadow-md">
    <Icon className="w-4 h-4 text-white" />
  </div>
  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Section Title</h3>
</div>
```

### Info Row Pattern
```jsx
<div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Label</span>
  </div>
  <span className="text-xs font-semibold text-gray-900 dark:text-white">Value</span>
</div>
```

### List Item Pattern
```jsx
<div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
    {quantity}x
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
    {notes && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{notes}</p>}
  </div>
  <p className="text-orange-600 dark:text-orange-400 font-bold text-xs whitespace-nowrap">{price}</p>
</div>
```

### Status Badge Pattern
```jsx
<Badge variant={status.color} className="text-xs px-2.5 py-1 font-semibold">
  {status.label}
</Badge>
```

---

## Quick Reference

### DO ✅
- Use `text-sm` for primary content
- Use `text-xs` for labels and secondary info
- Use `text-[10px]` for meta/captions only
- Keep `gap-2` as standard spacing
- Use `p-3` for card padding
- Use `w-4 h-4` for icons
- Use `w-8 h-8` for icon containers

### DON'T ❌
- Don't use `text-base` or larger (too big)
- Don't use `gap-4` or larger (too loose)
- Don't use `p-4` or larger (wastes space)
- Don't use `w-5 h-5` icons (too big)
- Don't use `w-10 h-10` containers (too big)
- Don't add extra margin/padding unless necessary

---

## File Reference

| Component | File Path |
|-----------|-----------|
| Order Detail Page | `frontend/src/pages/admin/OrderDetail.jsx` |
| Orders List Page | `frontend/src/pages/admin/Orders.jsx` |
| Base Components | `frontend/src/components/ui/BaseComponents.jsx` |
| Utils | `frontend/src/lib/utils.js` |
| API | `frontend/src/lib/api.js` |

---

*Last updated: 2026-03-15*
*Design system version: Compact v1.0*

---

## Order Status Flow (Based on E2E Tests)

### Complete Status Flow

```
pending_payment → waiting_verification → paid → preparing → ready → out_for_delivery → completed
                                                                            ↓
                                                                    rejected/cancelled
```

### Flow by Order Type

#### 🍽️ Dine-In Flow
```
pending_payment → paid → preparing → ready → completed
```
- Skip `out_for_delivery` status
- From `ready` can directly go to `completed`

#### 🛍️ Takeaway Flow
```
pending_payment → paid → preparing → ready → completed
```
- Same as dine-in
- From `ready` can directly go to `completed`

#### 🛵 Delivery Flow
```
pending_payment → paid → preparing → ready → out_for_delivery → completed
```
- Must go through `out_for_delivery` status
- Driver handles this status update

### Status Transitions Table

| Current Status | Next Available Status |
|----------------|----------------------|
| `pending_payment` | `paid`, `cancelled` |
| `waiting_verification` | `paid`, `cancelled` |
| `paid` | `preparing`, `cancelled` |
| `preparing` | `ready`, `cancelled` |
| `ready` | `out_for_delivery`, `completed` |
| `out_for_delivery` | `completed` |
| `completed` | (none) |
| `cancelled` | (none) |
| `rejected` | (none) |

### Implementation Notes

1. **Progress Bar**: Shows `out_for_delivery` step only for delivery orders
2. **Status Buttons**: Available transitions depend on current status
3. **Driver Role**: Only driver can update to `out_for_delivery` status
4. **Auto-transitions**: Some status changes trigger automatic actions:
   - `paid` → assigns queue number
   - `completed` → awards loyalty points, increments completed_orders

---

## Context-Aware Status Labels (Customer View)

Status labels displayed to customers are **dynamic** based on order type for better UX.

### Status Display by Order Type

| Status | Dine-In (🍽️) | Takeaway (🛍️) | Delivery (🛵) |
|--------|---------------|----------------|---------------|
| `pending_payment` | Menunggu Pembayaran | Menunggu Pembayaran | Menunggu Pembayaran |
| `paid` | Dibayar - Menunggu Antrian | Dibayar - Menunggu Antrian | Dibayar - Menunggu Konfirmasi |
| `preparing` | Sedang Dimasak | Sedang Diracik | Sedang Dimasak |
| `ready` | **Siap Disajikan** | **Siap Diambil** | **Siap Diantar** |
| `out_for_delivery` | Sedang Diantar | Sedang Diantar | **Driver Menuju Lokasi** |
| `completed` | **Selamat Menikmati** | **Selamat Menikmati** | **Pesanan Tercapai** |
| `cancelled` | Dibatalkan | Dibatalkan | Dibatalkan |

### Status Descriptions by Order Type

| Status | Dine-In Description | Takeaway Description | Delivery Description |
|--------|---------------------|----------------------|----------------------|
| `paid` | Silakan tunggu di meja Anda | Silakan tunggu nomor antrian dipanggil | Menunggu driver untuk pengantaran |
| `preparing` | Dapur sedang menyiapkan pesanan Anda | Barista sedang meracik minuman Anda | Dapur sedang menyiapkan pesanan Anda |
| `ready` | Pesanan akan segera disajikan | Silakan ambil di kasir | Driver akan segera berangkat |
| `out_for_delivery` | Pesanan sedang dalam pengantaran | Pesanan sedang dalam pengantaran | Driver sedang menuju lokasi Anda |
| `completed` | Selamat menikmati hidangan Anda! | Terima kasih, sampai jumpa lagi! | Pesanan telah tiba, selamat menikmati! |

### Implementation Example

```javascript
// Context-aware status label function
const getStatusLabelShort = (status, orderType) => {
  if (status === 'ready') {
    if (orderType === 'takeaway') return 'Siap Diambil';
    if (orderType === 'dine-in') return 'Siap Disajikan';
    return 'Siap Diantar'; // default for delivery
  }
  if (status === 'out_for_delivery') return 'Dikirim';
  
  const labels = {
    pending_payment: 'Belum Bayar',
    paid: 'Dibayar',
    preparing: 'Disiapkan',
    completed: 'Selesai',
  };
  return labels[status] || getStatusLabel(status);
};
```

### Customer Messaging

**Track Card Display:**
- **Dine-In**: "Lacak Pesanan - Siap disajikan"
- **Takeaway**: "Lacak Pesanan - Siap diambil"
- **Delivery**: "Lacak Pesanan - Siap diantrar" / "Sedang dikirim"

**Filter Badges:**
- Show order count per status
- Icon changes based on context (🍽️ for ready)

---

## Role-Based Views & Permissions

### Customer Role (`/orders`)

**View:**
- Own orders only
- Filter by status (all, pending_payment, paid, preparing, ready, out_for_delivery, completed)
- Context-aware status labels

**Actions:**
- View order details
- Track active orders
- Create reviews for completed orders

**UI Components:**
- `OrdersPage.jsx` - Main orders list
- `OrderDetail.jsx` - Order tracking view
- `OrderSuccessPage.jsx` - Post-order confirmation

---

### Kitchen Role (`/kitchen`)

**View:**
- All orders with status: `paid`, `preparing`, `ready`, `completed`
- Filter tabs: All, Pending, Cooking, Ready
- Order items with notes

**Actions:**
- `paid` → `preparing` (Start Cooking)
- `preparing` → `ready` (Mark Ready)
- `ready` → `completed` (Complete - for dine-in/takeaway)

**UI Components:**
- `KitchenView.jsx` - Kitchen order management
- Stats: Pending, Cooking, Ready, Done

**Status Flow for Kitchen:**
```
paid → preparing → ready → completed
```

---

### Driver Role (`/driver`)

**View:**
- Delivery orders only (`order_type = 'delivery'`)
- Filter: All, Ready, On Way
- Customer info & delivery address

**Actions:**
- `ready` → `out_for_delivery` (Pick Up Order)
- `out_for_delivery` → `completed` (Mark Delivered)
- Call customer
- Navigate to address (Google Maps)

**UI Components:**
- `DriverView.jsx` - Delivery management
- Stats: Ready, On Way, Done

**Status Flow for Driver:**
```
ready → out_for_delivery → completed
```

---

### Admin Role (`/admin/orders`, `/admin/orders/:id`)

**View:**
- All orders (no filter by role)
- Full order details with customer info
- Payment verification

**Actions:**
- All status transitions available
- Payment verification
- Order cancellation

**UI Components:**
- `Orders.jsx` - Admin orders list
- `OrderDetail.jsx` - Full order management
- `Payments.jsx` - Payment verification

**Full Status Flow:**
```
pending_payment → paid → preparing → ready → out_for_delivery → completed
                          ↓              ↓
                    cancelled      cancelled
```

---

## Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLETE ORDER LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐                                               │
│  │ pending_payment  │ ─────────────────────┐                       │
│  └────────┬─────────┘                      │                       │
│           │                                │                       │
│           ▼                                ▼                       │
│  ┌──────────────────┐              ┌──────────────┐               │
│  │waiting_verification│            │  cancelled   │               │
│  └────────┬─────────┘              └──────────────┘               │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────┐                                              │
│  │       paid       │ ──→ Queue Number Assigned                   │
│  └────────┬─────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────┐    ┌─────────────┐                          │
│  │    preparing     │───→│   Kitchen   │                          │
│  └────────┬─────────┘    └─────────────┘                          │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────┐    ┌─────────────────────────────┐          │
│  │      ready       │───→│ Context-Aware Label:        │          │
│  └────────┬─────────┘    │ • Dine-in:  Siap Disajikan  │          │
│           │              │ • Takeaway: Siap Diambil    │          │
│           │              │ • Delivery: Siap Diantar    │          │
│           │              └─────────────────────────────┘          │
│           │                                                        │
│           ├─────────────┬──────────────────────────┐              │
│           │             │                          │              │
│           ▼             ▼                          │              │
│  ┌──────────────────┐ ┌──────────────────┐        │              │
│  │ out_for_delivery │ │    completed     │◄───────┘              │
│  │   (Delivery only)│ │                  │                       │
│  └────────┬─────────┘ └──────────────────┘                       │
│           │               ▲                                       │
│           └───────────────┘                                       │
│                    Driver                                         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## API Integration

### Order Status Update Endpoint

```javascript
// PATCH /api/orders/:id/status
{
  "status": "out_for_delivery" // or any valid status
}
```

### Response Format

```javascript
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "BSO/202603/1234",
    "status": "out_for_delivery",
    "queue_number": 15,
    // ... other fields
  }
}
```

### Socket Events

```javascript
// Listen for order updates
subscribeToOrderUpdates((data) => {
  if (data.order_id === orderId) {
    // Refresh order data
  }
});

// Emit staff status update (kitchen/driver)
emitStaffStatusUpdate(userId, 'online', 'kitchen'); // or 'driver'
```

---

## Files Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Customer Orders | `frontend/src/pages/OrdersPage.jsx` | Order list with context-aware labels |
| **Customer Order Detail** | `frontend/src/pages/CustomerOrderDetail.jsx` | **Clean, compact order tracking** |
| Admin Orders | `frontend/src/pages/admin/Orders.jsx` | Admin order management |
| Admin Order Detail | `frontend/src/pages/admin/OrderDetail.jsx` | Full order detail with status transitions |
| Kitchen View | `frontend/src/pages/kitchen/KitchenView.jsx` | Kitchen order processing |
| Driver View | `frontend/src/pages/driver/DriverView.jsx` | Delivery management |
| Utils | `frontend/src/lib/utils.js` | `getStatusLabel`, `getStatusColor` |
| API | `frontend/src/lib/api.js` | Order API calls |
| Socket | `frontend/src/lib/socket.js` | Real-time updates |

---

## Customer Order Detail Page Specification

### Design Principles

1. **Clean & Compact** - Minimal visual clutter, focus on essential info
2. **Status-First** - Order status and progress prominently displayed
3. **Context-Aware** - Labels adapt based on order type
4. **Mobile-Optimized** - Touch-friendly, easy to scan

### Layout Structure

```
┌─────────────────────────────────────┐
│  Header (Sticky)                    │
│  ← Back | Order # | Status Badge    │
├─────────────────────────────────────┤
│  Progress Card                      │
│  ○──○──○──○──○  (Timeline)         │
├─────────────────────────────────────┤
│  [Type] [Queue #]                   │
├─────────────────────────────────────┤
│  Delivery Address (if delivery)     │
├─────────────────────────────────────┤
│  Order Items                        │
│  - Item 1 (2x) ......... Rp 50.000  │
│  - Item 2 (1x) ......... Rp 25.000  │
├─────────────────────────────────────┤
│  Payment Summary                    │
│  Subtotal, Discount, Total          │
├─────────────────────────────────────┤
│  Customer Info (optional)           │
└─────────────────────────────────────┘
```

### Component Specifications

**Header:**
- Back button: `w-10 h-10 rounded-xl`
- Order number: `text-lg font-bold`
- Status badge: `text-xs px-3 py-1.5`

**Progress Timeline:**
- 6 steps: Order → Paid → Prep → Ready → Deliver → Done
- Circle size: `w-6 h-6`
- Active step: `ring-2 ring-blue-500/30 scale-110`
- Labels: `text-[10px] font-medium`

**Info Cards:**
- Padding: `p-3`
- Icon containers: `w-8 h-8 rounded-xl`
- Section titles: `text-sm font-bold`
- Content labels: `text-[10px] uppercase tracking-wide`

**Order Items:**
- Quantity badge: `w-8 h-8 rounded-lg text-[10px]`
- Product name: `text-sm font-semibold truncate`
- Price: `text-sm font-bold text-orange-600`
- Notes: `text-[10px] text-gray-500`

**Payment Summary:**
- Line items: `text-sm`
- Total: `text-lg font-bold text-orange-600`
- Divider: `border-t-2 border-dashed`

### Status Display Logic

```javascript
// Context-aware status label
if (status === 'ready') {
  if (orderType === 'takeaway') return 'Siap Diambil';
  if (orderType === 'dine-in') return 'Siap Disajikan';
  return 'Siap Diantar';
}
```

### Progress Timeline Steps

| Step | Label | Icon | Color |
|------|-------|------|-------|
| 1 | Order | 📄 | Gray |
| 2 | Paid | 💳 | Blue |
| 3 | Prep | 👨‍🍳 | Blue |
| 4 | Ready | ✅ | Green |
| 5 | Deliver | 🛵 | Green (delivery only) |
| 6 | Done | 🎉 | Green |

### Color Palette

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `bg-gray-50` | `bg-gray-900` |
| Cards | `bg-white` | `bg-gray-800` |
| Borders | `border-gray-100` | `border-gray-700` |
| Primary | `text-orange-600` | `text-orange-400` |
| Success | `text-green-600` | `text-green-400` |

### Typography Scale

| Element | Size | Weight |
|---------|------|--------|
| Page Title | `text-lg` | `font-bold` |
| Section Title | `text-sm` | `font-bold` |
| Content Label | `text-[10px]` | `font-medium` |
| Content Value | `text-sm` | `font-semibold` |
| Price/Total | `text-sm-lg` | `font-bold` |

### Interactive Elements

**Track Order Button:**
- Full width card
- Gradient background
- `hover:scale-[1.02]`
- Navigation icon

**Contact Buttons:**
- WhatsApp link for phone
- Email link for email
- Hover: `bg-green-50` / `bg-orange-50`

### Responsive Design

- Single column layout
- Sticky header for navigation
- Bottom padding for mobile navigation bar
- Touch-friendly tap targets (min 44x44px)

### Real-time Updates

```javascript
useEffect(() => {
  const unsubscribe = subscribeToOrderUpdates((data) => {
    if (data.order_id === id || data.orderId === id) {
      loadOrder();
    }
  });
  return () => unsubscribe();
}, [id]);
```

---
