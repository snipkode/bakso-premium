import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  customerAuth: (name, phone) => api.post('/auth/customer', { name, phone }),
  staffLogin: (phone, password) => api.post('/auth/staff', { phone, password }),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  getUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Product API
export const productAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  toggleAvailability: (id) => api.patch(`/products/${id}/availability`),
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getQueueInfo: (id) => api.get(`/orders/${id}/queue`),
  cancelOrder: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getTodayQueueStats: () => api.get('/orders/queue/today'),
};

// Payment API
export const paymentAPI = {
  createPayment: (formData) => {
    return api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPaymentByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  getPendingPayments: () => api.get('/payments/pending'),
  getAllPayments: (params) => api.get('/payments', { params }),
  verifyPayment: (id, status, rejectionReason) => 
    api.patch(`/payments/${id}/verify`, { status, rejection_reason: rejectionReason }),
  deletePaymentProof: (id) => api.delete(`/payments/${id}/proof`),
};

// Voucher API
export const voucherAPI = {
  getVouchers: () => api.get('/vouchers'),
  validateVoucher: (code, subtotal) => api.get('/vouchers/validate', { params: { code, subtotal } }),
  createVoucher: (data) => api.post('/vouchers', data),
  updateVoucher: (id, data) => api.put(`/vouchers/${id}`, data),
  deleteVoucher: (id) => api.delete(`/vouchers/${id}`),
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getProductReviews: (params) => api.get('/reviews/products', { params }),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  getAllReviews: (params) => api.get('/reviews', { params }),
  updateReviewVisibility: (id, isVisible) => api.patch(`/reviews/${id}/visibility`, { is_visible: isVisible }),
  replyToReview: (id, reply) => api.patch(`/reviews/${id}/reply`, { admin_reply: reply }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Loyalty API
export const loyaltyAPI = {
  getLoyaltyPoints: () => api.get('/loyalty'),
  getAllLoyaltyPoints: (params) => api.get('/loyalty/all', { params }),
  addLoyaltyPoints: (userId, points, description) => api.post('/loyalty/add', { user_id: userId, points, description }),
  deductLoyaltyPoints: (userId, points, description) => api.post('/loyalty/deduct', { user_id: userId, points, description }),
};

// Push API
export const pushAPI = {
  getVapidPublicKey: () => api.get('/push/vapid-key'),
  subscribe: (data) => api.post('/push/subscribe', data),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
  getUserSubscriptions: () => api.get('/push/subscriptions'),
  sendToUser: (userId, title, body, url) => api.post('/push/send/user', { user_id: userId, title, body, url }),
  sendToAll: (title, body, url) => api.post('/push/send/all', { title, body, url }),
  getAllSubscriptions: (params) => api.get('/push/all', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: (period) => api.get('/dashboard/analytics', { params: { period } }),
  getUserActivity: () => api.get('/dashboard/activity'),
  getStaffStatus: () => api.get('/dashboard/staff'),
  updateStaffStatus: (status) => api.put('/dashboard/staff-status', { status }),
};

// Queue API
export const queueAPI = {
  getTodayQueue: () => api.get('/queue/today'),
  getQueueByDate: (date) => api.get(`/queue/date/${date}`),
  getQueueHistory: (params) => api.get('/queue/history', { params }),
  getOrdersByDate: (date) => api.get(`/queue/orders/${date}`),
  resetQueue: (date) => api.post('/queue/reset', { date }),
  updateQueueSettings: (id, data) => api.put(`/queue/${id}`, data),
  adjustQueue: (currentQueue, totalOrders) => api.patch('/queue/adjust', { current_queue: currentQueue, total_orders: totalOrders }),
};

export default api;
