import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, 
  CheckCircle, XCircle, Clock, Package, 
  FileText, BarChart3, ChefHat, Truck,
  RefreshCw, ArrowUpRight, ArrowDownRight, Bell
} from 'lucide-react';
import { dashboardAPI, paymentAPI, orderAPI } from '../../lib/api';
import { Card, LoadingSpinner, Button, Badge } from '../../components/ui/BaseComponents';
import { formatRupiah, formatDate } from '../../lib/utils';
import { 
  subscribeToUserCount,
  subscribeToOrderUpdates,
  subscribeToPaymentUpdates,
  subscribeToStaffStatus,
  emitStaffStatusUpdate
} from '../../lib/socket';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [staffOnline, setStaffOnline] = useState([]);

  useEffect(() => {
    loadAllData();
    setupSocketListeners();
    updateStaffOnlineStatus('online', 'admin');
    
    return () => {
      updateStaffOnlineStatus('offline', 'admin');
    };
  }, []);

  const loadAllData = async () => {
    try {
      const [statsRes, paymentsRes, ordersRes] = await Promise.all([
        dashboardAPI.getStats(),
        paymentAPI.getPendingPayments(),
        orderAPI.getAllOrders({ limit: 5, status: 'all' }),
      ]);
      
      setStats(statsRes.data.stats);
      setPendingPayments(paymentsRes.data.payments || paymentsRes.data || []);
      setRecentOrders(ordersRes.data.orders || ordersRes.data.rows || ordersRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // User count updates
    subscribeToUserCount((data) => {
      setOnlineCount(data.total || 0);
    });

    // Order updates
    subscribeToOrderUpdates((data) => {
      console.log('📦 Order updated:', data);
      loadAllData(); // Refresh all data
    });

    // Payment updates
    subscribeToPaymentUpdates((data) => {
      console.log('💳 Payment verified:', data);
      loadAllData(); // Refresh all data
    });

    // Staff status updates
    subscribeToStaffStatus((data) => {
      const allStaff = [];
      Object.entries(data).forEach(([dept, staff]) => {
        staff.forEach(s => allStaff.push({ ...s, department: dept }));
      });
      setStaffOnline(allStaff.filter(s => s.status === 'online'));
    });
  };

  const updateStaffOnlineStatus = (status, department) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      emitStaffStatusUpdate(user.id, status, department);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!confirm('Verifikasi pembayaran ini?')) return;
    
    try {
      await paymentAPI.verifyPayment(paymentId, 'verified');
      alert('✅ Pembayaran berhasil diverifikasi');
      loadAllData();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal verifikasi pembayaran');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!confirm('Tolak pembayaran ini?')) return;
    
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;
    
    try {
      await paymentAPI.verifyPayment(paymentId, 'rejected', reason);
      alert('❌ Pembayaran ditolak');
      loadAllData();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menolak pembayaran');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.users?.total || 0,
      subtext: `${onlineCount} online`,
      trend: '+12%',
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: ShoppingBag,
      label: 'Orders Today',
      value: stats?.orders?.today || 0,
      subtext: `${stats?.orders?.pending || 0} pending`,
      trend: '+8%',
      trendUp: true,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: DollarSign,
      label: 'Revenue Today',
      value: formatRupiah(stats?.revenue?.today || 0),
      subtext: `Total: ${formatRupiah(stats?.revenue?.total || 0)}`,
      trend: '+25%',
      trendUp: true,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Active Orders',
      value: stats?.orders?.active || 0,
      subtext: `${stats?.payments?.pending || 0} payment pending`,
      trend: '-3%',
      trendUp: false,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const quickActions = [
    {
      icon: CheckCircle,
      label: 'Verifikasi Pembayaran',
      sublabel: `${pendingPayments.length} pending`,
      onClick: () => navigate('/admin/payments'),
      variant: 'primary',
      badge: pendingPayments.length > 0 ? pendingPayments.length : null,
    },
    {
      icon: Package,
      label: 'Kelola Produk',
      sublabel: 'Tambah/Edit produk',
      onClick: () => navigate('/admin/products'),
      variant: 'secondary',
    },
    {
      icon: FileText,
      label: 'Lihat Orders',
      sublabel: `${stats?.orders?.total || 0} total orders`,
      onClick: () => navigate('/admin/orders'),
      variant: 'secondary',
    },
    {
      icon: BarChart3,
      label: 'Generate Laporan',
      sublabel: 'PDF reports',
      onClick: () => navigate('/admin/reports'),
      variant: 'success',
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-tertiary text-sm">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadAllData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-4 relative overflow-hidden">
            <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('from-', 'text-').split(' ')[0]}`} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
              </div>
              <div className={`flex items-center text-xs ${stat.trendUp ? 'text-success' : 'text-error'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Quick Actions</h3>
          <Bell className="w-5 h-5 text-text-tertiary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-4 h-auto relative"
            >
              {action.badge && (
                <span className="absolute top-2 right-2 bg-error text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              <action.icon className="w-8 h-8" />
              <span className="text-sm text-center font-medium">{action.label}</span>
              <span className="text-xs text-text-tertiary">{action.sublabel}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pembayaran Pending
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/payments')}
            >
              Lihat Semua
            </Button>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map((payment) => (
              <div
                key={payment.id}
                className="p-3 bg-surface rounded-xl flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-text-primary text-sm">
                    {payment.order?.order_number || 'N/A'}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {payment.method} • {formatRupiah(payment.amount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectPayment(payment.id)}
                    className="px-3"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleVerifyPayment(payment.id)}
                    className="px-3"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Orders Terbaru
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/orders')}
          >
            Lihat Semua
          </Button>
        </div>
        <div className="space-y-2">
          {recentOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="p-3 bg-surface rounded-xl flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary text-sm">
                    {order.order_number}
                  </p>
                  <Badge variant={
                    order.status === 'completed' ? 'success' :
                    order.status === 'cancelled' ? 'error' :
                    order.status === 'pending' ? 'warning' : 'primary'
                  }>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {order.order_type} • {formatDate(order.createdAt)}
                </p>
              </div>
              <p className="font-bold text-primary text-sm">
                {formatRupiah(order.total)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Online Staff */}
      <Card className="p-4">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-success" />
          Staff Online ({staffOnline.length})
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {staffOnline.length === 0 ? (
            <p className="text-sm text-text-tertiary col-span-3">Tidak ada staff online</p>
          ) : (
            staffOnline.map((staff) => (
              <div
                key={staff.id}
                className="p-3 bg-surface rounded-xl text-center"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  {staff.department === 'Dapur' ? (
                    <ChefHat className="w-5 h-5 text-primary" />
                  ) : staff.department === 'Delivery' ? (
                    <Truck className="w-5 h-5 text-primary" />
                  ) : (
                    <Users className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-xs font-medium text-text-primary truncate">
                  {staff.name || 'Staff'}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {staff.department}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
