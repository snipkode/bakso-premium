import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, ShoppingBag, MapPin, Truck,
  User, Phone, Mail, Package, CreditCard, Calendar, Hash, MessageSquare,
  TrendingUp, DollarSign, ChefHat, Scooter
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import { subscribeToOrderUpdates } from '@/lib/socket';

// Status configuration
const STATUS_CONFIG = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'warning', gradient: 'from-orange-500 to-amber-500' },
  waiting_verification: { label: 'Menunggu Verifikasi', color: 'warning', gradient: 'from-orange-500 to-amber-500' },
  paid: { label: 'Dibayar', color: 'primary', gradient: 'from-blue-500 to-cyan-500' },
  preparing: { label: 'Sedang Disiapkan', color: 'primary', gradient: 'from-blue-500 to-indigo-500' },
  ready: { label: 'Siap Diantar', color: 'success', gradient: 'from-green-500 to-emerald-500' },
  delivering: { label: 'Sedang Diantar', color: 'success', gradient: 'from-green-500 to-teal-500' },
  completed: { label: 'Selesai', color: 'success', gradient: 'from-green-500 to-lime-500' },
  rejected: { label: 'Ditolak', color: 'error', gradient: 'from-red-500 to-pink-500' },
  cancelled: { label: 'Dibatalkan', color: 'error', gradient: 'from-red-500 to-rose-500' },
};

// Status transition rules
const STATUS_TRANSITIONS = {
  pending_payment: ['paid', 'cancelled'],
  waiting_verification: ['paid', 'cancelled'],
  paid: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'completed'],
  delivering: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
};

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
  const nextStatuses = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-32">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/orders')}
              className="w-11 h-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Badge variant={statusConfig.color} className="text-sm px-4 py-2 font-semibold">
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="mb-3">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
              {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* Status Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {['pending_payment', 'paid', 'preparing', 'ready', 'completed'].map((status, index, arr) => {
                const statusOrder = ['pending_payment', 'paid', 'preparing', 'ready', 'completed'];
                const currentIndex = statusOrder.indexOf(order.status);
                const thisIndex = statusOrder.indexOf(status);
                const isCompleted = thisIndex <= currentIndex;
                const isCurrent = thisIndex === currentIndex;

                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? `bg-gradient-to-br ${STATUS_CONFIG[status].gradient} text-white shadow-lg`
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-blue-500/30 scale-110' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-current" />}
                    </div>
                    <p className={`text-xs mt-1 font-semibold ${
                      isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {STATUS_CONFIG[status].label.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Update Actions */}
        {nextStatuses.length > 0 && (
          <Card className="p-5 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Update Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pilih status berikutnya</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <Button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating}
                    className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg text-white font-semibold`}
                  >
                    {updating ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {getStatusLabel(status)}
                  </Button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Order Info */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Informasi Order</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Jenis Order</span>
              </div>
              <Badge variant={order.order_type === 'delivery' ? 'primary' : 'secondary'} className="font-bold">
                {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                {order.order_type === 'delivery' && '🛵 Delivery'}
              </Badge>
            </div>

            {order.order_type === 'dine-in' && order.table_number && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nomor Meja</span>
                </div>
                <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">#{order.table_number}</span>
              </div>
            )}

            {order.order_type === 'delivery' && order.delivery_address && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Alamat Delivery</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white ml-8">
                  {order.delivery_address}
                </p>
              </div>
            )}

            {order.queue_number && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nomor Antrian</span>
                </div>
                <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">#{order.queue_number}</span>
              </div>
            )}

            {order.notes && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Catatan</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white ml-8 italic">
                  "{order.notes}"
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Item Order</h3>
            <Badge variant="secondary" className="ml-auto font-bold">
              {order.items?.length || 0} item
            </Badge>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-lg">
                  {item.quantity}x
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {item.notes}
                    </p>
                  )}
                </div>
                <p className="text-orange-600 dark:text-orange-400 font-extrabold text-base whitespace-nowrap">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Pembayaran</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Diskon</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">-{formatRupiah(order.discount)}</span>
              </div>
            )}

            {order.delivery_fee > 0 && (
              <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ongkir</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(order.delivery_fee)}</span>
              </div>
            )}

            {order.loyalty_points_used > 0 && (
              <div className="flex justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Poin Loyalty</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">-{order.loyalty_points_used} pts</span>
              </div>
            )}

            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-gray-900 dark:text-white">Total Bayar</span>
                <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </div>

            {order.payment_method && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Metode Pembayaran</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{order.payment_method}</span>
                </div>
              </div>
            )}

            {order.loyalty_points_earned > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-orange-700 dark:text-orange-400">
                    Earned <strong className="font-bold">{order.loyalty_points_earned} points</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Info */}
        {order.customer_name && (
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Pelanggan</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nama</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
                </div>
              </div>

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                    <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Telepon</p>
                    <p className="text-sm font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">{order.customer_phone}</p>
                  </div>
                </a>
              )}

              {order.user?.email && (
                <a
                  href={`mailto:${order.user.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                    <p className="text-sm font-extrabold text-orange-600 dark:text-orange-400 truncate">{order.user.email}</p>
                  </div>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Additional Info */}
        {(order.estimated_time || order.completed_at || order.cancelled_at) && (
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Timeline</h3>
            </div>

            <div className="space-y-3">
              {order.estimated_time && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Estimasi Waktu</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{order.estimated_time} menit</span>
                </div>
              )}

              {order.completed_at && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Selesai Pada</span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatDateTime(order.completed_at)}</span>
                </div>
              )}

              {order.cancelled_at && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dibatalkan Pada</span>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatDateTime(order.cancelled_at)}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
