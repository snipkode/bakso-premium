import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../lib/api';
import { Card, LoadingSpinner } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { subscribeToUserCount } from '../../lib/socket';

export default function AdminDashboard() {
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
          <a href="/admin/payments" className="p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition">
            ✅ Verifikasi Pembayaran
          </a>
          <a href="/admin/products" className="p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition">
            📦 Kelola Produk
          </a>
          <a href="/admin/orders" className="p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition">
            📋 Lihat Orders
          </a>
          <a href="/admin/reports" className="p-3 bg-success/10 text-success rounded-xl font-medium hover:bg-success/20 transition">
            📊 Generate Laporan
          </a>
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
