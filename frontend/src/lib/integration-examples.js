/**
 * FRONTEND INTEGRATION GUIDE
 * Bakso Premium Ordering System
 * 
 * This file provides examples of how to integrate frontend with backend APIs
 * based on the E2E test implementations.
 * 
 * Reference E2E Tests:
 * - backend/test-e2e.js (Basic API tests)
 * - backend/test-workflow-e2e.js (Human workflow tests)
 * - backend/test-socket-e2e.js (Socket.IO tests)
 */

// ==================== IMPORTS ====================
import api, { 
  authAPI, 
  orderAPI, 
  paymentAPI, 
  productAPI,
  dashboardAPI,
  reportAPI 
} from './lib/api';

import {
  connectSocket,
  disconnectSocket,
  emitPageChange,
  emitStaffStatusUpdate,
  subscribeToOrderUpdates,
  subscribeToPaymentUpdates,
  subscribeToNotifications,
} from './lib/socket';

// ==================== 1. AUTHENTICATION ====================

/**
 * Customer Login (Phone-based, no password)
 * Reference: test-workflow-e2e.js - customerLogin()
 */
export async function customerLogin(name, phone) {
  try {
    const response = await authAPI.customerAuth(name, phone);
    // response.data = { token, user }
    
    // Store auth data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Connect socket for real-time updates
    connectSocket(response.data.user.id, response.data.user.role, '/menu');
    
    return response.data;
  } catch (error) {
    console.error('Customer login failed:', error);
    throw error;
  }
}

/**
 * Staff Login (Admin, Kitchen, Driver)
 * Reference: test-workflow-e2e.js - staffLogin()
 */
