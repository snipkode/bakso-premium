import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ShoppingBag, MapPin, Truck, User, Phone, Mail, Package, CreditCard } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import { subscribeToOrderUpdates } from '@/lib/socket';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();

    // Real-time updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      if (data.order_id === id || data.orderId === id) {
        loadOrder();
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
      alert('Gagal load detail order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Ubah status ke ${newStatus}?`)) return;

    try {
      setUpdating(true);
      await orderAPI.updateOrderStatus(id, newStatus);
      alert(`✅ Status diubah ke: ${newStatus}`);
      loadOrder();
    } catch (error) {
      alert('Gagal update status');
    } finally {
      setUpdating(false);
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
        <h1 className="text-xl font-bold text-text-primary mb-2">Order Tidak Ditemukan</h1>
        <Button onClick={() => navigate('/admin/orders')}>Kembali ke Orders</Button>
      </div>
    );
  }

  const statusOptions = {
    pending_payment: ['paid', 'cancelled'],
    waiting_verification: ['paid', 'cancelled'],
    paid: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivering', 'completed'],
    delivering: ['completed'],
    completed: [],
    cancelled: [],
  };

  const nextStatuses = statusOptions[order.status] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-background to-orange-50/20 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/orders')}
                className="w-11 h-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order Detail</p>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{order.order_number}</h1>
              </div>
            </div>
            <Badge variant={getStatusColor(order.status)} className="text-sm px-4 py-2">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span>Status Update</span>
          </h3>

          <div className="space-y-3">
            {nextStatuses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {getStatusLabel(status)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order {order.status === 'completed' ? 'selesai' : 'dibatalkan'}
              </p>
            )}
          </div>
        </Card>

        {/* Order Info */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span>Informasi Order</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Tanggal</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDateTime(order.createdAt)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Jenis Order</span>
              <Badge variant={order.order_type === 'delivery' ? 'primary' : 'secondary'} className="capitalize">
                {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                {order.order_type === 'delivery' && '🛵 Delivery'}
              </Badge>
            </div>

            {order.order_type === 'dine-in' && order.table_number && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Nomor Meja</span>
                <span className="text-base font-bold text-orange-600 dark:text-orange-400">#{order.table_number}</span>
              </div>
            )}

            {order.order_type === 'delivery' && order.delivery_address && (
              <div className="py-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Alamat Delivery</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                  {order.delivery_address}
                </p>
              </div>
            )}

            {order.queue_number && (
              <div className="flex justify-between py-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl px-3">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nomor Antrian</span>
                <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">#{order.queue_number}</span>
              </div>
            )}

            {order.notes && (
              <div className="py-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Catatan</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-xl italic">
                  "{order.notes}"
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span>Item Order ({order.items?.length || 0})</span>
          </h3>

          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {item.quantity}x
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{item.product_name}</p>
                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📝 {item.notes}</p>
                  )}
                </div>
                <p className="text-orange-600 dark:text-orange-400 font-extrabold text-sm whitespace-nowrap">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <CreditCard className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span>Ringkasan Pembayaran</span>
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-2 px-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Diskon</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">-{formatRupiah(order.discount)}</span>
              </div>
            )}

            {order.delivery_fee > 0 && (
              <div className="flex justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ongkir</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(order.delivery_fee)}</span>
              </div>
            )}

            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Bayar</span>
                <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </div>

            {order.payment_method && (
              <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Metode Pembayaran</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{order.payment_method}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Info */}
        {order.customer_name && (
          <Card className="p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span>Informasi Pelanggan</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {order.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nama Pelanggan</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
                  </div>
                </div>
              </div>

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Telepon</span>
                  </div>
                  <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                    {order.customer_phone}
                  </span>
                </a>
              )}

              {order.user?.email && (
                <a
                  href={`mailto:${order.user.email}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</span>
                  </div>
                  <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 truncate max-w-[200px]">
                    {order.user.email}
                  </span>
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
