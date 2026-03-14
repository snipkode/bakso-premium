import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Utensils, Flame, Star } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { productAPI } from '@/lib/api';
import { Button, Input, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';
import { FadeIn, StaggerGrid, ScaleOnHover, PulseBadge } from '@/components/ui/Animations';

export default function MenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        }),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setProducts(productsRes.data.products || productsRes.data.rows || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalItems = getTotalItems();

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header - Appetizing Design */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-3">
          {/* Title & Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Our Menu</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredProducts.length} delicious items
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className="relative shadow-md"
            >
              {isAuthenticated ? 'Profile' : 'Login'}
              {totalItems > 0 && (
                <Badge variant="error" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs shadow-lg">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <Input
                placeholder="Find your craving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadData()}
                className="pl-10 border-orange-100 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    loadData();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              className="shadow-md"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Filters - Animated */}
          {showFilters && (
            <FadeIn delay={0.1}>
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-md ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-primary/30'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-orange-100 dark:border-gray-700'
                  }`}
                >
                  All Items
                </button>
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-md ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-primary/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-orange-100 dark:border-gray-700'
                    }`}
                  >
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Flame className="w-16 h-16 text-primary opacity-20" />
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          {filteredProducts.length > 0 ? (
            <StaggerGrid>
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product, index) => (
                  <FadeIn key={product.id} delay={index * 0.05}>
                    <ScaleOnHover>
                      <Card
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="overflow-hidden cursor-pointer group shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-orange-100 dark:border-gray-800"
                      >
                        {/* Image Section */}
                        <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                          
                          {/* Badges with Animation */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {!product.is_available && (
                              <PulseBadge>
                                <Badge variant="error" className="text-xs shadow-lg">
                                  Sold Out
                                </Badge>
                              </PulseBadge>
                            )}
                            {product.is_featured && (
                              <Badge className="text-xs shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 border-0">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {product.total_sold > 50 && (
                              <Badge variant="warning" className="text-xs shadow-lg">
                                <Flame className="w-3 h-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                          </div>

                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-xs font-medium">Tap to view details</p>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3 bg-white dark:bg-gray-900">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-primary font-bold text-sm">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                            </p>
                            {product.total_sold > 0 && (
                              <span className="text-xs text-gray-400">
                                · {product.total_sold} sold
                              </span>
                            )}
                          </div>

                          {/* Stock & Spicy */}
                          <div className="flex items-center justify-between">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              product.stock === 0 
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : product.stock <= 10
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {product.stock === 0 ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock'}
                            </div>
                            {product.spicy_level > 0 && (
                              <div className="flex items-center gap-0.5">
                                {[...Array(product.spicy_level)].map((_, i) => (
                                  <span key={i} className="text-xs">🌶️</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </ScaleOnHover>
                  </FadeIn>
                ))}
              </div>
            </StaggerGrid>
          ) : (
            <FadeIn>
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mx-auto mb-4"
                >
                  <Search className="w-12 h-12 text-primary" />
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg font-medium">
                  No items found
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    loadData();
                  }}
                  className="bg-gradient-to-r from-primary to-orange-500 shadow-lg shadow-primary/30"
                >
                  Reset Filters
                </Button>
              </div>
            </FadeIn>
          )}
        </div>
      )}
    </div>
  );
}
