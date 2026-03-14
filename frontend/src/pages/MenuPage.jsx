import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { productAPI } from '@/lib/api';
import { Button, Input, Card, Badge, LoadingSpinner } from '@/components/ui/BaseComponents';

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
    <div className="pb-24">
      {/* Header - Compact */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredProducts.length} items available
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

          {/* Search & Filter Toggle */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadData()}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    loadData();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-white' : ''}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-gray-600 dark:text-gray-400 hover:bg-secondary/80'
                }`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-gray-600 dark:text-gray-400 hover:bg-secondary/80'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="px-4 py-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
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
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl opacity-30">🍜</span>
                      </div>
                    )}
                    {!product.is_available && (
                      <Badge variant="error" className="absolute top-2 left-2 text-xs">
                        Unavailable
                      </Badge>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 right-2 text-xs">⭐</Badge>
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
                      <span className={`text-xs ${product.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {product.stock === 0 ? 'Habis' : `Stock: ${product.stock}`}
                      </span>
                      {product.spicy_level > 0 && (
                        <span className="text-xs">{'🌶️'.repeat(product.spicy_level)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Tidak ada menu ditemukan
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                loadData();
              }}>
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
