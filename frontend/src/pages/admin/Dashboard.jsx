import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, DollarSign, TrendingUp,
  CheckCircle, XCircle, Clock, Package,
  FileText, BarChart3, ChefHat, Truck,
  RefreshCw, ArrowUpRight, ArrowDownRight, Bell,
  Wallet, Receipt, Activity
} from 'lucide-react';
import { dashboardAPI, paymentAPI, orderAPI } from '../../lib/api';
import { Card, LoadingSpinner, Button, Badge } from '../../components/ui/BaseComponents';
import { StaffPasswordSetupModal } from '../../components/ui/StaffPasswordSetupModal';
import { formatRupiah, formatDate } from '../../lib/utils';
import {
  subscribeToUserCount,
  subscribeToOrderUpdates,
  subscribeToPaymentUpdates,
  subscribeToStaffStatus,
  emitStaffStatusUpdate
} from '../../lib/socket';
import { useAuthStore } from '../../store';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, needsPasswordSetup, setNeedsPasswordSetup } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [staffOnline, setStaffOnline] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadAllData();
    setupSocketListeners();
    updateStaffOnlineStatus('online', 'admin');

    // Check if staff needs to setup password
    if (needsPasswordSetup) {
      setShowPasswordModal(true);
    }

    return () => {
      updateStaffOnlineStatus('offline', 'admin');
    };
  }, []);

  const handlePasswordSetupComplete = () => {
    setShowPasswordModal(false);
    setNeedsPasswordSetup(false);
    console.log('✅ Password setup complete');
  };

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
    subscribeToUserCount((data) => {
      setOnlineCount(data.total || 0);
    });

    subscribeToOrderUpdates(() => {
      loadAllData();
    });

    subscribeToPaymentUpdates(() => {
      loadAllData();
    });

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
      value: stats?.users?.total?.toLocaleString('id-ID') || '0',
      subtext: `${onlineCount} online`,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      icon: ShoppingBag,
      label: 'Orders Today',
      value: stats?.orders?.today?.toLocaleString('id-ID') || '0',
      subtext: `${stats?.orders?.pending || 0} pending`,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      icon: DollarSign,
      label: 'Revenue Today',
      value: formatRupiah(stats?.revenue?.today || 0, { compact: true }),
      subtext: `Total: ${formatRupiah(stats?.revenue?.total || 0, { compact: true })}`,
      trend: '+25%',
      trendUp: true,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      icon: Activity,
      label: 'Active Orders',
      value: stats?.orders?.active?.toLocaleString('id-ID') || '0',
      subtext: `${stats?.payments?.pending || 0} payment`,
      trend: '-3%',
      trendUp: false,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-500/10 to-amber-500/10',
    },
  ];

  const quickActions = [
    {
      icon: Wallet,
      label: 'Pembayaran',
      sublabel: `${pendingPayments.length} pending`,
      onClick: () => navigate('/admin/payments'),
      color: 'blue',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: pendingPayments.length,
    },
    {
      icon: Package,
      label: 'Produk',
      sublabel: 'Kelola menu',
      onClick: () => navigate('/admin/products'),
      color: 'purple',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Receipt,
      label: 'Orders',
      sublabel: `${stats?.orders?.total || 0} total`,
      onClick: () => navigate('/admin/orders'),
      color: 'green',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: BarChart3,
      label: 'Reports',
      sublabel: 'Laporan PDF',
      onClick: () => navigate('/admin/reports'),
      color: 'orange',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadAllData}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 shadow-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="mb-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[80px]">
                  {stat.subtext}
                </p>
                <div className={`flex items-center text-xs font-medium ${
                  stat.trendUp ? 'text-green-600' : 'text-red-500'
                }`}>
                  {stat.trendUp ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {stat.trend}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Actions</h3>
          <Bell className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="flex flex-col items-center p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 relative"
            >
              {action.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                  {action.badge}
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mb-1.5`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {action.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 text-center mt-0.5">
                {action.sublabel}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Pembayaran Pending
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pendingPayments.length} perlu verifikasi
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/payments')}
              className="text-xs h-auto px-2.5 py-1.5"
            >
              Lihat Semua
            </Button>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map((payment) => (
              <div
                key={payment.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {payment.order?.order_number || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {payment.method}
                    </p>
                  </div>
                  <p className="font-semibold text-primary text-sm ml-2">
                    {formatRupiah(payment.amount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectPayment(payment.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleVerifyPayment(payment.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verifikasi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Orders Terbaru
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {recentOrders.length} orders terakhir
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/orders')}
            className="text-xs h-auto px-2.5 py-1.5"
          >
            Lihat Semua
          </Button>
        </div>
        <div className="space-y-2">
          {recentOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/orders/${order.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {order.order_number}
                    </span>
                    <Badge
                      variant={
                        order.status === 'completed' ? 'success' :
                        order.status === 'cancelled' ? 'error' :
                        order.status === 'pending' ? 'warning' : 'primary'
                      }
                      className="text-xs px-2 py-0.5"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{order.order_type}</span>
                    <span>•</span>
                    <span>{formatDate(order.createdAt, { short: true })}</span>
                  </div>
                </div>
                <p className="font-bold text-primary text-sm ml-2 whitespace-nowrap">
                  {formatRupiah(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Online Staff */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Staff Online
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {staffOnline.length} staff aktif
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {staffOnline.length === 0 ? (
            <div className="col-span-3 py-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tidak ada staff online</p>
            </div>
          ) : (
            staffOnline.map((staff) => (
              <div
                key={staff.id}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-1.5">
                  {staff.department === 'Dapur' ? (
                    <ChefHat className="w-4 h-4 text-primary" />
                  ) : staff.department === 'Delivery' ? (
                    <Truck className="w-4 h-4 text-primary" />
                  ) : (
                    <Users className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {staff.name || 'Staff'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {staff.department}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Staff Password Setup Modal */}
      <StaffPasswordSetupModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onComplete={handlePasswordSetupComplete}
      />
    </div>
  );
}
