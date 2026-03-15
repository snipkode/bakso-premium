import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Tag, X } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import { Button, Input, Card } from '../components/ui/BaseComponents';
import { formatRupiah } from '../lib/utils';
import { useState, useEffect } from 'react';
import { orderAPI, paymentAPI, voucherAPI } from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { items, getSubtotal, orderType, notes, voucherCode, clearCart, setOrderType, setVoucherCode } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [eWalletType, setEWalletType] = useState('GoPay');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  
  // Voucher state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [discount, setDiscount] = useState(0);

  // Customer data fields (for guest checkout or update)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const subtotal = getSubtotal();
  const deliveryFee = orderType === 'delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee - discount;

  // Validate voucher
  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) return;
    
    try {
      setVoucherLoading(true);
      setVoucherError('');
      
      const { data } = await voucherAPI.validateVoucher(voucherInput.toUpperCase(), subtotal);
      
      if (data.valid) {
        setAppliedVoucher(data.voucher);
        setDiscount(data.discount);
        setVoucherCode(data.voucher.code);
        setVoucherInput('');
      }
    } catch (error) {
      setVoucherError(error.response?.data?.error || 'Voucher tidak valid');
      setAppliedVoucher(null);
      setDiscount(0);
      setVoucherCode(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode(null);
    setVoucherInput('');
    setVoucherError('');
  };

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
        voucher_code: appliedVoucher?.code || undefined,
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-48">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="hover:bg-orange-100 dark:hover:bg-gray-800 rounded-full"
          >
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
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
          <h3 className="font-semibold mb-3">Tipe Pesanan</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`p-3 rounded-xl border-2 transition-all ${
                orderType === 'dine-in'
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-border bg-white/50 dark:bg-gray-600/50'
              }`}
            >
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-xs font-medium">Dine-in</div>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`p-3 rounded-xl border-2 transition-all ${
                orderType === 'takeaway'
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-border bg-white/50 dark:bg-gray-600/50'
              }`}
            >
              <div className="text-2xl mb-1">🛍️</div>
              <div className="text-xs font-medium">Takeaway</div>
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`p-3 rounded-xl border-2 transition-all ${
                orderType === 'delivery'
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-border bg-white/50 dark:bg-gray-600/50'
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
              className="w-full"
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
              className="w-full"
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
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  paymentMethod === method.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-orange-50 dark:hover:bg-gray-700'
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
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
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
                className="w-full"
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
                  className={`p-3 rounded-xl border-2 transition-all ${
                    eWalletType === wallet
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-orange-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {wallet}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
          <h3 className="font-semibold mb-3">Detail Pesanan</h3>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-text-primary font-medium">
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
            className="w-full"
          />
        </Card>

        {/* Voucher Code */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Kode Voucher
          </h3>
          {appliedVoucher ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-green-800 dark:text-green-300">{appliedVoucher.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{appliedVoucher.code}</p>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Discount: {appliedVoucher.type === 'percentage' ? `${appliedVoucher.value}%` : formatRupiah(appliedVoucher.value)}
                {appliedVoucher.type === 'percentage' && appliedVoucher.max_discount && (
                  <span className="text-xs ml-1">(Max: {formatRupiah(appliedVoucher.max_discount)})</span>
                )}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan kode voucher"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={handleValidateVoucher}
                isLoading={voucherLoading}
                disabled={!voucherInput.trim()}
                className="bg-gradient-to-r from-primary to-orange-500"
              >
                Pakai
              </Button>
            </div>
          )}
          {voucherError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{voucherError}</p>
          )}
        </Card>

        {/* Summary */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
          <h3 className="font-semibold mb-3">Ringkasan Pembayaran</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary font-medium">{formatRupiah(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Ongkir</span>
                <span className="text-text-primary font-medium">{formatRupiah(deliveryFee)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Discount</span>
                <span className="text-green-600 dark:text-green-400 font-medium">-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="border-t border-orange-100 dark:border-gray-600 pt-2 flex justify-between items-center">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
            </div>
          </div>
        </Card>

        {/* Place Order Button - Card style inside content flow (above BottomNav) */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600 sticky bottom-20 shadow-lg z-30">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-text-tertiary">Total</p>
              <p className="text-lg font-bold text-primary">{formatRupiah(total)}</p>
            </div>
            <Button
              onClick={handlePlaceOrder}
              className="flex-[2] bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30 py-3.5 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              isLoading={loading}
              disabled={items.length === 0 || loading}
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Buat Pesanan
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
