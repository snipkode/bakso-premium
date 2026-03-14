import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, Clock, Star, ChevronRight, Utensils, Truck } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { productAPI } from '@/lib/api';
import { Button, Input, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { HomePageSkeleton } from '@/components/ui/Skeletons';
import { BaksoLoadingAnimation } from '@/components/ui/LoadingAnimation';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured'); // 'featured' or 'bestseller'

  useEffect(() => {
    // Redirect staff to their dashboard
    if (isAuthenticated && user?.role !== 'customer') {
      const roleRoutes = {
        admin: '/admin',
        kitchen: '/kitchen',
        driver: '/driver',
      };
      navigate(roleRoutes[user.role]);
      return;
    }

    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading featured and bestseller products...');

      const [featuredRes, bestSellerRes] = await Promise.all([
        productAPI.getProducts({ is_featured: true, limit: 6, sort_by: 'featured' }),
        productAPI.getProducts({ limit: 6, sort_by: 'bestseller' }),
      ]);

      console.log('Featured:', featuredRes.data);
      console.log('Best Seller:', bestSellerRes.data);

      const featured = featuredRes.data.products || featuredRes.data.rows || [];
      const bestSeller = bestSellerRes.data.products || bestSellerRes.data.rows || [];

      setFeaturedProducts(featured);
      setBestSellerProducts(bestSeller);

      console.log(`✅ Loaded ${featured.length} featured, ${bestSeller.length} best sellers`);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
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
      {loading ? (
        <HomePageSkeleton />
      ) : (
        <>
          {/* Hero Banner - Branding */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 text-8xl">🍜</div>
              <div className="absolute top-40 right-20 text-6xl">🍲</div>
              <div className="absolute bottom-20 left-1/2 text-7xl">🥢</div>
            </div>

            {/* Content */}
            <div className="relative px-4 py-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    🍜 Bakso Premium
                  </h1>
                  <p className="text-white/90">
                    {isAuthenticated ? `Selamat datang, ${user?.name}!` : 'Nikmati bakso paling enak'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                  className="relative bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  {isAuthenticated ? 'Profile' : 'Login'}
                  {totalItems > 0 && (
                    <Badge variant="error" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cari bakso favoritmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 py-4 bg-white text-gray-900 border-0 rounded-xl"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Card
                  onClick={() => navigate('/menu')}
                  className="p-4 bg-white/20 backdrop-blur-sm border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <Utensils className="w-6 h-6 mb-2 text-white" />
                  <p className="font-semibold text-sm">Pesan Sekarang</p>
                  <p className="text-xs text-white/80">Lihat menu lengkap</p>
                </Card>
                <Card
                  onClick={() => navigate('/orders')}
                  className="p-4 bg-white/20 backdrop-blur-sm border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <Clock className="w-6 h-6 mb-2 text-white" />
                  <p className="font-semibold text-sm">Pesanan Saya</p>
                  <p className="text-xs text-white/80">Lacak pesanan</p>
                </Card>
              </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" className="text-background"/>
              </svg>
            </div>
          </div>

          {/* Features */}
          <section className="px-4 py-6">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-semibold">Cepat</p>
                <p className="text-xs text-gray-500">15-20 menit</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold">Delivery</p>
                <p className="text-xs text-gray-500">Min. Rp 50rb</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-warning" />
                </div>
                <p className="text-sm font-semibold">Quality</p>
                <p className="text-xs text-gray-500">Premium</p>
              </Card>
            </div>
          </section>

          {/* Featured Products with Tabs */}
          <section className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu Favorit</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Paling banyak dipesan</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/menu')}
                className="text-primary"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md ${
                  activeTab === 'featured'
                    ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-primary/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-orange-100 dark:border-gray-700'
                }`}
              >
                ⭐ Featured
              </button>
              <button
                onClick={() => setActiveTab('bestseller')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md ${
                  activeTab === 'bestseller'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-orange-100 dark:border-gray-700'
                }`}
              >
                🔥 Best Seller
              </button>
            </div>

            {/* Products Grid */}
            {(activeTab === 'featured' ? featuredProducts : bestSellerProducts).length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {(activeTab === 'featured' ? featuredProducts : bestSellerProducts).map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="hidden">
                          <img src="/placeholder.svg" alt="placeholder" />
                        </div>
                      )}
                      {activeTab === 'featured' && (
                        <Badge className="absolute top-2 right-2 text-xs">⭐</Badge>
                      )}
                      {activeTab === 'bestseller' && (
                        <Badge variant="warning" className="absolute top-2 right-2 text-xs">🔥</Badge>
                      )}
                      {!product.is_available && (
                        <Badge variant="error" className="absolute top-2 left-2 text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-primary font-bold text-sm">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Stock: {product.stock}
                        </span>
                        {activeTab === 'bestseller' && product.total_sold > 0 && (
                          <span className="text-xs text-orange-600 font-medium">
                            Sold: {product.total_sold}
                          </span>
                        )}
                        {product.spicy_level > 0 && (
                          <span className="text-xs">{'🌶️'.repeat(product.spicy_level)}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No {activeTab === 'featured' ? 'featured' : 'best seller'} products available
                </p>
                <Button onClick={() => navigate('/menu')} variant="secondary">
                  Browse All Products
                </Button>
              </Card>
            )}
          </section>

          {/* Promo Banner */}
          <section className="px-4 py-6">
            <Card className="p-6 bg-gradient-to-r from-warning to-orange-500 text-white overflow-hidden relative">
              <div className="relative z-10">
                <Badge variant="secondary" className="mb-2">Promo Spesial</Badge>
                <h3 className="text-xl font-bold mb-2">Diskon 10%</h3>
                <p className="text-sm text-white/90 mb-4">
                  Gunakan kode <strong className="text-white">BAKSO10</strong> untuk pembelian min. Rp 50.000
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/menu')}
                  className="bg-white text-orange-600 hover:bg-white/90"
                >
                  Pesan Sekarang
                </Button>
              </div>
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                🎉
              </div>
            </Card>
          </section>

          {/* CTA to Menu */}
          <section className="px-4 py-6">
            <Card
              onClick={() => navigate('/menu')}
              className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Lihat Menu Lengkap
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temukan semua menu favoritmu
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
