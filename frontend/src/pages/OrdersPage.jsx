import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, MapPin, Truck } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card, LoadingSpinner, EmptyState } from '../components/ui/BaseComponents';
import { OrderCard } from '../components/ui';
import { subscribeToOrderUpdates } from '../lib/socket';
import { getStatusLabel } from '../lib/utils';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();

    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await orderAPI.getMyOrders(params);
      setOrders(data.rows || data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending_payment', label: 'Belum Bayar' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'preparing', label: 'Disiapkan' },
    { value: 'ready', label: 'Siap' },
    { value: 'delivering', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
  ];

  // Get orders that can be tracked (active orders)
  // pending_payment orders show payment prompt, others show tracking
  const trackableOrders = orders.filter(
    (order) => ['pending_payment', 'paid', 'preparing', 'ready', 'delivering'].includes(order.status)
  );

  const getStatusLabelShort = (status) => {
    const labels = {
      pending_payment: 'Belum Bayar',
      paid: 'Dibayar',
      preparing: 'Disiapkan',
      ready: 'Siap Diantar',
      delivering: 'Dikirim',
    };
    return labels[status] || getStatusLabel(status);
  };

  const getTrackCardText = (status) => {
    if (status === 'pending_payment') {
      return 'Perlu pembayaran';
    }
    if (status === 'paid') {
      return 'Menunggu verifikasi';
    }
    if (status === 'preparing') {
      return 'Sedang disiapkan';
    }
    if (status === 'ready') {
      return 'Siap diantrar';
    }
    if (status === 'delivering') {
      return 'Sedang dikirim';
    }
    return getStatusLabelShort(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <h1 className="text-2xl font-bold text-text-primary">Pesanan Saya</h1>
      </div>

      {/* Track Active Order Card */}
      {trackableOrders.length > 0 && (
        <div className="px-4 py-4">
          <Card
            onClick={() => navigate(`/track/${trackableOrders[0].id}`)}
            className="p-4 bg-gradient-to-r from-primary to-orange-500 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Lacak Pesanan</h3>
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
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {orders.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-text-tertiary" />}
            title="Belum ada pesanan"
            description="Mulai pesan bakso favoritmu!"
            action={
              <Button onClick={() => navigate('/menu')} className="mt-4">
                Lihat Menu
              </Button>
            }
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
