import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Truck, ShoppingBag, ChefHat, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card, LoadingSpinner, Badge, IconButton } from '../components/ui/BaseComponents';
import { subscribeToOrderUpdates } from '../lib/socket';
import { getStatusLabel, getStatusColor, formatRupiah, formatDate } from '../lib/utils';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4, // Default for mobile
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Update limit based on screen size
    setPagination(prev => ({
      ...prev,
      limit: isMobile ? 4 : 8,
      page: 1, // Reset to first page when limit changes
    }));
  }, [isMobile]);

  useEffect(() => {
    loadOrders();

    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, [filter, pagination.page, isMobile]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      const { data } = await orderAPI.getMyOrders(params);
      setOrders(data.rows || data.orders || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Gagal memuat pesanan. Silakan refresh halaman.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filters = [
    { value: 'all', label: 'Semua', icon: '📋' },
    { value: 'pending_payment', label: 'Belum Bayar', icon: '⏳' },
    { value: 'paid', label: 'Dibayar', icon: '✅' },
    { value: 'preparing', label: 'Disiapkan', icon: '👨‍🍳' },
    { value: 'ready', label: 'Siap', icon: '🍽️' }, // Dynamic: 🍽️ ready, 🛵 out_for_delivery
    { value: 'out_for_delivery', label: 'Dikirim', icon: '🛵' },
    { value: 'completed', label: 'Selesai', icon: '🎉' },
  ];

  // Get orders that can be tracked (active orders)
  const trackableOrders = orders.filter(
    (order) => ['pending_payment', 'paid', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)
  );

  const getStatusIcon = (status) => {
    const icons = {
      pending_payment: <AlertCircle className="w-5 h-5" />,
      paid: <CheckCircle className="w-5 h-5" />,
      preparing: <ChefHat className="w-5 h-5" />,
      ready: <ShoppingBag className="w-5 h-5" />,
      out_for_delivery: <Truck className="w-5 h-5" />,
      completed: <CheckCircle className="w-5 h-5" />,
    };
    return icons[status] || <Clock className="w-5 h-5" />;
  };

  const getStatusLabelShort = (status, orderType) => {
    // Context-aware status labels based on order type
    if (status === 'ready') {
      if (orderType === 'takeaway') return 'Siap Diambil';
      if (orderType === 'dine-in') return 'Siap Disajikan';
      return 'Siap Diantar';
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

  const getTrackCardConfig = (status) => {
    const configs = {
      pending_payment: {
        title: 'Bayar Sekarang',
        subtitle: 'Pesanan belum dibayar',
        gradient: 'from-red-500 to-orange-500',
        icon: <AlertCircle className="w-6 h-6" />,
      },
      paid: {
        title: 'Lacak Pesanan',
        subtitle: 'Menunggu verifikasi',
        gradient: 'from-blue-500 to-cyan-500',
        icon: <Clock className="w-6 h-6" />,
      },
      preparing: {
        title: 'Lacak Pesanan',
        subtitle: 'Sedang disiapkan',
        gradient: 'from-orange-500 to-amber-500',
        icon: <ChefHat className="w-6 h-6" />,
      },
      ready: {
        title: 'Lacak Pesanan',
        subtitle: 'Siap diantrar',
        gradient: 'from-green-500 to-emerald-500',
        icon: <ShoppingBag className="w-6 h-6" />,
      },
      out_for_delivery: {
        title: 'Lacak Pesanan',
        subtitle: 'Sedang dikirim',
        gradient: 'from-primary to-purple-500',
        icon: <Truck className="w-6 h-6" />,
      },
    };
    return configs[status] || configs.pending_payment;
  };

  const getTrackCardText = (status, orderType) => {
    // Context-aware status text based on order type
    if (status === 'ready') {
      if (orderType === 'takeaway') return 'Siap diambil';
      if (orderType === 'dine-in') return 'Siap disajikan';
      return 'Siap diantrar';
    }
    if (status === 'out_for_delivery') return 'Sedang dikirim';
    
    const texts = {
      pending_payment: 'Perlu pembayaran',
      paid: 'Menunggu verifikasi',
      preparing: 'Sedang disiapkan',
    };
    return texts[status] || getStatusLabelShort(status, orderType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 animate-ping opacity-20 bg-primary rounded-full"></div>
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Pesanan Saya
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {orders.length} pesanan ditemukan
            </p>
          </div>
          <IconButton
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Track Active Order Card */}
      {trackableOrders.length > 0 && trackableOrders[0] && (
        <div className="px-4 py-4">
          <Card
            onClick={() => navigate(`/track/${trackableOrders[0].id}`)}
            className={`p-4 bg-gradient-to-r ${getTrackCardConfig(trackableOrders[0].status)?.gradient || 'from-primary to-orange-500'} text-white cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {getTrackCardConfig(trackableOrders[0].status)?.icon || <ShoppingBag className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {getTrackCardConfig(trackableOrders[0].status)?.title || 'Lacak Pesanan'}
                  </h3>
                  <p className="text-sm text-white/90">
                    #{trackableOrders[0].order_number} - {getTrackCardText(trackableOrders[0].status, trackableOrders[0].order_type)}
                  </p>
                </div>
              </div>
              <MapPin className="w-6 h-6 text-white/70" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => {
            const isActive = filter === f.value;
            const count = f.value === 'all' 
              ? orders.length 
              : orders.filter(o => o.status === f.value).length;
            
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-orange-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {orders.length === 0 && !loading ? (
          <div className="py-12">
            <Card className="p-8 text-center bg-gradient-to-b from-white to-orange-50/50 dark:from-gray-800 dark:to-gray-800/50 border-0 shadow-xl overflow-hidden relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-5 overflow-hidden">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <text x="40" y="80" fontSize="40">🍜</text>
                  <text x="120" y="60" fontSize="40">🍲</text>
                  <text x="200" y="100" fontSize="40">🍛</text>
                  <text x="280" y="70" fontSize="40">🍱</text>
                  <text x="60" y="160" fontSize="40">🍢</text>
                  <text x="160" y="140" fontSize="40">🍡</text>
                  <text x="260" y="170" fontSize="40">🍜</text>
                  <text x="100" y="240" fontSize="40">🍲</text>
                  <text x="200" y="220" fontSize="40">🍛</text>
                  <text x="300" y="250" fontSize="40">🍱</text>
                  <text x="80" y="320" fontSize="40">🍢</text>
                  <text x="180" y="300" fontSize="40">🍡</text>
                  <text x="280" y="330" fontSize="40">🍜</text>
                </svg>
              </div>

              <div className="relative z-10">
                {/* Animated SVG Illustration - Happy Customer with Empty Order */}
                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFEDD5"/>
                        <stop offset="100%" stopColor="#FED7AA"/>
                      </linearGradient>
                      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FED7AA"/>
                        <stop offset="100%" stopColor="#FDBA74"/>
                      </linearGradient>
                      <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35"/>
                        <stop offset="100%" stopColor="#EA580C"/>
                      </linearGradient>
                      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6B7280"/>
                        <stop offset="100%" stopColor="#374151"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Background Circle */}
                    <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.5"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#FFA94D" strokeWidth="2" strokeDasharray="5,5" opacity="0.3">
                      <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
                    </circle>
                    
                    {/* Ground Shadow */}
                    <ellipse cx="100" cy="175" rx="40" ry="8" fill="#000" opacity="0.1"/>
                    
                    {/* Body - Sitting */}
                    <ellipse cx="100" cy="140" rx="35" ry="25" fill="url(#shirtGrad)"/>
                    
                    {/* Legs - Sitting */}
                    <ellipse cx="75" cy="160" rx="12" ry="8" fill="#1F2937"/>
                    <ellipse cx="125" cy="160" rx="12" ry="8" fill="#1F2937"/>
                    
                    {/* Head */}
                    <circle cx="100" cy="95" r="28" fill="url(#skinGrad)"/>
                    
                    {/* Hair */}
                    <path d="M72 90 Q75 65 100 65 Q125 65 128 90 Q132 82 128 75 Q125 60 100 60 Q75 60 72 75 Q68 82 72 90" fill="#1F2937"/>
                    <circle cx="100" cy="75" r="20" fill="#1F2937"/>
                    
                    {/* Confused/Thinking Eyes */}
                    <circle cx="88" cy="92" r="4" fill="#1F2937"/>
                    <circle cx="112" cy="92" r="4" fill="#1F2937"/>
                    <circle cx="89" cy="91" r="1.5" fill="white"/>
                    <circle cx="113" cy="91" r="1.5" fill="white"/>
                    
                    {/* Eyebrows - Confused */}
                    <path d="M82 84 Q88 80 94 84" stroke="#1F2937" strokeWidth="2" fill="none"/>
                    <path d="M106 84 Q112 80 118 84" stroke="#1F2937" strokeWidth="2" fill="none"/>
                    
                    {/* Small Mouth - Thinking */}
                    <circle cx="100" cy="108" r="3" fill="#1F2937"/>
                    
                    {/* Blush */}
                    <ellipse cx="78" cy="100" rx="5" ry="3" fill="#FCA5A5" opacity="0.5"/>
                    <ellipse cx="122" cy="100" rx="5" ry="3" fill="#FCA5A5" opacity="0.5"/>
                    
                    {/* Arm holding phone */}
                    <path d="M65 130 Q50 135 45 120" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
                    
                    {/* Phone */}
                    <rect x="32" y="105" width="18" height="28" rx="3" fill="url(#phoneGrad)"/>
                    <rect x="34" y="108" width="14" height="20" rx="1" fill="#1F2937"/>
                    <circle cx="41" cy="130" r="1.5" fill="#6B7280"/>
                    
                    {/* Other arm resting */}
                    <path d="M135 130 Q150 135 155 125" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
                    
                    {/* Empty Order List Icon - Floating */}
                    <g transform="translate(145, 50)">
                      <rect x="0" y="0" width="30" height="40" rx="3" fill="white" stroke="#FFA94D" strokeWidth="2"/>
                      <line x1="5" y1="10" x2="25" y2="10" stroke="#D1D5DB" strokeWidth="2"/>
                      <line x1="5" y1="18" x2="25" y2="18" stroke="#D1D5DB" strokeWidth="2"/>
                      <line x1="5" y1="26" x2="18" y2="26" stroke="#D1D5DB" strokeWidth="2"/>
                      <text x="15" y="38" fontSize="8" textAnchor="middle" fill="#FF6B35">🍜</text>
                    </g>
                    
                    {/* Question marks floating */}
                    <text x="60" y="50" fontSize="16" fill="#FFA94D" opacity="0.8">?</text>
                    <text x="140" y="40" fontSize="14" fill="#FFA94D" opacity="0.6">?</text>
                    
                    {/* Sparkles */}
                    <text x="50" y="35" fontSize="12" opacity="0.7">✨</text>
                    <text x="150" y="70" fontSize="10" opacity="0.6">✨</text>
                    
                    {/* Animated dots around */}
                    <circle cx="40" cy="80" r="3" fill="#FFA94D" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="160" cy="100" r="3" fill="#FFA94D" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
                    </circle>
                    <circle cx="100" cy="40" r="3" fill="#FFA94D" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="1s"/>
                    </circle>
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Belum ada pesanan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-xs mx-auto">
                  Mulai pesan bakso favoritmu dan nikmati kelezatannya!
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30 py-3 px-6 rounded-full font-semibold"
                >
                  <ShoppingBag className="w-4 h-4 mr-2 inline" />
                  Lihat Menu
                </Button>
                
                {/* Decorative Food Emojis */}
                <div className="flex justify-center gap-3 mt-6 text-2xl">
                  <span className="animate-bounce" style={{animationDelay: '0ms'}}>🍜</span>
                  <span className="animate-bounce" style={{animationDelay: '100ms'}}>🍲</span>
                  <span className="animate-bounce" style={{animationDelay: '200ms'}}>🍛</span>
                  <span className="animate-bounce" style={{animationDelay: '300ms'}}>🍱</span>
                  <span className="animate-bounce" style={{animationDelay: '400ms'}}>🥢</span>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
                getStatusIcon={getStatusIcon}
              />
            ))}

            {/* Pagination - Responsive */}
            {pagination.totalPages > 1 && (
              <div className="pt-4 pb-8">
                <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    {/* Previous Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-1 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs font-medium">Prev</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                              pagination.page === pageNum
                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-lg shadow-orange-500/30 scale-110'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-orange-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex items-center gap-1 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-600"
                    >
                      <span className="hidden sm:inline text-xs font-medium">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Page Info */}
                  <div className="mt-3 pt-3 border-t border-orange-100 dark:border-gray-600 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-primary">Halaman {pagination.page}</span> dari{' '}
                      <span className="font-bold text-primary">{pagination.totalPages}</span>
                      {' '}({pagination.total} pesanan)
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                      Menampilkan {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pesanan
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Order Item Card Component
function OrderItemCard({ order, onClick, getStatusIcon }) {
  const statusConfig = {
    pending_payment: { bg: 'from-red-50 to-orange-50', border: 'border-red-200', text: 'text-red-600' },
    paid: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-600' },
    preparing: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-600' },
    ready: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-600' },
    out_for_delivery: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-600' },
    completed: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-600' },
  };

  const config = statusConfig[order.status] || statusConfig.pending_payment;

  // Get context-aware status label
  let statusLabel = getStatusLabel(order.status);
  if (order.status === 'ready') {
    if (order.order_type === 'takeaway') statusLabel = 'Siap Diambil';
    else if (order.order_type === 'dine-in') statusLabel = 'Siap Disajikan';
    else statusLabel = 'Siap Diantar';
  }

  return (
    <Card
      onClick={onClick}
      className={`p-4 bg-gradient-to-r ${config.bg} ${config.border} cursor-pointer hover:shadow-lg transition-all transform hover:scale-[1.01] border-l-4`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              #{order.order_number}
            </span>
            <Badge variant={getStatusColor(order.status)} className="text-[10px] px-2 py-0.5">
              {statusLabel}
            </Badge>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            {order.items?.[0]?.product_name || 'Pesanan'}
            {order.items?.length > 1 && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                +{order.items.length - 1} item lainnya
              </span>
            )}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-full bg-white/60 dark:bg-gray-800/60 flex items-center justify-center ${config.text}`}>
          {getStatusIcon(order.status)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(order.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            {order.items?.reduce((sum, item) => sum + item.quantity, 0)} item
          </span>
        </div>
        <span className="font-bold text-primary">
          {formatRupiah(order.total)}
        </span>
      </div>
    </Card>
  );
}
