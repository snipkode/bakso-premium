import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store';
import { Button, Card, EmptyState, IconButton } from '../components/ui/BaseComponents';
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
    <div className="pb-48">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </IconButton>
          <h1 className="text-2xl font-bold text-text-primary">Keranjang</h1>
        </div>
      </div>

      {/* Order Type */}
      <div className="px-4 py-4">
        <Card className="p-1 flex">
          {['dine-in', 'takeaway', 'delivery'].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all capitalize ${
                orderType === type
                  ? 'bg-primary text-white shadow-ios'
                  : 'text-text-secondary'
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
                {item.image ? (
                  <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>
                )}
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
                      className="w-7 h-7 bg-surface hover:bg-surface/80"
                    >
                      <Minus className="w-4 h-4" />
                    </IconButton>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <IconButton
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-7 h-7 bg-surface hover:bg-surface/80"
                    >
                      <Plus className="w-4 h-4" />
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                    <IconButton onClick={() => removeItem(index)} className="text-error hover:bg-error/10">
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
        <Card className="p-4 space-y-2">
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
        </Card>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border pb-safe-bottom">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <p className="text-sm text-text-tertiary">Total</p>
            <p className="text-xl font-bold text-primary">{formatRupiah(total)}</p>
          </div>
          <Button onClick={handleCheckout} className="flex-1 max-w-xs" size="lg">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
