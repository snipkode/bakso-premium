import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import { Button, Input, Card } from '../components/ui/BaseComponents';
import { formatRupiah } from '../lib/utils';
import { useState } from 'react';
import { orderAPI, paymentAPI } from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { items, getSubtotal, orderType, notes, voucherCode, clearCart, setOrderType } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [eWalletType, setEWalletType] = useState('GoPay');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  
  // Customer data fields (for guest checkout or update)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const subtotal = getSubtotal();
  const deliveryFee = orderType === 'delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    // Validation - Customer Data
    if (!customerName || !customerPhone) {
      alert('Mohon isi nama dan nomor telepon');
      return;
    }
    
    // Validation - Order Type
    if (orderType === 'dine-in' && !tableNumber) {
      alert('Mohon isi nomor meja');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Mohon isi alamat pengiriman');
      return;
    }
    if (items.length === 0) {
      alert('Keranjang kosong');
      return;
    }

    setLoading(true);
    try {
      // Update user data if changed
      if (user && (user.name !== customerName || user.phone !== customerPhone)) {
        updateUser({ name: customerName, phone: customerPhone });
      }

      // Step 1: Create Order (matching E2E test: test-workflow-e2e.js)
      const orderData = {
        order_type: orderType,
        table_number: orderType === 'dine-in' ? tableNumber : undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
        notes,
      };

      const orderResponse = await orderAPI.createOrder(orderData);
      const orderId = orderResponse.data.order.id;

      // Step 2: Create Payment (matching E2E test workflow)
      const paymentData = {
        order_id: orderId,
        method: paymentMethod,
        bank_name: paymentMethod === 'bank_transfer' ? bankName : undefined,
        account_number: paymentMethod === 'bank_transfer' ? accountNumber : undefined,
        e_wallet_type: paymentMethod === 'e_wallet' ? eWalletType : undefined,
        transaction_id: `TRX${Date.now()}`,
      };

      await paymentAPI.createPayment(paymentData);

      // Success - clear cart and navigate
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Gagal membuat pesanan';
      
      // Handle business rule: New customers can't order delivery
      if (error.response?.status === 403) {
        alert('Untuk pesanan delivery, silakan lakukan pesanan takeaway/dine-in terlebih dahulu.');
        setOrderType('takeaway');
      } else {
        alert(errorMessage);
      }
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
        {/* Customer Data Form */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>👤</span> Data Pelanggan
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Nama Lengkap
              </label>
              <Input
                placeholder="Masukkan nama Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Nomor Telepon / WhatsApp
              </label>
              <Input
                type="tel"
                placeholder="081234567890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full"
                pattern="[0-9]*"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Nomor akan digunakan untuk notifikasi pesanan
              </p>
            </div>
          </div>
        </Card>

        {/* Order Type Selection */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Tipe Pesanan</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`p-3 rounded-lg border-2 ${
                orderType === 'dine-in'
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              }`}
            >
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-xs font-medium">Dine-in</div>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`p-3 rounded-lg border-2 ${
                orderType === 'takeaway'
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              }`}
            >
              <div className="text-2xl mb-1">🛍️</div>
              <div className="text-xs font-medium">Takeaway</div>
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`p-3 rounded-lg border-2 ${
                orderType === 'delivery'
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              }`}
            >
              <div className="text-2xl mb-1">🛵</div>
              <div className="text-xs font-medium">Delivery</div>
            </button>
          </div>
        </Card>

        {/* Conditional Fields */}
        {orderType === 'dine-in' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Nomor Meja</h3>
            <Input
              placeholder="Contoh: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </Card>
        )}

        {orderType === 'delivery' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
            <Input
              placeholder="Masukkan alamat lengkap"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              multiline
              rows={3}
            />
          </Card>
        )}

        {/* Payment Method */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Metode Pembayaran</h3>
          <div className="space-y-2">
            {[
              { value: 'bank_transfer', label: 'Transfer Bank', icon: '🏦' },
              { value: 'qris', label: 'QRIS', icon: '📱' },
              { value: 'e_wallet', label: 'E-Wallet', icon: '💳' },
              { value: 'cod', label: 'Bayar di Tempat', icon: '💵' },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 ${
                  paymentMethod === method.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Payment Details */}
        {paymentMethod === 'bank_transfer' && (
          <Card className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="BCA">BCA</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="Permata">Permata</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Rekening</label>
              <Input
                placeholder="Contoh: 1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                type="tel"
              />
            </div>
          </Card>
        )}

        {paymentMethod === 'e_wallet' && (
          <Card className="p-4">
            <label className="block text-sm font-medium mb-1">Pilih E-Wallet</label>
            <div className="grid grid-cols-2 gap-2">
              {['GoPay', 'OVO', 'Dana', 'ShopeePay'].map((wallet) => (
                <button
                  key={wallet}
                  onClick={() => setEWalletType(wallet)}
                  className={`p-2 rounded-lg border-2 ${
                    eWalletType === wallet
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  {wallet}
                </button>
              ))}
            </div>
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
          <Button 
            onClick={handlePlaceOrder} 
            className="flex-1 max-w-xs" 
            size="lg" 
            isLoading={loading}
            disabled={items.length === 0}
          >
            {loading ? 'Memproses...' : 'Buat Pesanan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
