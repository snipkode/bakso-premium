import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, MapPin, Clock, Star } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import { productAPI } from '../lib/api';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/ui/BaseComponents';
import { ProductCard } from '../components/ui';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalItems } = useCartStore();
  
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts({ is_featured: true, limit: 6 }),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setFeaturedProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalItems = getTotalItems();

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                🍜 Bakso Premium
              </h1>
              <p className="text-sm text-text-tertiary">
                {isAuthenticated ? `Halo, ${user?.name}!` : 'Masuk untuk memesan'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className="relative"
            >
              {isAuthenticated ? 'Profile' : 'Login'}
              {totalItems > 0 && (
                <Badge variant="error" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <Input
                placeholder="Cari bakso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="px-4">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="px-4 py-6 space-y-8">
          {/* Categories */}
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4">Kategori</h2>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/menu?category=${category.id}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-ios-md">
                    {category.icon || '🍜'}
                  </div>
                  <span className="text-xs text-text-primary text-center line-clamp-2">
                    {category.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">Menu Favorit</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/menu')}
              >
                Lihat Semua
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          </section>

          {/* Info Cards */}
          <section className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Cepat</p>
                  <p className="text-xs text-text-tertiary">15-20 menit</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Delivery</p>
                  <p className="text-xs text-text-tertiary">Min. Rp 50rb</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Promo Banner */}
          <section>
            <Card className="p-6 bg-gradient-to-r from-primary to-secondary text-white overflow-hidden relative">
              <div className="relative z-10">
                <Badge variant="secondary" className="mb-2">Promo</Badge>
                <h3 className="text-xl font-bold mb-2">Diskon 10%</h3>
                <p className="text-sm opacity-90 mb-4">
                  Gunakan kode BAKSO10 untuk pembelian min. Rp 50.000
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/menu')}
                >
                  Pesan Sekarang
                </Button>
              </div>
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                🍜
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
