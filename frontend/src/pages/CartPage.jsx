import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store';
import { Button, Card, EmptyState, IconButton, ImageWithFallback } from '../components/ui/BaseComponents';
import { formatRupiah } from '../lib/utils';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, setOrderType, orderType } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = orderType === 'delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-2xl font-bold text-text-primary">Keranjang</h1>
        </div>
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-text-tertiary" />}
          title="Keranjang Kosong"
          description="Tambahkan menu favoritmu untuk mulai memesan"
          action={
            <Button onClick={() => navigate('/menu')} className="mt-4">
              Lihat Menu
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-48">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => navigate(-1)} className="hover:bg-orange-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </IconButton>
          <h1 className="text-2xl font-bold text-text-primary">Keranjang</h1>
        </div>
      </div>

      {/* Order Type */}
      <div className="px-4 py-4">
        <Card className="p-1 flex bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
          {['dine-in', 'takeaway', 'delivery'].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all capitalize text-sm ${
                orderType === type
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
            >
              {type === 'dine-in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
            </button>
          ))}
        </Card>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-3 flex gap-3">
              <div className="w-20 h-20 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.product_name}
                  className="rounded-lg"
                  fallbackType="bowl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary line-clamp-1">{item.product_name}</h4>
                {item.customizations && Object.keys(item.customizations).length > 0 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(', ')}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-7 h-7 bg-orange-50 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-gray-600 rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </IconButton>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <IconButton
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-7 h-7 bg-orange-50 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-gray-600 rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-sm">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                    <IconButton onClick={() => removeItem(index)} className="text-error hover:bg-error/10 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="px-4 mt-6">
        <Card className="p-4 space-y-2 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600">
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
          <div className="border-t border-orange-100 dark:border-gray-600 pt-2 flex justify-between items-center">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
          </div>
        </Card>
      </div>

      {/* Checkout Button - Card style inside content flow (above BottomNav) */}
      <div className="px-4 mt-4 space-y-3">
        {/* Continue Shopping Button */}
        <Button
          onClick={() => navigate('/menu')}
          variant="secondary"
          className="w-full bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-gray-600 text-primary hover:bg-orange-50 dark:hover:bg-gray-700 py-3.5 rounded-full font-semibold text-sm"
        >
          🛒 Tambah Pesanan
        </Button>

        {/* Checkout Button */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600 sticky bottom-20 shadow-lg z-30">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-text-tertiary">Total</p>
              <p className="text-lg font-bold text-primary">{formatRupiah(total)}</p>
            </div>
            <Button 
              onClick={handleCheckout} 
              className="flex-[2] bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30 py-3.5 rounded-full font-semibold text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2 inline" />
              Checkout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