export async function staffLogin(phone, password) {
  try {
    const response = await authAPI.staffLogin(phone, password);
    // response.data = { token, user }
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Connect socket with staff role
    connectSocket(response.data.user.id, response.data.user.role, '/dashboard');
    
    return response.data;
  } catch (error) {
    console.error('Staff login failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Default Test Credentials (from seed data)
 * 
 * Admin:   081234567890 / admin123
 * Kitchen: 081234567891 / kitchen123
 * Driver:  081234567892 / driver123
 */
export const TEST_CREDENTIALS = {
  admin: { phone: '081234567890', password: 'admin123' },
  kitchen: { phone: '081234567891', password: 'kitchen123' },
  driver: { phone: '081234567892', password: 'driver123' },
};

// ==================== 2. PRODUCT & MENU ====================

/**
 * Get All Products for Menu Display
 * Reference: test-workflow-e2e.js - getProducts()
 */
export async function loadMenu() {
  try {
    const response = await productAPI.getProducts();
    // response.data = { products: [...] } or response.data = [...]
    
    return response.data.products || response.data;
  } catch (error) {
    console.error('Failed to load menu:', error);
    throw error;
  }
}

/**
 * Get Products with Pagination & Filters
 */
export async function loadProductsWithFilters(page = 1, limit = 20, filters = {}) {
  try {
    const response = await productAPI.getProducts({
      page,
      limit,
      ...filters, // category, min_price, max_price, search, etc.
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to load products:', error);
    throw error;
  }
}

// ==================== 3. ORDER WORKFLOW ====================

/**
 * CREATE ORDER - Customer Flow
 * Reference: test-workflow-e2e.js - Create dine-in/takeaway/delivery order
 * 
 * Order Types:
 * - 'dine-in': Requires table_number
 * - 'takeaway': No extra fields
 * - 'delivery': Requires delivery_address, delivery_latitude, delivery_longitude
 */
export async function createOrder(orderData) {
  try {
    // orderData structure:
    // {
    //   order_type: 'dine-in' | 'takeaway' | 'delivery',
    //   table_number?: string,        // Required for dine-in
    //   delivery_address?: string,    // Required for delivery
    //   delivery_latitude?: number,   // Optional for delivery
    //   delivery_longitude?: number,  // Optional for delivery
    //   items: [
    //     {
    //       product_id: string,
    //       quantity: number,
    //       notes?: string,
    //     }
    //   ],
    //   notes?: string,
    // }
    
    const response = await orderAPI.createOrder(orderData);
    // response.data = { order, message }
    
    return response.data;
  } catch (error) {
    console.error('Failed to create order:', error.response?.data || error);
    
    // Handle business rule: New customers can't order delivery
    if (error.response?.status === 403) {
      alert('Untuk pesanan delivery, silakan lakukan pesanan takeaway/dine-in terlebih dahulu.');
    }
    
    throw error;
  }
}

/**
 * Get Customer's Orders
 */
export async function getMyOrders(status = 'all') {
  try {
    const response = await orderAPI.getMyOrders({ status });
    return response.data.orders || response.data;
  } catch (error) {
    console.error('Failed to load orders:', error);
    throw error;
  }
}

/**
 * Cancel Order
 */
export async function cancelOrder(orderId, reason) {
  try {
    const response = await orderAPI.cancelOrder(orderId, reason);
    return response.data;
  } catch (error) {
    console.error('Failed to cancel order:', error);
    throw error;
  }
}

// ==================== 4. PAYMENT WORKFLOW ====================

/**
 * Create Payment for Order
 * Reference: test-workflow-e2e.js - Create payment
 * 
 * Payment Methods:
 * - 'bank_transfer': Requires bank_name, account_number, transaction_id
 * - 'qris': Requires transaction_id
 * - 'e_wallet': Requires e_wallet_type (GoPay, OVO, Dana, etc.)
 * - 'cod': Cash on Delivery (auto-verified)
 */
export async function createPayment(paymentData) {
  try {
    // paymentData structure:
    // {
    //   order_id: string,
    //   method: 'bank_transfer' | 'qris' | 'e_wallet' | 'cod',
    //   bank_name?: string,        // For bank_transfer
    //   account_number?: string,   // For bank_transfer
    //   e_wallet_type?: string,    // For e_wallet (GoPay, OVO, Dana)
    //   transaction_id?: string,   // For bank_transfer, qris, e_wallet
    // }
    
    const response = await paymentAPI.createPayment(paymentData);
    // response.data = { payment, message }
    
    return response.data;
  } catch (error) {
    console.error('Failed to create payment:', error);
    throw error;
  }
}

/**
 * Get Pending Payments (Admin Only)
 */
export async function getPendingPayments() {
  try {
    const response = await paymentAPI.getPendingPayments();
    // response.data = { payments: [...] }
    return response.data.payments || response.data;
  } catch (error) {
    console.error('Failed to load pending payments:', error);
    throw error;
  }
}

/**
 * Verify Payment (Admin Only)
 */
export async function verifyPayment(paymentId, status, rejectionReason = '') {
  try {
    const response = await paymentAPI.verifyPayment(paymentId, status, rejectionReason);
    // response.data = { payment, order }
    
    // Emit socket event for real-time update
    emitStaffStatusUpdate(paymentId, 'admin', 'admin');
    
    return response.data;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw error;
  }
}

// ==================== 5. ORDER STATUS MANAGEMENT (Kitchen/Admin) ====================

/**
 * Update Order Status
 * Reference: test-workflow-e2e.js - Kitchen updates status
 * 
 * Status Flow:
 * pending → paid → preparing → ready → completed
 * 
 * For Delivery:
 * pending → paid → preparing → ready → out_for_delivery → completed
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const validStatuses = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await orderAPI.updateOrderStatus(orderId, status);
    // response.data = { order, message }
    
    return response.data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
}

/**
 * Get Today's Queue (Kitchen/Admin Dashboard)
 */
export async function getTodayQueue() {
  try {
    const response = await orderAPI.getTodayQueue();
    return response.data.orders || response.data;
  } catch (error) {
    console.error('Failed to load queue:', error);
    throw error;
  }
}

// ==================== 6. REAL-TIME UPDATES (Socket.IO) ====================

/**
 * Setup Real-time Order Updates
 * Reference: test-socket-e2e.js - Order updates
 */
export function setupOrderUpdates(onOrderUpdate) {
  // Subscribe to order updates
  const unsubscribe = subscribeToOrderUpdates((data) => {
    console.log('📦 Order updated:', data);
    onOrderUpdate(data);
  });
  
  // Cleanup on unmount
  return unsubscribe;
}

/**
 * Setup Real-time Payment Updates
 */
export function setupPaymentUpdates(onPaymentUpdate) {
  const unsubscribe = subscribeToPaymentUpdates((data) => {
    console.log('💳 Payment verified:', data);
    onPaymentUpdate(data);
  });
  
  return unsubscribe;
}

/**
 * Setup Push Notifications
 */
export function setupNotifications(onNotification) {
  const unsubscribe = subscribeToNotifications((data) => {
    console.log('🔔 Notification received:', data);
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.body,
        icon: '/logo.png',
      });
    }
    
    onNotification(data);
  });
  
  return unsubscribe;
}

/**
 * Emit Page Change (for admin tracking)
 */
export function notifyPageChange(page) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.id) {
    emitPageChange(user.id, page);
  }
}

