import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card, LoadingSpinner, Badge } from '../components/ui/BaseComponents';
import { formatRupiah, formatTime, getStatusLabel, getStatusColor } from '../lib/utils';
import { getSocket, subscribeToOrderUpdates } from '../lib/socket';

export default function TrackOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();

    const unsubscribe = subscribeToOrderUpdates((data) => {
      if (data.orderId === id) {
        loadOrder();
        loadQueueInfo();
      }
    });

    return () => unsubscribe();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await orderAPI.getOrderById(id);
      setOrder(data.order);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQueueInfo = async () => {
    try {
      const { data } = await orderAPI.getQueueInfo(id);
      setQueueInfo(data.queue);
    } catch (error) {
      console.error('Failed to load queue info:', error);
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
    return <div>Order not found</div>;
  }

  const statusSteps = [
    { key: 'pending_payment', label: 'Menunggu Pembayaran' },
    { key: 'waiting_verification', label: 'Verifikasi' },
    { key: 'paid', label: 'Dibayar' },
    { key: 'preparing', label: 'Disiapkan' },
    { key: 'ready', label: 'Siap' },
    { key: 'completed', label: 'Selesai' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Lacak Pesanan</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Queue Number */}
        {order.queue_number && (
          <Card className="p-6 bg-gradient-to-r from-primary to-secondary text-white">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Antrian Anda</p>
              <p className="text-5xl font-bold mb-4">#{order.queue_number}</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Estimasi: {formatTime(order.estimated_time)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Status Pesanan</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex items-center gap-3 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isCompleted
                          ? 'bg-primary'
                          : 'bg-border'
                      }`}
                    >
                      {isCompleted && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isCurrent
                          ? 'font-semibold text-primary'
                          : isCompleted
                          ? 'text-text-primary'
                          : 'text-text-tertiary'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Detail Pesanan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Nomor Pesanan</span>
              <span className="text-text-primary">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Tipe</span>
              <span className="text-text-primary capitalize">{order.order_type}</span>
            </div>
            {order.delivery_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-text-tertiary mt-0.5" />
                <span className="text-text-primary">{order.delivery_address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-tertiary">Total</span>
              <span className="text-primary font-bold">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Item</h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-text-primary">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            Hubungi Kami
          </Button>
          <Button variant="secondary" className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Lihat Lokasi
          </Button>
        </div>
      </div>
    </div>
  );
}
