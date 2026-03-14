import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, MapPin, Truck, ShoppingBag, ChefHat, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card, LoadingSpinner, Badge, IconButton } from '../components/ui/BaseComponents';
import { subscribeToOrderUpdates } from '../lib/socket';
import { getStatusLabel, getStatusColor, formatRupiah, formatDate } from '../lib/utils';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadOrders();

    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, [filter, pagination.page]);

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
    { value: 'ready', label: 'Siap', icon: '🍜' },
    { value: 'delivering', label: 'Dikirim', icon: '🛵' },
    { value: 'completed', label: 'Selesai', icon: '🎉' },
  ];

  // Get orders that can be tracked (active orders)
  const trackableOrders = orders.filter(
    (order) => ['pending_payment', 'paid', 'preparing', 'ready', 'delivering'].includes(order.status)
  );

  const getStatusIcon = (status) => {
    const icons = {
      pending_payment: <AlertCircle className="w-5 h-5" />,
      paid: <CheckCircle className="w-5 h-5" />,
      preparing: <ChefHat className="w-5 h-5" />,
      ready: <ShoppingBag className="w-5 h-5" />,
      delivering: <Truck className="w-5 h-5" />,
      completed: <CheckCircle className="w-5 h-5" />,
    };
    return icons[status] || <Clock className="w-5 h-5" />;
  };

  const getStatusLabelShort = (status) => {
    const labels = {
      pending_payment: 'Belum Bayar',
      paid: 'Dibayar',
      preparing: 'Disiapkan',
      ready: 'Siap Diantar',
      delivering: 'Dikirim',
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
      delivering: {
        title: 'Lacak Pesanan',
        subtitle: 'Sedang dikirim',
        gradient: 'from-primary to-purple-500',
        icon: <Truck className="w-6 h-6" />,
      },
    };
    return configs[status] || configs.pending_payment;
  };

  const getTrackCardText = (status) => {
    const texts = {
      pending_payment: 'Perlu pembayaran',
      paid: 'Menunggu verifikasi',
      preparing: 'Sedang disiapkan',
      ready: 'Siap diantrar',
      delivering: 'Sedang dikirim',
    };
    return texts[status] || getStatusLabelShort(status);
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
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Track Active Order Card */}
      {trackableOrders.length > 0 && (
        <div className="px-4 py-4">
          <Card
            onClick={() => navigate(`/track/${trackableOrders[0].id}`)}
            className={`p-4 bg-gradient-to-r ${getTrackCardConfig(trackableOrders[0].status).gradient} text-white cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {getTrackCardConfig(trackableOrders[0].status).icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {getTrackCardConfig(trackableOrders[0].status).title}
                  </h3>
                  <p className="text-sm text-white/90">
                    #{trackableOrders[0].order_number} - {getTrackCardText(trackableOrders[0].status)}
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
          <div className="py-16">
            <Card className="p-8 text-center bg-gradient-to-b from-white to-orange-50/50 dark:from-gray-800 dark:to-gray-800/50">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Belum ada pesanan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Mulai pesan bakso favoritmu dan nikmati kelezatannya!
              </p>
              <Button
                onClick={() => navigate('/menu')}
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Lihat Menu
              </Button>
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pt-4 flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>

                <div className="flex items-center gap-1">
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
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30 scale-110'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-orange-100 dark:border-gray-700 hover:border-orange-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Page Info */}
            {pagination.totalPages > 0 && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} pesanan)
              </p>
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
    delivering: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-600' },
    completed: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-600' },
  };

  const config = statusConfig[order.status] || statusConfig.pending_payment;

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
              {getStatusLabel(order.status)}
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
