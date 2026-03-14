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
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/store';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { FadeIn, ScaleOnHover } from '@/components/ui/Animations';
import { ProductDetailSkeleton } from '@/components/ui/Skeletons';
import { BaksoLoadingAnimation } from '@/components/ui/LoadingAnimation';

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
    toast.textContent = '✅ Berhasil ditambahkan!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-background">
        <Card className="p-8 text-center max-w-sm mx-4">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Sad face */}
              <circle cx="50" cy="50" r="45" fill="#FEE2E2" />
              <circle cx="50" cy="50" r="35" fill="#FECACA" />
              {/* Eyes */}
              <circle cx="35" cy="40" r="5" fill="#7F1D1D" />
              <circle cx="65" cy="40" r="5" fill="#7F1D1D" />
              {/* Sad mouth */}
              <path d="M30 65 Q50 55 70 65" stroke="#7F1D1D" strokeWidth="4" fill="none" />
              {/* Tear */}
              <ellipse cx="35" cy="52" rx="3" ry="5" fill="#60A5FA" opacity="0.6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Maaf, produk yang Anda cari tidak tersedia
          </p>
          <Button 
            onClick={() => navigate('/menu')} 
            className="bg-gradient-to-r from-primary to-orange-500 w-full"
          >
            Kembali ke Menu
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

  const spicyLabels = ['Tidak Pedas', 'Sedikit Pedas', 'Pedas', 'Sangat Pedas', 'Extra Pedas', 'Super Pedas'];

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
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <text x="10" y="30" fontSize="20">🍜</text>
              <text x="50" y="20" fontSize="20">🍲</text>
              <text x="80" y="40" fontSize="20">🍛</text>
              <text x="20" y="60" fontSize="20">🍱</text>
              <text x="60" y="70" fontSize="20">🍢</text>
              <text x="90" y="80" fontSize="20">🍜</text>
            </svg>
          </div>
          
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
            <div className="flex-1 pr-4">
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
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </p>
              {product.total_sold > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {product.total_sold} terjual
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
              <p className="text-xs text-gray-600 dark:text-gray-400">Stok Tersedia</p>
            </Card>
            <Card className="p-3 text-center bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-100 dark:border-orange-900/30">
              <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {product.preparation_time || 15}m
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Waktu Siap</p>
            </Card>
            <Card className="p-3 text-center bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-100 dark:border-yellow-900/30">
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">4.0 (120)</p>
            </Card>
          </div>
        </FadeIn>

        {/* Quality Badges */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Kualitas Premium</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bahan segar setiap hari</p>
              </div>
            </Card>
            <Card className="p-3 flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-100 dark:border-purple-900/30">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Pengiriman Cepat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15-20 menit</p>
              </div>
            </Card>
          </div>
        </FadeIn>

        {/* Spicy Level */}
        {product.spicy_level > 0 && (
          <FadeIn delay={0.2}>
            <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900 dark:text-red-100">
                    Tingkat Pedas: {spicyLabels[product.spicy_level] || 'Super Pedas'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-lg transition-all ${
                          i < product.spicy_level 
                            ? 'opacity-100 scale-110' 
                            : 'opacity-20 scale-90'
                        }`}
                      >
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
        {Array.isArray(product.customizations) && product.customizations.length > 0 && (
          <FadeIn delay={0.3}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900 dark:text-white">Pilihan Tambahan</h3>
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
                          className="px-4 py-2 text-sm rounded-full bg-orange-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-orange-200 dark:border-gray-700 hover:bg-orange-100 dark:hover:bg-gray-700 hover:border-orange-300 dark:hover:border-gray-600 transition-all"
                        >
                          {option}
                          {custom.price && custom.price > 0 && (
                            <span className="ml-1 text-orange-600 font-medium">
                              +{formatPrice(custom.price)}
                            </span>
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
              <h3 className="font-bold text-gray-900 dark:text-white">Catatan Pesanan</h3>
            </div>
            <textarea
              value={selectedNotes}
              onChange={(e) => setSelectedNotes(e.target.value)}
              placeholder="Contoh: Jangan terlalu pedas, tanpa daun bawang, dll."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
            />
          </Card>
        </FadeIn>
      </div>

      {/* Bottom Action Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-orange-100 dark:border-gray-800 p-4 pb-safe-bottom z-50 shadow-lg">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Quantity */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-full px-2 py-2 border border-orange-200 dark:border-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 h-8 w-8 hover:bg-orange-200 dark:hover:bg-gray-600 rounded-full"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-lg">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="p-2 h-8 w-8 hover:bg-orange-200 dark:hover:bg-gray-600 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.is_available || product.stock === 0}
            className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-full font-semibold"
          >
            <ShoppingBag className="w-5 h-5 mr-2 inline" />
            {product.is_available 
              ? `Tambah • ${formatPrice(product.price * quantity)}` 
              : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}
