import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, Clock, Star, ChevronRight, Utensils, Truck, Flame } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { productAPI } from '@/lib/api';
import { Button, Input, Card, Badge, ImageWithFallback } from '@/components/ui/BaseComponents';
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

          {/* Features - Enhanced Cards */}
          <section className="px-4 py-6 -mt-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/10 shadow-xl border border-green-100/50 dark:border-green-900/20 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="relative mb-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Cepat</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">15-20 menit</p>
              </Card>
              <Card className="p-3 text-center bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10 shadow-xl border border-blue-100/50 dark:border-blue-900/20 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="relative mb-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Delivery</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">Min. Rp 50rb</p>
              </Card>
              <Card className="p-3 text-center bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-800 dark:to-orange-900/10 shadow-xl border border-orange-100/50 dark:border-orange-900/20 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="relative mb-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Quality</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">Premium</p>
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
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fallbackType={product.category?.name?.toLowerCase().includes('minum') || product.name?.toLowerCase().includes('es ') || product.name?.toLowerCase().includes('jus') ? 'drink' : 'food'}
                        retryLimit={3}
                        imageTimeout={3000}
                      />
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
              <Card className="p-8 text-center bg-gradient-to-b from-white to-orange-50/50 dark:from-gray-800 dark:to-gray-800/50 border-0 shadow-lg overflow-hidden relative">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <text x="20" y="40" fontSize="20">🍜</text>
                    <text x="60" y="30" fontSize="20">🍲</text>
                    <text x="100" y="50" fontSize="20">🍛</text>
                    <text x="140" y="35" fontSize="20">🍱</text>
                    <text x="30" y="80" fontSize="20">🍢</text>
                    <text x="80" y="70" fontSize="20">🍡</text>
                    <text x="130" y="85" fontSize="20">🍜</text>
                    <text x="50" y="120" fontSize="20">🍲</text>
                    <text x="100" y="110" fontSize="20">🍛</text>
                    <text x="150" y="125" fontSize="20">🍱</text>
                  </svg>
                </div>

                <div className="relative z-10">
                  {/* Aesthetic SVG Character - Bakso Seller */}
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      {/* Background Circle */}
                      <circle cx="60" cy="60" r="55" fill="url(#baksoGradient)" opacity="0.2"/>
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="baksoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF6B35"/>
                          <stop offset="100%" stopColor="#FFA94D"/>
                        </linearGradient>
                        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FED7AA"/>
                          <stop offset="100%" stopColor="#FDBA74"/>
                        </linearGradient>
                        <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF6B35"/>
                          <stop offset="100%" stopColor="#EA580C"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Body */}
                      <ellipse cx="60" cy="95" rx="30" ry="20" fill="url(#shirtGradient)"/>
                      
                      {/* Head */}
                      <circle cx="60" cy="55" r="22" fill="url(#skinGradient)"/>
                      
                      {/* Hair */}
                      <path d="M38 50 Q40 35 60 35 Q80 35 82 50 Q85 45 82 40 Q80 30 60 30 Q40 30 38 40 Q35 45 38 50" fill="#1F2937"/>
                      <circle cx="60" cy="38" r="15" fill="#1F2937"/>
                      
                      {/* Happy Eyes */}
                      <path d="M48 52 Q52 48 56 52" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M64 52 Q68 48 72 52" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      
                      {/* Smile */}
                      <path d="M52 62 Q60 70 68 62" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      
                      {/* Blush */}
                      <ellipse cx="45" cy="58" rx="4" ry="2" fill="#FCA5A5" opacity="0.6"/>
                      <ellipse cx="75" cy="58" rx="4" ry="2" fill="#FCA5A5" opacity="0.6"/>
                      
                      {/* Arm holding bakso cart */}
                      <path d="M35 85 Q25 90 20 80" stroke="url(#skinGradient)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                      
                      {/* Bakso Cart */}
                      <rect x="5" y="75" width="20" height="15" rx="2" fill="#78350F"/>
                      <rect x="7" y="77" width="16" height="8" rx="1" fill="#FCD34D"/>
                      
                      {/* Steam from bakso */}
                      <path d="M12 72 Q14 68 12 64" stroke="#9CA3AF" strokeWidth="2" fill="none" opacity="0.6">
                        <animate attributeName="d" values="M12 72 Q14 68 12 64;M12 70 Q10 66 12 62;M12 72 Q14 68 12 64" dur="1s" repeatCount="indefinite"/>
                      </path>
                      <path d="M18 70 Q20 66 18 62" stroke="#9CA3AF" strokeWidth="2" fill="none" opacity="0.6">
                        <animate attributeName="d" values="M18 70 Q20 66 18 62;M18 68 Q16 64 18 60;M18 70 Q20 66 18 62" dur="1.2s" repeatCount="indefinite"/>
                      </path>
                      
                      {/* Towel on shoulder */}
                      <path d="M85 80 Q90 85 88 90" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none"/>
                      
                      {/* Sparkles */}
                      <text x="95" y="35" fontSize="10" opacity="0.8">✨</text>
                      <text x="90" y="50" fontSize="8" opacity="0.6">✨</text>
                      <text x="25" y="30" fontSize="12" opacity="0.7">⭐</text>
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {activeTab === 'featured' ? '🍜 Belum Ada Menu Favorit' : '🔥 Belum Ada Best Seller'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {activeTab === 'featured'
                      ? 'Yuk coba produk favorit kami! Menu bakso paling diminati akan muncul di sini.'
                      : 'Tunggu apa lagi? Pesan sekarang dan jadilah yang pertama menikmati bakso premium kami!'}
                  </p>
                  
                  {/* Food emojis decoration */}
                  <div className="flex justify-center gap-2 text-xl">
                    <span className="animate-bounce" style={{animationDelay: '0ms'}}>🍜</span>
                    <span className="animate-bounce" style={{animationDelay: '100ms'}}>🍲</span>
                    <span className="animate-bounce" style={{animationDelay: '200ms'}}>🍛</span>
                    <span className="animate-bounce" style={{animationDelay: '300ms'}}>🍱</span>
                    <span className="animate-bounce" style={{animationDelay: '400ms'}}>🥢</span>
                  </div>
                </div>
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
