import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, ShoppingBag, MapPin, Package,
  CreditCard, MessageSquare, Phone, ChefHat, Star, User
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import { subscribeToOrderUpdates } from '@/lib/socket';

// Status configuration with context-aware labels per order type
const STATUS_CONFIG = {
  pending_payment: { 
    label: 'Menunggu Pembayaran', 
    labelTakeaway: 'Menunggu Pembayaran',
    labelDineIn: 'Menunggu Pembayaran',
    labelDelivery: 'Menunggu Pembayaran',
    color: 'warning', 
    gradient: 'from-orange-500 to-amber-500', 
    icon: '⏳',
    description: 'Silakan selesaikan pembayaran Anda',
    thankYou: '',
  },
  paid: { 
    label: 'Pesanan Diterima!', 
    labelTakeaway: 'Pesanan Diterima!',
    labelDineIn: 'Pesanan Diterima!',
    labelDelivery: 'Pesanan Diterima!',
    color: 'primary', 
    gradient: 'from-blue-500 to-indigo-500', 
    icon: '🎉',
    description: 'Terima kasih! Pesanan akan segera disiapkan',
    thankYou: 'Terima kasih atas pesanan Anda!',
  },
  preparing: { 
    label: 'Sedang Disiapkan', 
    labelTakeaway: 'Sedang Diracik',
    labelDineIn: 'Sedang Dimasak',
    labelDelivery: 'Sedang Dimasak',
    color: 'primary', 
    gradient: 'from-blue-500 to-indigo-500', 
    icon: '👨‍🍳',
    description: 'Dapur sedang menyiapkan pesanan',
    thankYou: 'Terima kasih sudah menunggu!',
  },
  ready: { 
    label: 'Siap', 
    labelTakeaway: 'Siap Diambil',
    labelDineIn: 'Siap Disajikan',
    labelDelivery: 'Siap Diantar',
    color: 'success', 
    gradient: 'from-green-500 to-emerald-500', 
    icon: '✅',
    description: 'Pesanan siap untuk Anda',
    thankYou: 'Pesanan siap! Terima kasih!',
  },
  out_for_pickup: {
    label: 'Sedang Diambil',
    labelTakeaway: 'Mengambil Pesanan',
    labelDineIn: 'Sedang Diambil',
    labelDelivery: 'Sedang Diambil',
    color: 'success',
    gradient: 'from-green-500 to-teal-500',
    icon: '🚶',
    description: 'Pesanan sedang diambil',
    thankYou: '💖 Silakan ambil pesanan Anda!',
  },
  out_for_delivery: { 
    label: 'Sedang Diantar', 
    labelTakeaway: 'Sedang Diantar',
    labelDineIn: 'Sedang Diantar',
    labelDelivery: 'Driver Menuju Lokasi',
    color: 'success', 
    gradient: 'from-green-500 to-teal-500', 
    icon: '🛵',
    description: 'Pesanan dalam perjalanan',
    thankYou: 'Driver sedang menuju Anda!',
  },
  completed: { 
    label: 'Selesai', 
    labelTakeaway: 'Selamat Menikmati',
    labelDineIn: 'Selamat Menikmati',
    labelDelivery: 'Pesanan Tercapai',
    color: 'success', 
    gradient: 'from-green-500 to-lime-500', 
    icon: '🎊',
    description: 'Terima kasih telah memesan!',
    thankYou: '🎉 Terima kasih! Selamat menikmati!',
  },
  cancelled: { 
    label: 'Dibatalkan', 
    labelTakeaway: 'Dibatalkan',
    labelDineIn: 'Dibatalkan',
    labelDelivery: 'Dibatalkan',
    color: 'error', 
    gradient: 'from-red-500 to-pink-500', 
    icon: '❌',
    description: 'Pesanan telah dibatalkan',
    thankYou: '',
  },
};

// Context-aware status label based on order type
function getStatusLabelWithContext(status, orderType) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
  
  if (orderType === 'takeaway') return config.labelTakeaway || config.label;
  if (orderType === 'dine-in') return config.labelDineIn || config.label;
  if (orderType === 'delivery') return config.labelDelivery || config.label;
  
  return config.label;
}

