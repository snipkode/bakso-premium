/**
 * EXAMPLE REACT COMPONENTS
 * Bakso Premium Ordering System
 * 
 * These components demonstrate how to use the integration functions
 * in actual React pages/components.
 */

import React, { useState, useEffect } from 'react';
import {
  // Auth
  customerLogin,
  staffLogin,
  TEST_CREDENTIALS,
  
  // Orders
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getTodayQueue,
  
  // Payments
  createPayment,
  getPendingPayments,
  verifyPayment,
  
  // Products
  loadMenu,
  
  // Dashboard
  getDashboardStats,
  getStaffStatus,
  
  // Reports
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generateStaffReport,
  
  // Real-time
  setupOrderUpdates,
  setupPaymentUpdates,
  setupNotifications,
  notifyPageChange,
  updateStaffStatus,
  
  // Utilities
  handleApiError,
} from './lib/integration-examples';

// ==================== CUSTOMER COMPONENTS ====================

/**
 * Customer Login Component
 * Usage: <CustomerLogin onLogin={handleLogin} />
 */
export function CustomerLogin({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await customerLogin(name, phone);
      onLogin(result);
    } catch (err) {
      setError(handleApiError(err, 'Gagal login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold mb-4">Login Pelanggan</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nama</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Masukkan nama Anda"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="081234567890"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Memproses...' : 'Login'}
      </button>
    </form>
  );
}

/**
 * Customer Order Form Component
 * Usage: <CustomerOrderForm products={products} onSubmit={handleOrder} />
 */
export function CustomerOrderForm({ products, onSubmit }) {
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = (product) => {
    setItems(prev => [
      ...prev,
      { product_id: product.id, quantity: 1, notes: '', product_name: product.name }
    ]);
  };

  const updateQuantity = (index, quantity) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        order_type: orderType,
        table_number: orderType === 'dine-in' ? tableNumber : undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        items,
        notes,
      };

      const result = await createOrder(orderData);
      onSubmit(result);
    } catch (err) {
      alert(handleApiError(err, 'Gagal membuat pesanan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold mb-4">Buat Pesanan</h2>

      {/* Order Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Jenis Pesanan</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="dine-in">🍽️ Dine-in (Makan di Tempat)</option>
          <option value="takeaway">🛍️ Takeaway (Dibawa Pulang)</option>
          <option value="delivery">🛵 Delivery (Diantar)</option>
        </select>
      </div>

      {/* Conditional Fields */}
      {orderType === 'dine-in' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nomor Meja</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Contoh: 5"
            required
          />
        </div>
      )}

      {orderType === 'delivery' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Alamat Pengiriman</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Alamat lengkap pengiriman"
            required
          />
        </div>
      )}

      {/* Items */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pilih Produk</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {products.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => addItem(product)}
              className="bg-gray-100 p-2 rounded hover:bg-gray-200 text-left"
            >
              {product.name}
              <br />
              <span className="text-sm text-gray-600">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items */}
      {items.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Item Dipilih</label>
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
              <span className="flex-1">{item.product_name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                className="w-16 border rounded p-1 text-center"
                min="1"
              />
              <span className="text-sm text-gray-600">
                x Rp {products.find(p => p.id === item.product_id)?.price.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Catatan untuk pesanan (opsional)"
        />
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Memproses...' : `Pesan (${items.length} item)`}
      </button>
    </form>
  );
}

/**
 * Payment Form Component
 * Usage: <PaymentForm orderId={orderId} onSuccess={handlePaymentSuccess} />
 */
export function PaymentForm({ orderId, onSuccess }) {
  const [method, setMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [eWalletType, setEWalletType] = useState('GoPay');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData = {
        order_id: orderId,
        method,
        bank_name: method === 'bank_transfer' ? bankName : undefined,
        account_number: method === 'bank_transfer' ? accountNumber : undefined,
        e_wallet_type: method === 'e_wallet' ? eWalletType : undefined,
        transaction_id: `TRX${Date.now()}`,
      };

      const result = await createPayment(paymentData);
      onSuccess(result);
    } catch (err) {
      alert(handleApiError(err, 'Gagal membuat pembayaran'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold mb-4">Pembayaran</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="bank_transfer">Transfer Bank</option>
          <option value="qris">QRIS</option>
          <option value="e_wallet">E-Wallet</option>
          <option value="cod">Bayar di Tempat (COD)</option>
        </select>
      </div>

      {method === 'bank_transfer' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nama Bank</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Contoh: BCA"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nomor Rekening</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Contoh: 1234567890"
              required
            />
          </div>
        </>
      )}

      {method === 'e_wallet' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">E-Wallet</label>
          <select
            value={eWalletType}
            onChange={(e) => setEWalletType(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="GoPay">GoPay</option>
            <option value="OVO">OVO</option>
            <option value="Dana">Dana</option>
            <option value="ShopeePay">ShopeePay</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Memproses...' : 'Bayar Sekarang'}
      </button>
    </form>
  );
}

// ==================== STAFF COMPONENTS ====================

/**
 * Staff Login Component
 * Usage: <StaffLogin onLogin={handleLogin} />
 */
export function StaffLogin({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await staffLogin(phone, password);
      onLogin(result);
    } catch (err) {
      setError(handleApiError(err, 'Gagal login'));
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (role) => {
    const creds = TEST_CREDENTIALS[role];
    setPhone(creds.phone);
    setPassword(creds.password);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold mb-4">Login Staff</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Test Credentials Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => fillTestCredentials('admin')}
          className="text-xs bg-gray-200 px-2 py-1 rounded"
        >
          Test Admin
        </button>
        <button
          type="button"
          onClick={() => fillTestCredentials('kitchen')}
          className="text-xs bg-gray-200 px-2 py-1 rounded"
        >
          Test Kitchen
        </button>
        <button
          type="button"
          onClick={() => fillTestCredentials('driver')}
          className="text-xs bg-gray-200 px-2 py-1 rounded"
        >
          Test Driver
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="081234567890"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Memproses...' : 'Login'}
      </button>
    </form>
  );
}

/**
 * Admin Dashboard Component
 * Usage: <AdminDashboard />
 */
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    
    // Setup real-time updates
    const unsubscribeOrder = setupOrderUpdates(() => loadDashboard());
    const unsubscribePayment = setupPaymentUpdates(() => loadDashboard());
    const unsubscribeNotification = setupNotifications((data) => {
      alert(`🔔 ${data.title}: ${data.body}`);
    });

    // Notify page change
    notifyPageChange('/admin/dashboard');

    return () => {
      unsubscribeOrder();
      unsubscribePayment();
      unsubscribeNotification();
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, payments] = await Promise.all([
        getDashboardStats(),
        getPendingPayments(),
      ]);
      setStats(statsData);
      setPendingPayments(payments);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!confirm('Verifikasi pembayaran ini?')) return;

    try {
      await verifyPayment(paymentId, 'verified');
      alert('✅ Pembayaran diverifikasi');
      loadDashboard();
    } catch (err) {
      alert(handleApiError(err, 'Gagal verifikasi'));
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      setLoading(true);
      switch (type) {
        case 'daily':
          await generateDailyReport();
          break;
        case 'weekly':
          await generateWeeklyReport();
          break;
        case 'monthly':
          await generateMonthlyReport();
          break;
        case 'staff':
          await generateStaffReport('weekly');
          break;
      }
      alert('✅ Laporan berhasil diunduh');
    } catch (err) {
      alert(handleApiError(err, 'Gagal generate laporan'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-sm text-gray-600">Total Pesanan</div>
          <div className="text-2xl font-bold">{stats?.orders?.total || 0}</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-sm text-gray-600">Pendapatan Hari Ini</div>
          <div className="text-2xl font-bold">
            Rp {stats?.revenue?.today?.toLocaleString('id-ID') || 0}
          </div>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <div className="text-sm text-gray-600">Pembayaran Pending</div>
          <div className="text-2xl font-bold">{pendingPayments.length}</div>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <div className="text-sm text-gray-600">Total Pelanggan</div>
          <div className="text-2xl font-bold">{stats?.customers?.total || 0}</div>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Pembayaran Pending</h2>
        {pendingPayments.length === 0 ? (
          <div className="text-gray-500">Tidak ada pembayaran pending</div>
        ) : (
          <div className="space-y-2">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="bg-white border p-4 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold">Order: {payment.order?.order_number}</div>
                  <div className="text-sm text-gray-600">
                    {payment.method} - Rp {payment.amount.toLocaleString('id-ID')}
                  </div>
                </div>
                <button
                  onClick={() => handleVerifyPayment(payment.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Verifikasi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Generation */}
      <div>
        <h2 className="text-lg font-bold mb-2">Generate Laporan</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateReport('daily')}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            📊 Harian
          </button>
          <button
            onClick={() => handleGenerateReport('weekly')}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            📈 Mingguan
          </button>
          <button
            onClick={() => handleGenerateReport('monthly')}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            📅 Bulanan
          </button>
          <button
            onClick={() => handleGenerateReport('staff')}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            👥 Staff
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Kitchen Dashboard Component
 * Usage: <KitchenDashboard />
 */
export function KitchenDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
    
    // Setup real-time updates
    const unsubscribe = setupOrderUpdates(() => loadQueue());
    
    // Notify page change and status
    notifyPageChange('/kitchen');
    updateStaffStatus('online', 'kitchen');

    return () => unsubscribe();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await getTodayQueue();
      setQueue(data);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`✅ Status diubah ke: ${newStatus}`);
      loadQueue();
    } catch (err) {
      alert(handleApiError(err, 'Gagal update status'));
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Dapur</h1>

      {/* Queue by Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Orders */}
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-bold mb-2 text-yellow-800">⏳ Pending</h2>
          {queue.filter(o => o.status === 'pending').map(order => (
            <div key={order.id} className="bg-white p-3 rounded mb-2 shadow">
              <div className="font-bold">{order.order_number}</div>
              <div className="text-sm">{order.order_type}</div>
              <div className="text-sm">{order.items?.length || 0} item</div>
              <button
                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                className="mt-2 w-full bg-yellow-600 text-white py-1 rounded hover:bg-yellow-700"
              >
                👨‍🍳 Mulai Masak
              </button>
            </div>
          ))}
        </div>

        {/* Preparing Orders */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-bold mb-2 text-blue-800">👨‍🍳 Sedang Dimasak</h2>
          {queue.filter(o => o.status === 'preparing').map(order => (
            <div key={order.id} className="bg-white p-3 rounded mb-2 shadow">
              <div className="font-bold">{order.order_number}</div>
              <div className="text-sm">{order.order_type}</div>
              <button
                onClick={() => handleUpdateStatus(order.id, 'ready')}
                className="mt-2 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
              >
                ✅ Selesai
              </button>
            </div>
          ))}
        </div>

        {/* Ready Orders */}
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-bold mb-2 text-green-800">✅ Siap Saji</h2>
          {queue.filter(o => o.status === 'ready').map(order => (
            <div key={order.id} className="bg-white p-3 rounded mb-2 shadow">
              <div className="font-bold">{order.order_number}</div>
              <div className="text-sm">{order.order_type}</div>
              {order.queue_number && (
                <div className="text-lg font-bold text-green-600">
                  Antrian #{order.queue_number}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== EXPORT DEFAULT ====================

export default {
  CustomerLogin,
  CustomerOrderForm,
  PaymentForm,
  StaffLogin,
  AdminDashboard,
  KitchenDashboard,
};
