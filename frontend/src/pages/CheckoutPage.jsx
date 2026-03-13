import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import { Button, Input, Card } from '../components/ui/BaseComponents';
import { formatRupiah } from '../lib/utils';
import { useState } from 'react';
import { orderAPI } from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getSubtotal, orderType, notes, voucherCode, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const subtotal = getSubtotal();
  const deliveryFee = orderType === 'delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Mohon isi alamat pengiriman');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        order_type: orderType,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
          notes: item.notes,
        })),
        notes,
        voucher_code: voucherCode,
        delivery_address: orderType === 'delivery' ? deliveryAddress : null,
      };

      const { data } = await orderAPI.createOrder(orderData);
      clearCart();
      navigate(`/order-success/${data.order.id}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-48">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Checkout</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Customer Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Informasi Pemesan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Nama</span>
              <span className="text-text-primary">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Telepon</span>
              <span className="text-text-primary">{user?.phone}</span>
            </div>
          </div>
        </Card>

        {/* Order Type */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Tipe Pesanan</h3>
          <p className="text-text-primary capitalize">{orderType.replace('-', ' ')}</p>
        </Card>

        {/* Delivery Address */}
        {orderType === 'delivery' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
            <Input
              placeholder="Masukkan alamat lengkap"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              multiline
            />
          </Card>
        )}

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Detail Pesanan</h3>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-text-primary">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Catatan</h3>
          <Input
            placeholder="Tambahkan catatan (opsional)"
            value={notes}
            onChange={(e) => useCartStore.getState().setNotes(e.target.value)}
          />
        </Card>

        {/* Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Ringkasan Pembayaran</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">{formatRupiah(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Ongkir</span>
                <span className="text-text-primary">{formatRupiah(deliveryFee)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border pb-safe-bottom">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <p className="text-sm text-text-tertiary">Total</p>
            <p className="text-xl font-bold text-primary">{formatRupiah(total)}</p>
          </div>
          <Button onClick={handlePlaceOrder} className="flex-1 max-w-xs" size="lg" isLoading={loading}>
            Buat Pesanan
          </Button>
        </div>
      </div>
    </div>
  );
}