// Context-aware thank you message based on status AND order type
function getStatusThankYou(status, orderType) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
  
  // Default thank you from config
  let baseMessage = config.thankYou || '';
  
  // Custom thank you messages per order type for specific statuses
  if (status === 'completed') {
    if (orderType === 'takeaway') return '🎉 Terima kasih! Sampai jumpa lagi!';
    if (orderType === 'dine-in') return '🎉 Selamat menikmati hidangan Anda!';
    if (orderType === 'delivery') return '🎉 Pesanan telah tiba. Selamat menikmati!';
  }
  
  if (status === 'ready') {
    if (orderType === 'takeaway') return '💖 Pesanan siap! Silakan ambil di kasir.';
    if (orderType === 'dine-in') return '💖 Pesanan siap! Segera disajikan.';
    if (orderType === 'delivery') return '💖 Driver akan segera berangkat!';
  }
  
  if (status === 'out_for_pickup' && orderType === 'takeaway') {
    return '💖 Silakan ambil pesanan Anda di kasir!';
  }
  
  if (status === 'paid') {
    if (orderType === 'takeaway') return '💖 Terima kasih! Tunggu nomor antrian dipanggil.';
    if (orderType === 'dine-in') return '💖 Terima kasih! Silakan tunggu di meja.';
    if (orderType === 'delivery') return '💖 Terima kasih! Menunggu driver untuk pengantaran.';
  }
  
  return baseMessage;
}

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
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
    } finally {
      setLoading(false);
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
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pesanan Tidak Ditemukan</h1>
        <Button onClick={() => navigate('/orders')} className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
  const statusLabel = getStatusLabelWithContext(order.status, order.order_type);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Badge variant={statusConfig.color} className="text-xs px-3 py-1.5 font-semibold">
              {statusLabel}
            </Badge>
          </div>
          <div className="mt-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{order.order_number}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Status Hero Card - Clean & Celebratory */}
        <Card className={`p-5 border-0 shadow-lg bg-gradient-to-br ${statusConfig.gradient} text-white overflow-hidden relative`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 text-7xl -mr-4 -mt-4 animate-bounce">🎉</div>
            <div className="absolute bottom-0 left-0 text-5xl -ml-4 -mb-4 animate-pulse">✨</div>
            <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse" style={{animationDelay: '0.5s'}}>⭐</div>
            <div className="absolute top-1/3 right-1/4 text-5xl animate-bounce" style={{animationDelay: '0.3s'}}>🌟</div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
          
          <div className="relative z-10">
            {/* Order Type Badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white/25 backdrop-blur-sm border-0 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
                {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                {order.order_type === 'delivery' && '🛵 Delivery'}
              </Badge>
              {order.queue_number && (
                <Badge className="bg-white/25 backdrop-blur-sm border-0 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
                  #{order.queue_number}
                </Badge>
              )}
            </div>
            
            {/* Status Icon & Label */}
            <div className="flex items-center gap-4 mb-3">
              <div className="text-6xl drop-shadow-lg">{statusConfig.icon}</div>
              <div className="flex-1">
                <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-0.5">Status Pesanan</p>
                <h2 className="text-2xl font-extrabold tracking-tight leading-tight">{statusLabel}</h2>
              </div>
            </div>
            
            {/* Thank You Message - Dynamic by Order Type */}
            {getStatusThankYou(order.status, order.order_type) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/30">
                <p className="text-white font-bold text-sm text-center">
                  {getStatusThankYou(order.status, order.order_type)}
                </p>
              </div>
            )}
            
            {/* Info Badges */}
            {order.estimated_time && ['preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30">
                  <Clock className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm font-extrabold">{order.estimated_time} min</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Loyalty Points Earned Card - Celebratory */}
        {order.loyalty_points_earned > 0 && (
          <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-20 text-6xl -mr-2 -mt-2">🪙</div>
            <div className="absolute bottom-0 left-0 opacity-20 text-5xl -ml-2 -mb-2">⭐</div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-0.5">Poin Loyalty</p>
                  <p className="text-xl font-extrabold">+{order.loyalty_points_earned} Points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/90 text-xs font-bold mb-0.5">Total Poin</p>
                <p className="text-lg font-extrabold">{(order.loyalty_points_used || 0) + order.loyalty_points_earned} pts</p>
              </div>
            </div>
          </Card>
        )}

        {/* Simplified Progress Timeline */}
        <Card className="p-4 border-0 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Progress Pesanan</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pantau pesanan Anda secara real-time</p>
          </div>

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
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted
                      ? `bg-gradient-to-br ${STATUS_CONFIG[status].gradient} text-white shadow-md`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-500/30 scale-110' : ''}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-current" />
                    )}
                  </div>
                  <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wide ${
                    isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {status === 'pending_payment' ? 'Order' : 
                     status === 'paid' ? 'Paid' : 
                     status === 'preparing' ? 'Prep' : 
                     status === 'ready' ? 'Ready' : 
                     status === 'out_for_pickup' ? 'Pickup' :
                     status === 'out_for_delivery' ? 'Deliver' : 'Done'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Order Type & Queue */}
        <div className="flex gap-2">
          <Card className="flex-1 p-3 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipe</span>
            </div>
            <Badge variant={order.order_type === 'delivery' ? 'primary' : 'secondary'} className="text-xs font-semibold">
              {order.order_type === 'dine-in' && '🍽️ Dine-in'}
              {order.order_type === 'takeaway' && '🛍️ Takeaway'}
              {order.order_type === 'delivery' && '🛵 Delivery'}
            </Badge>
          </Card>

          {order.queue_number && (
            <Card className="flex-1 p-3 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Antrian</span>
              </div>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">#{order.queue_number}</span>
            </Card>
          )}
        </div>

        {/* Delivery Address */}
        {order.order_type === 'delivery' && order.delivery_address && (
          <Card className="p-3 border-0 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Alamat Delivery</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {order.delivery_address}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-green-500" />
            </div>
            Item Order
          </h3>

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

        {/* Payment Summary */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            Pembayaran
          </h3>

          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="space-y-1.5 text-sm">
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

              <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Total Bayar</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>

              {order.payment_method && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Metode Pembayaran</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white capitalize">
                      {order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <Card className="p-3 border-0 shadow-sm bg-gray-100 dark:bg-gray-800">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Catatan Pesanan</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{order.notes}"</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