/**
 * Update Staff Status (Kitchen/Driver/Admin)
 */
export function updateStaffStatus(status, department) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.id) {
    emitStaffStatusUpdate(user.id, status, department);
  }
}

// ==================== 7. DASHBOARD & ANALYTICS ====================

/**
 * Get Dashboard Statistics (Admin)
 * Reference: test-workflow-e2e.js - Dashboard stats
 */
export async function getDashboardStats() {
  try {
    const response = await dashboardAPI.getStats();
    // response.data.stats = {
    //   orders: { total, today, pending, completed },
    //   revenue: { total, today, thisWeek, thisMonth },
    //   payments: { pending, verified },
    //   customers: { total, active },
    // }
    
    return response.data.stats;
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    throw error;
  }
}

/**
 * Get Staff Status (Admin)
 */
export async function getStaffStatus() {
  try {
    const response = await dashboardAPI.getStaffStatus();
    // response.data.staff = {
    //   admin: [{ id, name, status, department }],
    //   kitchen: [{ id, name, status, department }],
    //   driver: [{ id, name, status, department }],
    // }
    
    return response.data.staff;
  } catch (error) {
    console.error('Failed to load staff status:', error);
    throw error;
  }
}

// ==================== 8. REPORTS (Admin) ====================

/**
 * Generate Daily Sales Report (PDF)
 * Reference: backend/test-reports.js
 */
export async function generateDailyReport(date = new Date()) {
  try {
    const response = await api.get('/reports/daily', {
      params: { date: date.toISOString() },
      responseType: 'blob', // Important for PDF download
    });
    
    // Download PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-harian-${date.toISOString().split('T')[0]}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Failed to generate daily report:', error);
    throw error;
  }
}

/**
 * Generate Weekly Report
 */
