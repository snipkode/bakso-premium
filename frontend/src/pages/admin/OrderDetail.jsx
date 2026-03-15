import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, ShoppingBag, MapPin, Truck,
  User, Phone, Mail, Package, CreditCard, Calendar, Hash, MessageSquare,
  TrendingUp, DollarSign, ChefHat
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import { subscribeToOrderUpdates } from '@/lib/socket';

// Status configuration
const STATUS_CONFIG = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'warning', gradient: 'from-orange-500 to-amber-500' },
  waiting_verification: { label: 'Menunggu Verifikasi', color: 'warning', gradient: 'from-orange-500 to-amber-500' },
  paid: { label: 'Dibayar', color: 'primary', gradient: 'from-blue-500 to-indigo-500' },
  preparing: { label: 'Sedang Disiapkan', color: 'primary', gradient: 'from-blue-500 to-indigo-500' },
  ready: { label: 'Siap Diantar', color: 'success', gradient: 'from-green-500 to-emerald-500' },
  out_for_delivery: { label: 'Sedang Diantar', color: 'success', gradient: 'from-green-500 to-teal-500' },
  completed: { label: 'Selesai', color: 'success', gradient: 'from-green-500 to-lime-500' },
  rejected: { label: 'Ditolak', color: 'error', gradient: 'from-red-500 to-pink-500' },
  cancelled: { label: 'Dibatalkan', color: 'error', gradient: 'from-red-500 to-rose-500' },
};

