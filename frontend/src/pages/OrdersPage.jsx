import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card, LoadingSpinner, EmptyState } from '../components/ui/BaseComponents';
import { OrderCard } from '../components/ui';
import { subscribeToOrderUpdates } from '../lib/socket';

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
    { value: 'completed', label: 'Selesai' },
  ];

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
