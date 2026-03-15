import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, ShoppingBag, MapPin, Truck,
  Phone, Mail, Calendar, Hash, User, Package, CreditCard, Star,
  ChefHat, Bike, Download, Share2, MoreVertical, MessageSquare,
  XCircle, CheckCircle2, Timer, Navigation, ChevronRight
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Button, Card, Badge } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDateTime, getStatusLabel, getStatusColor, cn } from '@/lib/utils';
import { getSocket, subscribeToOrderUpdates } from '@/lib/socket';
import { OrderDetailSkeleton } from '@/components/ui/Skeletons.jsx';
import { FadeIn, SlideUp } from '@/components/ui/Animations';

// Format payment method: 'bank_transfer' → 'Bank Transfer'
function formatPaymentMethod(method) {
  if (!method) return '';
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Check if order contains only beverages (drinks)
function isBeverageOnlyOrder(items) {
  if (!items || items.length === 0) return false;
  
  // Check if all items belong to beverage category
  // Common beverage category names/keywords
  const beverageKeywords = ['minum', 'drink', 'beverage', 'juice', 'jus', 'es', 'tea', 'teh', 'coffee', 'kopi', 'soda', 'water', 'air'];
  
  return items.every(item => {
    const categoryName = item.category?.name?.toLowerCase() || '';
    const productName = item.product_name?.toLowerCase() || '';
    
    // Check if category or product name contains beverage keywords
    const isBeverage = beverageKeywords.some(keyword => 
      categoryName.includes(keyword) || productName.includes(keyword)
    );
    
    return isBeverage;
  });
}

// Order status configuration with icons and colors
const STATUS_CONFIG = {
  pending_payment: {
    label: 'Menunggu Pembayaran',
    icon: '⏳',
    color: 'warning',
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    description: 'Silakan selesaikan pembayaran Anda',
  },
  waiting_verification: {
    label: 'Menunggu Verifikasi',
    icon: '📋',
    color: 'warning',
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    description: 'Pembayaran sedang diverifikasi',
  },
  paid: {
    label: 'Dibayar',
    icon: '💳',
    color: 'primary',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    description: 'Pesanan akan segera disiapkan',
  },
  preparing: {
    label: 'Sedang Disiapkan',
    icon: '👨‍🍳',
    color: 'primary',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    description: 'Dapur sedang menyiapkan pesanan',
  },
  ready: {
    label: 'Siap Diantar',
    icon: '✅',
    color: 'success',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    description: 'Menunggu driver untuk pengantaran',
  },
  delivering: {
    label: 'Sedang Diantar',
    icon: '🛵',
    color: 'success',
    gradient: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
    description: 'Pesanan dalam perjalanan',
  },
  completed: {
    label: 'Selesai',
    icon: '🎉',
    color: 'success',
    gradient: 'from-green-500 to-lime-500',
    bgGradient: 'from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20',
    description: 'Terima kasih telah memesan!',
  },
  rejected: {
    label: 'Ditolak',
    icon: '❌',
    color: 'error',
    gradient: 'from-red-500 to-pink-500',
    bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
    description: 'Pesanan ditolak oleh sistem',
  },
  cancelled: {
    label: 'Dibatalkan',
    icon: '🚫',
    color: 'error',
    gradient: 'from-red-500 to-rose-500',
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
    description: 'Pesanan telah dibatalkan',
  },
};

// Timeline steps configuration
const TIMELINE_STEPS = [
  { status: 'pending_payment', label: 'Dibuat', icon: FileText },
  { status: 'paid', label: 'Dibayar', icon: CreditCard },
  { status: 'preparing', label: 'Dimasak', icon: ChefHat },
  { status: 'ready', label: 'Siap', icon: CheckCircle2 },
  { status: 'completed', label: 'Selesai', icon: Star },
];

function FileText({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Check if order is beverage-only (no cooking required)
  const isBeverageOrder = order ? isBeverageOnlyOrder(order.items) : false;

  // Dynamic timeline steps based on order type
  const getTimelineSteps = () => {
    if (isBeverageOrder) {
      // For beverages: skip "cooking" step, use "prepared" instead
      return [
        { status: 'pending_payment', label: 'Dibuat', icon: FileText },
        { status: 'paid', label: 'Dibayar', icon: CreditCard },
        { status: 'preparing', label: 'Disiapkan', icon: ChefHat },
        { status: 'ready', label: 'Siap', icon: CheckCircle2 },
        { status: 'completed', label: 'Selesai', icon: Star },
      ];
    }
    // Default for food orders
    return [
      { status: 'pending_payment', label: 'Dibuat', icon: FileText },
      { status: 'paid', label: 'Dibayar', icon: CreditCard },
      { status: 'preparing', label: 'Dimasak', icon: ChefHat },
      { status: 'ready', label: 'Siap', icon: CheckCircle2 },
      { status: 'completed', label: 'Selesai', icon: Star },
    ];
  };

  useEffect(() => {
    loadOrder();

    // Check socket status
    const sock = getSocket();
    if (!sock) {
      console.log('⏳ Socket not initialized yet, order updates will be limited');
    } else if (!sock.connected) {
      console.log('⏳ Socket connecting, order updates will be enabled once connected');
    } else {
      console.log('🟢 Socket ready, enabling real-time order updates');
    }

    // Setup real-time updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      console.log('📨 Order update received:', data);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Mohon isi alasan pembatalan');
      return;
    }

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(id, cancelReason);
      alert('Pesanan berhasil dibatalkan');
      setShowCancelModal(false);
      setCancelReason('');
      loadOrder();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await orderAPI.updateOrderStatus(id, newStatus);
      alert(`Status berhasil diubah ke ${getStatusLabel(newStatus)}`);
      loadOrder();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal mengubah status');
    }
  };

  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';
  const isKitchen = user?.role === 'kitchen';
  const isDriver = user?.role === 'driver';

  const canCancel = order?.status === 'pending_payment' && isCustomer;
  const canUpdateStatus = isAdmin || isKitchen || isDriver;

  const statusConfig = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending_payment;

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Pesanan yang Anda cari tidak ada atau sudah dihapus.
          </p>
          <Button onClick={() => navigate('/orders')} className="w-full">
            Kembali ke Daftar Pesanan
          </Button>
        </Card>
      </div>
    );
  }

  const orderItems = order.items || [];
  const customerName = order.customer_name || order.user?.name;
  const customerPhone = order.customer_phone || order.user?.phone;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-background to-orange-50/20 pb-32">
      {/* Header - Modern Clean Design */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2.5} />
              </motion.button>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order Details</p>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{order.order_number}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
              >
                <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
              >
                <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Hero Card - Modern Gradient Design */}
        <FadeIn>
          <Card className={cn(
            "p-6 bg-gradient-to-br text-white border-0 shadow-xl overflow-hidden relative",
            "from-orange-500 via-orange-600 to-amber-500"
          )}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 text-6xl">{statusConfig.icon}</div>
              <div className="absolute bottom-10 left-10 text-5xl">🍜</div>
              <div className="absolute top-20 left-1/4 text-4xl">✨</div>
              <div className="absolute bottom-20 right-1/4 text-5xl">⭐</div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white text-xs font-semibold px-3 py-1">
                      {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                      {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                      {order.order_type === 'delivery' && '🛵 Delivery'}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Status Pesanan</p>
                  <h2 className="text-2xl font-bold tracking-tight">{statusConfig.label}</h2>
                </div>
                <div className="text-6xl drop-shadow-lg">{statusConfig.icon}</div>
              </div>

              <p className="text-white/90 text-sm font-medium mb-4">
                {isBeverageOrder && order.status === 'preparing' 
                  ? 'Pesanan minuman sedang disiapkan' 
                  : statusConfig.description}
              </p>

              <div className="flex items-center gap-4">
                {order.estimated_time && ['preparing', 'ready', 'delivering'].includes(order.status) && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl">
                    <Timer className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-semibold">{order.estimated_time} min</span>
                  </div>
                )}
                {order.queue_number && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl">
                    <Hash className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-semibold">{order.queue_number}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Progress Timeline - Enhanced Design */}
        <FadeIn delay={0.05}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span>Progress Pesanan</span>
                {isBeverageOrder && (
                  <Badge variant="secondary" className="ml-2 text-xs font-semibold">
                    🥤 Minuman
                  </Badge>
                )}
              </h3>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                {getTimelineSteps().map((step, index, arr) => {
                  const statusOrder = ['pending_payment', 'paid', 'preparing', 'ready', 'completed'];
                  const currentStatusIndex = statusOrder.indexOf(order.status);
                  const stepIndex = statusOrder.indexOf(step.status);
                  const isCompleted = stepIndex <= currentStatusIndex;
                  const isCurrent = stepIndex === currentStatusIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1 relative">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                          isCompleted
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/30"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
                          isCurrent && "ring-4 ring-orange-500/20 scale-110 shadow-xl"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                          <StepIcon className="w-5 h-5" strokeWidth={2} />
                        )}
                      </motion.div>

                      <p className={cn(
                        "text-[10px] mt-2 text-center font-bold uppercase tracking-wide",
                        isCompleted ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"
                      )}>
                        {step.label}
                      </p>

                      {index < arr.length - 1 && (
                        <div
                          className="absolute top-[22px] left-1/2 h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full"
                          style={{
                            width: `calc(100% - 44px)`,
                            transform: 'translateX(50%)',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Track Order Button - Enhanced */}
        {['paid', 'preparing', 'ready', 'delivering'].includes(order.status) && (
          <FadeIn delay={0.1}>
            <Card
              onClick={() => navigate(`/track/${order.id}`)}
              className="p-5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white cursor-pointer hover:shadow-2xl hover:shadow-orange-500/30 transition-all transform hover:scale-[1.02] border-0 overflow-hidden relative"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse">🛵</div>
                <div className="absolute top-1/2 right-1/4 text-3xl animate-pulse" style={{animationDelay: '0.5s'}}>📍</div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Navigation className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight">Lacak Pesanan</h3>
                    <p className="text-sm text-white/90 font-medium">Pantau progress secara real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-white/80" strokeWidth={2} />
                  <ChevronRight className="w-6 h-6 text-white/80" strokeWidth={2} />
                </div>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Order Information - Modern Design */}
        <FadeIn delay={0.15}>
          <Card className="p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span>Informasi Pesanan</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tanggal</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Jenis Pesanan</span>
                </div>
                <Badge
                  variant={order.order_type === 'delivery' ? 'primary' : 'secondary'}
                  className="font-bold px-3 py-1.5 text-xs"
                >
                  {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                  {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                  {order.order_type === 'delivery' && '🛵 Delivery'}
                </Badge>
              </div>

              {order.order_type === 'dine-in' && order.table_number && (
                <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nomor Meja</span>
                  </div>
                  <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                    #{order.table_number}
                  </span>
                </div>
              )}

              {order.order_type === 'delivery' && order.delivery_address && (
                <div className="py-3">
                  <div className="flex items-center gap-3 mb-3 px-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Alamat Pengiriman</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/70 p-4 rounded-xl mx-4 border border-gray-100 dark:border-gray-700">
                    {order.delivery_address}
                  </p>
                </div>
              )}

              {order.queue_number && (
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Timer className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nomor Antrian</span>
                  </div>
                  <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                    {order.queue_number}
                  </span>
                </div>
              )}

              {order.notes && (
                <div className="py-3">
                  <div className="flex items-center gap-3 mb-3 px-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Catatan</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/70 p-4 rounded-xl mx-4 border border-gray-100 dark:border-gray-700 italic">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>
          </Card>
        </FadeIn>

        {/* Order Items - Enhanced Design */}
        <FadeIn delay={0.2}>
          <Card className="p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span>Item Pesanan</span>
              <Badge variant="secondary" className="ml-auto font-bold px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800">
                {orderItems.length} item
              </Badge>
            </h3>

            <div className="space-y-3">
              {orderItems.map((item, index) => {
                // Safely parse customizations (could be JSON string, array, or object)
                let customizations = [];
                if (item.customizations) {
                  try {
                    if (typeof item.customizations === 'string') {
                      const parsed = JSON.parse(item.customizations);
                      customizations = Array.isArray(parsed) ? parsed : [parsed];
                    } else if (Array.isArray(item.customizations)) {
                      customizations = item.customizations;
                    } else if (typeof item.customizations === 'object') {
                      customizations = Object.values(item.customizations);
                    }
                  } catch (e) {
                    customizations = [];
                  }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-orange-200 dark:hover:border-orange-900/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-orange-500/30">
                      <span className="text-xs">{item.quantity}x</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-base tracking-tight truncate">{item.product_name}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                          <span className="inline-block">📝</span> {item.notes}
                        </p>
                      )}
                      {customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {customizations.map((custom, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-gray-700">
                              {custom}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-orange-600 dark:text-orange-400 font-extrabold text-base whitespace-nowrap">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </FadeIn>

        {/* Payment Summary - Enhanced Design */}
        <FadeIn delay={0.25}>
          <Card className="p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CreditCard className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span>Ringkasan Pembayaran</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatRupiah(order.subtotal)}
                </span>
              </div>

              {order.voucher_code && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Voucher</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {order.voucher_code}
                  </span>
                </div>
              )}

              {order.discount > 0 && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Diskon</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    -{formatRupiah(order.discount)}
                  </span>
                </div>
              )}

              {order.delivery_fee > 0 && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ongkir</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatRupiah(order.delivery_fee)}
                  </span>
                </div>
              )}

              {order.loyalty_points_used > 0 && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30">
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Poin Loyalty</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    -{order.loyalty_points_used} pts
                  </span>
                </div>
              )}

              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">Total Bayar</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {order.payment_method && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Metode Pembayaran</span>
                  </div>
                  <span className="text-base font-bold text-gray-900 dark:text-white tracking-wide">
                    {formatPaymentMethod(order.payment_method)}
                  </span>
                </div>
              </div>
            )}

            {order.loyalty_points_earned > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-orange-700 dark:text-orange-400">
                    Anda mendapat <strong className="font-bold">{order.loyalty_points_earned} poin</strong> dari pesanan ini
                  </span>
                </div>
              </div>
            )}
          </Card>
        </FadeIn>

        {/* Customer Info (Staff view) - Enhanced */}
        {!isCustomer && customerName && (
          <FadeIn delay={0.3}>
            <Card className="p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span>Informasi Pelanggan</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nama Pelanggan</p>
                      <p className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">{customerName}</p>
                    </div>
                  </div>
                </div>

                {customerPhone && (
                  <a
                    href={`tel:${customerPhone}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                        <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" strokeWidth={2} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Telepon</span>
                    </div>
                    <span className="text-base font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                      {customerPhone}
                      <ChevronRight className="w-4 h-4 ml-1 inline" strokeWidth={2.5} />
                    </span>
                  </a>
                )}

                {order.user?.email && (
                  <a
                    href={`mailto:${order.user.email}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" strokeWidth={2} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</span>
                    </div>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 truncate max-w-[200px]">
                      {order.user.email}
                      <ChevronRight className="w-4 h-4 ml-1 inline" strokeWidth={2.5} />
                    </span>
                  </a>
                )}
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Staff Action Buttons - Enhanced */}
        {canUpdateStatus && (
          <FadeIn delay={0.35}>
            <Card className="p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Timer className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span>Update Status</span>
              </h3>

              <div className="flex flex-wrap gap-3">
                {order.status === 'pending_payment' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpdateStatus('paid')}
                    className="flex-1 min-w-[140px] py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                    Terverifikasi
                  </motion.button>
                )}

                {order.status === 'paid' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpdateStatus('preparing')}
                    className="flex-1 min-w-[140px] py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" strokeWidth={2.5} />
                    Mulai Masak
                  </motion.button>
                )}

                {order.status === 'preparing' && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus('ready')}
                      className="flex-1 min-w-[120px] py-3.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                      Siap
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus('delivering')}
                      className="flex-1 min-w-[120px] py-3.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Bike className="w-5 h-5" strokeWidth={2.5} />
                      Antar
                    </motion.button>
                  </>
                )}

                {order.status === 'ready' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpdateStatus('delivering')}
                    className="flex-1 min-w-[140px] py-3.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Bike className="w-5 h-5" strokeWidth={2.5} />
                    Kirim Driver
                  </motion.button>
                )}

                {order.status === 'delivering' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpdateStatus('completed')}
                    className="flex-1 min-w-[140px] py-3.5 px-4 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" strokeWidth={2.5} />
                    Selesai
                  </motion.button>
                )}
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <FadeIn delay={0.4}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCancelModal(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-3"
            >
              <XCircle className="w-6 h-6" strokeWidth={2.5} />
              Batalkan Pesanan
            </motion.button>
          </FadeIn>
        )}

        {/* Completed Card - Enhanced */}
        {order.status === 'completed' && (
          <FadeIn delay={0.4}>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-900/30 overflow-hidden relative">
              {/* Confetti Background */}
              <div className="absolute inset-0 opacity-10 overflow-hidden">
                <div className="absolute top-10 left-10 text-2xl animate-bounce">🎉</div>
                <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</div>
                <div className="absolute bottom-10 left-1/3 text-2xl animate-bounce" style={{animationDelay: '0.4s'}}>🎊</div>
              </div>

              <div className="relative z-10 flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/40 flex-shrink-0"
                >
                  <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-1">
                    Pesanan Selesai!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                    Terima kasih telah memesan di Bakso Premium. Kami harap Anda menikmati hidangan Anda!
                  </p>
                  {order.completed_at && (
                    <p className="text-xs text-green-500 dark:text-green-600 mt-3 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Selesai pada {formatDateTime(order.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </FadeIn>
        )}
      </div>

      {/* Cancel Modal - Enhanced */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0"
                >
                  <AlertCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Batalkan Pesanan?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{order.order_number}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini <strong className="text-red-600 dark:text-red-400">tidak dapat dibatalkan</strong>.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Alasan Pembatalan
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Jelaskan alasan pembatalan..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
                >
                  Kembali
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 disabled:shadow-none transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" strokeWidth={2.5} />
                      Ya, Batalkan
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
