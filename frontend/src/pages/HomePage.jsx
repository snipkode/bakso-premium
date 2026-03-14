import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, Clock, Star, ChevronRight, Utensils, Truck, Flame } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { productAPI } from '@/lib/api';
import { Button, Input, Card, Badge } from '@/components/ui/BaseComponents';
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
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
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
      const [featuredRes, bestSellerRes] = await Promise.all([
        productAPI.getProducts({ is_featured: true, limit: 6, sort_by: 'featured' }),
        productAPI.getProducts({ limit: 6, sort_by: 'bestseller' }),
      ]);

      const featured = featuredRes.data.products || featuredRes.data.rows || [];
      const bestSeller = bestSellerRes.data.products || bestSellerRes.data.rows || [];

      setFeaturedProducts(featured);
      setBestSellerProducts(bestSeller);
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-background pb-24">
      {loading ? (
        <HomePageSkeleton />
      ) : (
        <>
          {/* Hero Banner - Full Color to Status Bar */}
          <div className="relative bg-gradient-to-br from-[#FF6B35] via-[#FF8C42] to-[#FFA94D] text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 text-8xl">🍜</div>
              <div className="absolute top-40 right-20 text-6xl">🍲</div>
              <div className="absolute bottom-20 left-1/2 text-7xl">🥢</div>
              <div className="absolute top-20 right-1/3 text-5xl">🍛</div>
              <div className="absolute bottom-40 left-20 text-6xl">🍱</div>
            </div>

            {/* Animated Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>

            {/* Content */}
            <div className="relative px-4 pt-12 pb-16">
              {/* Safe Area Top */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#FF6B35] to-transparent"></div>

              {/* Header */}
              <div className="flex items-center justify-between mb-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
                    🍜
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Bakso Premium</h1>
                    <p className="text-xs text-white/80">
                      {isAuthenticated ? `Halo, ${user?.name}! 👋` : 'Nikmati bakso paling enak'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                  className="relative bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg"
                >
                  {isAuthenticated ? 'Profile' : 'Login'}
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 py-0.5 text-xs font-bold shadow-md">
                      {totalItems > 99 ? '99+' : totalItems}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                  <Search />
                </div>
                <Input
                  placeholder="Cari bakso favoritmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 py-4 bg-white/95 backdrop-blur-sm text-gray-900 border-0 rounded-2xl shadow-xl placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Card
                  onClick={() => navigate('/menu')}
                  className="p-4 bg-white/20 backdrop-blur-sm border-white/30 cursor-pointer hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-3">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-sm">Pesan Sekarang</p>
                  <p className="text-xs text-white/80 mt-1">Lihat menu lengkap</p>
                </Card>
                <Card
                  onClick={() => navigate('/orders')}
                  className="p-4 bg-white/20 backdrop-blur-sm border-white/30 cursor-pointer hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-sm">Pesanan Saya</p>
                  <p className="text-xs text-white/80 mt-1">Lacak pesanan</p>
                </Card>
              </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0 leading-none">
              <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" className="text-orange-50/30"/>
              </svg>
            </div>
          </div>

          {/* Features */}
          <section className="px-4 py-6 -mt-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center bg-white dark:bg-gray-800 shadow-lg border-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Cepat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15-20 menit</p>
              </Card>
              <Card className="p-4 text-center bg-white dark:bg-gray-800 shadow-lg border-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Delivery</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min. Rp 50rb</p>
              </Card>
              <Card className="p-4 text-center bg-white dark:bg-gray-800 shadow-lg border-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Quality</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Premium</p>
              </Card>
            </div>
          </section>

          {/* Featured Products with Tabs */}
          <section className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">🔥</span> Menu Favorit
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paling banyak dipesan</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/menu')}
                className="text-primary font-semibold"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-md ${
                  activeTab === 'featured'
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-orange-100 dark:border-gray-700'
                }`}
              >
                ⭐ Featured
              </button>
              <button
                onClick={() => setActiveTab('bestseller')}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-md ${
                  activeTab === 'bestseller'
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-lg shadow-orange-500/30 scale-105'
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
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 bg-white dark:bg-gray-800 border-0"
                  >
                    <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 relative">
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
                        <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 border-0 shadow-md">⭐</Badge>
                      )}
                      {activeTab === 'bestseller' && (
                        <Badge variant="warning" className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-md">🔥</Badge>
                      )}
                      {!product.is_available && (
                        <Badge variant="error" className="absolute top-2 left-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-md">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
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
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
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
              <Card className="p-8 text-center bg-gradient-to-b from-white to-orange-50/50 dark:from-gray-800 dark:to-gray-800/50 border-0 shadow-lg">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {activeTab === 'featured' ? '🍜 Belum Ada Menu Favorit' : '🔥 Belum Ada Best Seller'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {activeTab === 'featured' 
                    ? 'Yuk coba produk favorit kami! Menu bakso paling diminati akan muncul di sini.' 
                    : 'Tunggu apa lagi? Pesan sekarang dan jadilah yang pertama menikmati bakso premium kami!'}
                </p>
              </Card>
            )}
          </section>

          {/* Promo Banner */}
          <section className="px-4 py-6">
            <Card className="p-6 bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFA94D] text-white overflow-hidden relative shadow-xl border-0">
              <div className="relative z-10">
                <Badge className="mb-2 bg-white/20 backdrop-blur-sm border-0 text-white">Promo Spesial</Badge>
                <h3 className="text-xl font-bold mb-2">Diskon 10%</h3>
                <p className="text-sm text-white/90 mb-4">
                  Gunakan kode <strong className="text-white bg-white/20 px-2 py-0.5 rounded">BAKSO10</strong> untuk pembelian min. Rp 50.000
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/menu')}
                  className="bg-white text-orange-600 hover:bg-white/90 shadow-lg font-bold"
                >
                  Pesan Sekarang
                </Button>
              </div>
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                🎉
              </div>
              <div className="absolute top-4 right-4 text-5xl opacity-10">🍜</div>
            </Card>
          </section>

          {/* CTA to Menu */}
          <section className="px-4 py-6 pb-8">
            <Card
              onClick={() => navigate('/menu')}
              className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-0"
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg">
                  <ChevronRight className="w-7 h-7 text-white" />
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