export async function generateWeeklyReport(weekStart = new Date()) {
  try {
    const response = await api.get('/reports/weekly', {
      params: { weekStart: weekStart.toISOString() },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-mingguan-${weekStart.toISOString().split('T')[0]}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Failed to generate weekly report:', error);
    throw error;
  }
}

/**
 * Generate Monthly Report (Combined Sales + Staff)
 */
export async function generateMonthlyReport(month = new Date()) {
  try {
    const response = await api.get('/reports/monthly', {
      params: { month: month.toISOString() },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-bulanan-${month.toISOString().slice(0, 7)}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Failed to generate monthly report:', error);
    throw error;
  }
}

/**
 * Generate Staff Performance Report
 */
export async function generateStaffReport(period = 'weekly') {
  try {
    const response = await api.get('/reports/staff', {
      params: { period },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-staff-${period}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Failed to generate staff report:', error);
    throw error;
  }
}

/**
 * Get List of Generated Reports
 */
export async function getReportList() {
  try {
    const response = await api.get('/reports');
    return response.data.reports || [];
  } catch (error) {
    console.error('Failed to get report list:', error);
    throw error;
  }
}

// ==================== 9. COMPLETE WORKFLOW EXAMPLES ====================

/**
 * COMPLETE CUSTOMER FLOW
 * Reference: test-workflow-e2e.js - Dine-in Flow
 */
export async function completeCustomerFlow() {
  try {
    // 1. Login
    const auth = await customerLogin('Budi', '081111111111');
    console.log('✅ Logged in:', auth.user.name);
    
    // 2. Load menu
    const products = await loadMenu();
    console.log('✅ Menu loaded:', products.length, 'items');
    
    // 3. Create order
    const order = await createOrder({
      order_type: 'dine-in',
      table_number: '5',
      items: [
        { product_id: products[0].id, quantity: 2, notes: 'Tidak pedas' },
      ],
    });
    console.log('✅ Order created:', order.order.order_number);
    
    // 4. Create payment
    const payment = await createPayment({
      order_id: order.order.id,
      method: 'bank_transfer',
      bank_name: 'BCA',
      account_number: '1234567890',
      transaction_id: `TRX${Date.now()}`,
    });
    console.log('✅ Payment created:', payment.payment.id);
    
    // 5. Setup real-time updates
    setupOrderUpdates((data) => {
      console.log('🔄 Order status updated:', data.status);
    });
    
    return { auth, order, payment };
  } catch (error) {
    console.error('Customer flow failed:', error);
    throw error;
  }
}

/**
 * COMPLETE ADMIN FLOW
 * Reference: test-workflow-e2e.js - Admin verifies payment, updates status
 */
export async function completeAdminFlow() {
  try {
    // 1. Login as admin
    const auth = await staffLogin(TEST_CREDENTIALS.admin.phone, TEST_CREDENTIALS.admin.password);
    console.log('✅ Admin logged in:', auth.user.name);
    
    // 2. Get dashboard stats
    const stats = await getDashboardStats();
    console.log('📊 Dashboard stats:', stats);
    
    // 3. Get pending payments
    const pendingPayments = await getPendingPayments();
    console.log('⏳ Pending payments:', pendingPayments.length);
    
    // 4. Verify first pending payment
    if (pendingPayments.length > 0) {
      const verified = await verifyPayment(pendingPayments[0].id, 'verified');
      console.log('✅ Payment verified:', verified.payment.id);
    }
    
    // 5. Generate daily report
    await generateDailyReport();
    console.log('📄 Daily report generated');
    
    return { auth, stats };
  } catch (error) {
    console.error('Admin flow failed:', error);
    throw error;
  }
}

/**
 * COMPLETE KITCHEN FLOW
 */
export async function completeKitchenFlow() {
  try {
    // 1. Login as kitchen
    const auth = await staffLogin(TEST_CREDENTIALS.kitchen.phone, TEST_CREDENTIALS.kitchen.password);
    console.log('✅ Kitchen logged in:', auth.user.name);
    
    // 2. Get today's queue
    const queue = await getTodayQueue();
    console.log('📋 Today\'s queue:', queue.length, 'orders');
    
    // 3. Update order status: pending → preparing
    const pendingOrder = queue.find(o => o.status === 'pending');
    if (pendingOrder) {
      await updateOrderStatus(pendingOrder.id, 'preparing');
      console.log('👨‍🍳 Order now preparing:', pendingOrder.order_number);
    }
    
    // 4. Update order status: preparing → ready
    const preparingOrder = queue.find(o => o.status === 'preparing');
    if (preparingOrder) {
      await updateOrderStatus(preparingOrder.id, 'ready');
      console.log('✅ Order ready:', preparingOrder.order_number);
    }
    
    // 5. Update staff status to busy
    updateStaffStatus('busy', 'kitchen');
    console.log('👨‍🍳 Status updated to busy');
    
    return { auth, queue };
  } catch (error) {
    console.error('Kitchen flow failed:', error);
    throw error;
  }
}

// ==================== 10. REACT HOOK EXAMPLES ====================

/**
 * React Hook: Use Orders with Real-time Updates
 */
export function useOrders(initialStatus = 'all') {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    loadOrders();
    
    // Setup real-time updates
    const unsubscribe = setupOrderUpdates((data) => {
      setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, ...data } : o));
    });
    
    return () => unsubscribe();
  }, [initialStatus]);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders(initialStatus);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { orders, loading, error, refresh: loadOrders };
}

/**
 * React Hook: Use Dashboard Stats with Real-time Updates
 */
export function useDashboardStats() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    loadStats();
    
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { stats, loading };
}

// ==================== ERROR HANDLING ====================

/**
 * Standard Error Handler for API Calls
 */
export function handleApiError(error, defaultMessage = 'Terjadi kesalahan') {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Permintaan tidak valid';
      case 401:
        return 'Silakan login ulang';
      case 403:
        return 'Anda tidak memiliki akses';
      case 404:
        return 'Data tidak ditemukan';
      case 409:
        return 'Data sudah ada';
      case 500:
        return 'Kesalahan server';
      default:
        return data.error || defaultMessage;
    }
  } else if (error.request) {
    // Request made but no response
    return 'Tidak ada respon dari server. Periksa koneksi internet.';
  } else {
    // Other errors
    return error.message || defaultMessage;
  }
}

// Export all for easy import
export default {
  // Auth
  customerLogin,
  staffLogin,
  TEST_CREDENTIALS,
  
  // Products
  loadMenu,
  loadProductsWithFilters,
  
  // Orders
  createOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
  getTodayQueue,
  
  // Payments
  createPayment,
  getPendingPayments,
  verifyPayment,
  
  // Real-time
  setupOrderUpdates,
  setupPaymentUpdates,
  setupNotifications,
  notifyPageChange,
  updateStaffStatus,
  
  // Dashboard
  getDashboardStats,
  getStaffStatus,
  
  // Reports
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generateStaffReport,
  getReportList,
  
  // Complete flows
  completeCustomerFlow,
  completeAdminFlow,
  completeKitchenFlow,
  
  // Utilities
  handleApiError,
};
