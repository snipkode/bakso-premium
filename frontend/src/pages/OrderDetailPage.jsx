import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { useAuthStore } from '../store';
import { Button, Card, LoadingSpinner, Badge } from '../components/ui/BaseComponents';
import { formatRupiah, formatDate, getStatusLabel, getStatusColor } from '../lib/utils';
import { subscribeToOrderUpdates } from '../lib/socket';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();

    // Setup real-time updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      if (data.order_id === id || data.orderId === id) {
        loadOrder(); // Reload order on update
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

  const handleCancelOrder = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(id, 'Customer requested cancellation');
      alert('Pesanan berhasil dibatalkan');
      loadOrder();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
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
        <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="text-text-tertiary mb-4">
          Pesanan yang Anda cari tidak ada atau sudah dihapus.
        </p>
        <Button onClick={() => navigate('/orders')}>
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    );
  }

  const isCustomer = user?.role === 'customer';
  const canCancel = order.status === 'pending' && isCustomer;

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Detail Pesanan</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Status Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-tertiary mb-1">{order.order_number}</p>
              <h2 className="text-2xl font-bold text-text-primary">
                {getStatusLabel(order.status)}
              </h2>
            </div>
            <Badge variant={getStatusColor(order.status)} className="text-lg px-4 py-2">
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Progress Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {[
                { status: 'pending', label: 'Diterima', icon: '📝' },
                { status: 'paid', label: 'Dibayar', icon: '💳' },
                { status: 'preparing', label: 'Dimasak', icon: '👨‍🍳' },
                { status: 'ready', label: 'Siap', icon: '✅' },
                { status: 'completed', label: 'Selesai', icon: '🎉' },
              ].map((step, index, arr) => {
                const statusOrder = ['pending', 'paid', 'preparing', 'ready', 'completed'];
                const currentStatusIndex = statusOrder.indexOf(order.status);
                const stepIndex = statusOrder.indexOf(step.status);
                const isCompleted = stepIndex <= currentStatusIndex;
                const isCurrent = stepIndex === currentStatusIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-surface text-text-tertiary'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <p className={`text-xs mt-1 text-center ${
                      isCompleted ? 'text-primary' : 'text-text-tertiary'
                    }`}>
                      {step.label}
                    </p>
                    {index < arr.length - 1 && (
                      <div
                        className={`absolute top-5 w-full h-0.5 ${
                          stepIndex < currentStatusIndex ? 'bg-primary' : 'bg-surface'
                        }`}
                        style={{
                          left: '50%',
                          width: `calc(100% - 40px)`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order Info */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-text-primary">Informasi Pesanan</h3>
          
          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">Tanggal</span>
            <span className="text-text-primary">{formatDate(order.createdAt)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">Jenis Pesanan</span>
            <span className="text-text-primary capitalize">
              {order.order_type === 'dine-in' && '🍽️ Dine-in'}
              {order.order_type === 'takeaway' && '🛍️ Takeaway'}
              {order.order_type === 'delivery' && '🛵 Delivery'}
            </span>
          </div>

          {order.order_type === 'dine-in' && order.table_number && (
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Nomor Meja</span>
              <span className="text-text-primary">{order.table_number}</span>
            </div>
          )}

          {order.order_type === 'delivery' && order.delivery_address && (
            <div className="text-sm">
              <span className="text-text-tertiary block mb-1">Alamat Pengiriman</span>
              <span className="text-text-primary">{order.delivery_address}</span>
            </div>
          )}

          {order.queue_number && (
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Nomor Antrian</span>
              <span className="text-primary font-bold">#{order.queue_number}</span>
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Item Pesanan
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {item.quantity}x {item.product_name}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-text-tertiary mt-1">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
                <p className="text-text-primary font-medium">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-4">
          <h3 className="font-semibold text-text-primary mb-3">Ringkasan Pembayaran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Subtotal</span>
              <span className="text-text-primary">{formatRupiah(order.subtotal)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <span className="text-text-tertiary">Diskon</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-text-tertiary">Ongkir</span>
                <span className="text-text-primary">{formatRupiah(order.delivery_fee)}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-text-primary">Total</span>
              <span className="text-primary text-lg">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Customer Info (Admin/Kitchen/Driver view) */}
        {!isCustomer && (order.customer_name || order.user) && (
          <Card className="p-4">
            <h3 className="font-semibold text-text-primary mb-3">Informasi Pelanggan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Nama</span>
                <span className="text-text-primary">
                  {order.customer_name || order.user?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Telepon</span>
                <span className="text-text-primary">
                  {order.customer_phone || order.user?.phone}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <div className="pt-4">
            <Button
              variant="danger"
              className="w-full"
              onClick={handleCancelOrder}
              isLoading={cancelling}
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Batalkan Pesanan
            </Button>
          </div>
        )}

        {/* Estimated Time */}
        {order.status === 'preparing' && (
          <Card className="p-4 bg-warning/10">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="font-semibold text-warning">Sedang Disiapkan</p>
                <p className="text-sm text-text-tertiary">
                  Pesanan Anda sedang disiapkan oleh dapur kami
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Completed Badge */}
        {order.status === 'completed' && (
          <Card className="p-4 bg-success/10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="font-semibold text-success">Pesanan Selesai</p>
                <p className="text-sm text-text-tertiary">
                  Terima kasih telah memesan di Bakso Premium!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
