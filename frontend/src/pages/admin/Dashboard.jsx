import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../lib/api';
import { Card, LoadingSpinner, Button } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';
import { Users, ShoppingBag, DollarSign, TrendingUp, CheckCircle, Package, FileText, BarChart3 } from 'lucide-react';
import { subscribeToUserCount } from '../../lib/socket';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    const unsubscribe = subscribeToUserCount((data) => {
      if (stats) {
        setStats({ ...stats, realtime: { online_users: data.total } });
      }
    });

    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
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

  const statCards = [
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Total Users',
      value: stats?.users?.total || 0,
      subtext: `${stats?.realtime?.online_users || 0} online`,
      color: 'bg-blue-500',
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      label: 'Orders Today',
      value: stats?.orders?.today || 0,
      subtext: `${stats?.orders?.pending} pending`,
      color: 'bg-purple-500',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Revenue Today',
      value: formatRupiah(stats?.revenue?.today || 0),
      subtext: `Total: ${formatRupiah(stats?.revenue?.total || 0)}`,
      color: 'bg-green-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Active Orders',
      value: stats?.orders?.active || 0,
      subtext: `${stats?.payments?.pending} payment pending`,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/payments')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <CheckCircle className="w-8 h-8" />
            <span className="text-sm text-center">Verifikasi Pembayaran</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/products')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <Package className="w-8 h-8" />
            <span className="text-sm text-center">Kelola Produk</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/orders')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <FileText className="w-8 h-8" />
            <span className="text-sm text-center">Lihat Orders</span>
          </Button>
          <Button
            variant="success"
            onClick={() => navigate('/admin/reports')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <BarChart3 className="w-8 h-8" />
            <span className="text-sm text-center">Generate Laporan</span>
          </Button>
        </div>
      </Card>

      {/* Staff Status */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Status Staff</h3>
        <div className="space-y-2">
          {stats?.staff?.admin?.map((staff) => (
            <div key={staff.id} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{staff.name}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                staff.status === 'online' ? 'bg-success/10 text-success' : 'bg-secondary text-text-tertiary'
              }`}>
                {staff.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
