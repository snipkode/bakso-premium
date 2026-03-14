import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Flame,
  Clock,
  Info,
  Plus,
  Minus,
  Heart,
  Share2,
  ChefHat,
} from 'lucide-react';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/store';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { FadeIn, ScaleOnHover } from '@/components/ui/Animations';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, {
      quantity,
      notes: selectedNotes,
    });

    // Show success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce';
    toast.textContent = '✅ Added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-background">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Info className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">This product doesn't exist</p>
          <Button onClick={() => navigate('/menu')} className="bg-gradient-to-r from-primary to-orange-500">
            Back to Menu
          </Button>
        </Card>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-32">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Image - Hero */}
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-9xl opacity-30"
            >
              🍜
            </motion.div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.total_sold > 50 && (
            <Badge variant="warning" className="shadow-lg">
              <Flame className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {!product.is_available && (
            <Badge variant="error" className="shadow-lg animate-pulse">
              Sold Out
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Title & Price */}
        <FadeIn>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
              {product.total_sold > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.total_sold} sold
                </p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Info Cards */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-100 dark:border-green-900/30">
              <div className={`text-lg font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">In Stock</p>
            </Card>
            <Card className="p-3 text-center bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-100 dark:border-orange-900/30">
              <div className="text-lg font-bold text-orange-600">
                {product.preparation_time || 10}m
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Prep Time</p>
            </Card>
            <Card className="p-3 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">4.0 Rating</p>
            </Card>
          </div>
        </FadeIn>

        {/* Spicy Level */}
        {product.spicy_level > 0 && (
          <FadeIn delay={0.2}>
            <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">Spicy Level</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < product.spicy_level ? 'opacity-100' : 'opacity-30'}`}>
                        🌶️
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Customizations */}
        {product.customizations && product.customizations.length > 0 && (
          <FadeIn delay={0.3}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Customizations</h3>
              </div>
              <div className="space-y-3">
                {product.customizations.map((custom, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {custom.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {custom.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className="px-3 py-1.5 text-xs rounded-full bg-orange-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-orange-200 dark:border-gray-700 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {option}
                          {custom.price && custom.price > 0 && (
                            <span className="ml-1 text-gray-500">+{formatPrice(custom.price)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Notes */}
        <FadeIn delay={0.4}>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Special Requests</h3>
            </div>
            <textarea
              value={selectedNotes}
              onChange={(e) => setSelectedNotes(e.target.value)}
              placeholder="Any special requests? (e.g., less spicy, no onions)"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
            />
          </Card>
        </FadeIn>
      </div>

      {/* Bottom Action Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-orange-100 dark:border-gray-800 p-4 pb-safe-bottom z-50">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Quantity */}
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-gray-800 rounded-full px-2 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 h-auto hover:bg-orange-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="p-2 h-auto hover:bg-orange-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.is_available || product.stock === 0}
            className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {product.is_available ? `Add to Cart` : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}