// Status transition rules based on order type
function getNextStatuses(status, orderType) {
  // Delivery orders have out_for_delivery step
  if (orderType === 'delivery') {
    const deliveryTransitions = {
      pending_payment: ['paid', 'cancelled'],
      waiting_verification: ['paid', 'cancelled'],
      paid: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_delivery', 'completed'],
      out_for_delivery: ['completed'],
      completed: [],
      cancelled: [],
      rejected: [],
    };
    return deliveryTransitions[status] || [];
  }
  
  // Takeaway orders have out_for_pickup step
  if (orderType === 'takeaway') {
    const takeawayTransitions = {
      pending_payment: ['paid', 'cancelled'],
      waiting_verification: ['paid', 'cancelled'],
      paid: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_pickup', 'completed'],
      out_for_pickup: ['completed'],
      completed: [],
      cancelled: [],
      rejected: [],
    };
    return takeawayTransitions[status] || [];
  }
  
  // Dine-in skips intermediate steps
  const dineInTransitions = {
    pending_payment: ['paid', 'cancelled'],
    waiting_verification: ['paid', 'cancelled'],
    paid: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
    completed: [],
    cancelled: [],
    rejected: [],
  };
  return dineInTransitions[status] || [];
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();

    // Real-time updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      if (data.order_id === id || data.orderId === id) {
        loadOrder();
      }
    });

    return () => unsubscribe();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await orderAPI.getOrderById(id);
      setOrder(data.order || data);
    } catch (error) {
      console.error('Failed to load order:', error);
      alert('Gagal load detail order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Ubah status ke ${getStatusLabel(newStatus)}?`)) return;

    try {
      setUpdating(true);
      await orderAPI.updateOrderStatus(id, newStatus);
      alert(`✅ Status diubah ke: ${getStatusLabel(newStatus)}`);
      loadOrder();
    } catch (error) {
      alert('Gagal update status: ' + (error.response?.data?.error || ''));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle className="w-10 h-10 text-red-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Tidak Ditemukan</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Order yang Anda cari tidak ada atau sudah dihapus.</p>
        <Button onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Orders
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
  const nextStatuses = getNextStatuses(order.status, order.order_type);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Hero Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/orders')}
              className="w-11 h-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Badge variant={statusConfig.color} className="text-xs px-3 py-1.5 font-semibold shadow-sm">
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Order Number & Date */}
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {order.order_number}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* Simplified Status Progress */}
          <div className="flex items-center justify-between">
            {['pending_payment', 'paid', 'preparing', 'ready', 'out_for_pickup', 'out_for_delivery', 'completed'].map((status, i, arr) => {
              const statusOrder = ['pending_payment', 'paid', 'preparing', 'ready', 'out_for_pickup', 'out_for_delivery', 'completed'];
              const currentIndex = statusOrder.indexOf(order.status);
              const thisIndex = statusOrder.indexOf(status);
              const isCompleted = thisIndex <= currentIndex;
              const isCurrent = thisIndex === currentIndex;
              
              // Show/hide steps based on order type
              const showPickup = order.order_type === 'takeaway';
              const showDelivery = order.order_type === 'delivery';
              
              let showStatus = true;
              if (status === 'out_for_pickup' && !showPickup) showStatus = false;
              if (status === 'out_for_delivery' && !showDelivery) showStatus = false;

              if (!showStatus) return <div key={status} className="flex-1" />;

              return (
                <div key={status} className="flex flex-col items-center flex-1 relative">
                  {i < arr.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                      thisIndex < currentIndex 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                  <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted
                      ? `bg-gradient-to-br ${STATUS_CONFIG[status].gradient} text-white shadow-sm`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-blue-500/30 scale-110' : ''}`}>
                    {isCompleted ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-1">
            {['Payment', 'Paid', 'Prep', 'Ready', 'Pickup', 'Deliver', 'Done'].map((label, i, arr) => {
              const status = ['pending_payment', 'paid', 'preparing', 'ready', 'out_for_pickup', 'out_for_delivery', 'completed'][i];
              const showPickup = order.order_type === 'takeaway';
              const showDelivery = order.order_type === 'delivery';
              
              let showStatus = true;
              if (status === 'out_for_pickup' && !showPickup) showStatus = false;
              if (status === 'out_for_delivery' && !showDelivery) showStatus = false;
              
              if (!showStatus) return <div key={label} className="flex-1" />;
              return (
                <span key={label} className="text-[10px] font-medium text-gray-500 dark:text-gray-400 flex-1 text-center">
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions - Priority */}
        {nextStatuses.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Update Status</span>
              </div>
              <span className="text-xs text-white/80">{nextStatuses.length} opsi</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm rounded-lg text-xs font-semibold transition-all"
                  >
                    {updating ? (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    {getStatusLabel(status)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Info - Inline Stats */}
        <div className="flex gap-2">
          {/* Order Type */}
          <div className="flex-1 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipe</span>
            </div>
            <Badge variant={order.order_type === 'delivery' ? 'primary' : 'secondary'} className="text-xs font-semibold">
              {order.order_type === 'dine-in' && '🍽️ Dine-in'}
              {order.order_type === 'takeaway' && '🛍️ Takeaway'}
              {order.order_type === 'delivery' && '🛵 Delivery'}
            </Badge>
          </div>

          {/* Queue Number */}
          {order.queue_number && (
            <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Antrian</span>
              </div>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">#{order.queue_number}</span>
            </div>
          )}

          {/* Table Number */}
          {order.order_type === 'dine-in' && order.table_number && (
            <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Meja</span>
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">#{order.table_number}</span>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        {order.order_type === 'delivery' && order.delivery_address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Alamat Delivery</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {order.delivery_address}
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Buka di Google Maps
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Order Items Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-green-500" />
              </div>
              Item Order
            </h3>
            <Badge variant="secondary" className="text-xs font-semibold">
              {order.items?.length || 0} item
            </Badge>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {order.items?.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-3 p-3 ${
                  index !== order.items.length - 1 
                    ? 'border-b border-gray-100 dark:border-gray-700' 
                    : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 shadow-sm">
                  {item.quantity}x
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                  {item.notes && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {item.notes}
                    </p>
                  )}
                </div>
                <p className="text-orange-600 dark:text-orange-400 font-bold text-sm whitespace-nowrap">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Summary - Clean List */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            Pembayaran
          </h3>

          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatRupiah(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600 dark:text-green-400">Diskon</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">-{formatRupiah(order.discount)}</span>
                </div>
              )}

              {order.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ongkir</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatRupiah(order.delivery_fee)}</span>
                </div>
              )}

              {order.loyalty_points_used > 0 && (
                <div className="flex justify-between">
                  <span className="text-orange-600 dark:text-orange-400">Poin Loyalty</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">-{order.loyalty_points_used} pts</span>
                </div>
              )}

              <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total Bayar</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>

              {order.payment_method && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Metode Pembayaran</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white capitalize">
                      {order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              )}

              {order.loyalty_points_earned > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-700 dark:text-orange-400">
                      Earned <strong className="font-semibold">{order.loyalty_points_earned} points</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {order.customer_name && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-500" />
              </div>
              Pelanggan
            </h3>

            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Nama Pelanggan</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {order.customer_phone && (
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">WhatsApp</p>
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 truncate">{order.customer_phone}</p>
                    </div>
                  </a>
                )}

                {order.user?.email && (
                  <a
                    href={`mailto:${order.user.email}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors flex-shrink-0">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Email</p>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 truncate">{order.user.email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Catatan</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{order.notes}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
