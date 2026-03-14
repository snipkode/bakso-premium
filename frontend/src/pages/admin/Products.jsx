import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { productAPI } from '../../lib/api';
import { Card, Button, Input, Badge, LoadingSpinner, Pagination } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';

// Beautiful Bakso SVG Placeholder Component
function BaksoPlaceholder() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background Circle */}
      <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.3" />
      
      {/* Bowl */}
      <ellipse cx="100" cy="140" rx="70" ry="25" fill="url(#bowlGradient)" />
      <path d="M30 140C30 140 40 175 100 175C160 175 170 140 170 140" fill="url(#bowlShadow)" />
      
      {/* Soup Base */}
      <ellipse cx="100" cy="135" rx="60" ry="20" fill="url(#soupGradient)" />
      
      {/* Bakso Balls - Main Feature */}
      <circle cx="70" cy="130" r="18" fill="url(#baksoGradient1)" />
      <circle cx="130" cy="130" r="18" fill="url(#baksoGradient2)" />
      <circle cx="100" cy="115" r="18" fill="url(#baksoGradient3)" />
      <circle cx="100" cy="145" r="15" fill="url(#baksoGradient4)" />
      
      {/* Bakso Highlights */}
      <circle cx="75" cy="125" r="6" fill="white" opacity="0.3" />
      <circle cx="135" cy="125" r="6" fill="white" opacity="0.3" />
      <circle cx="105" cy="110" r="6" fill="white" opacity="0.3" />
      <circle cx="105" cy="140" r="5" fill="white" opacity="0.3" />
      
      {/* Noodles */}
      <path d="M50 135C50 135 65 128 100 128C135 128 150 135 150 135" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M45 142C45 142 60 135 100 135C140 135 155 142 155 142" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M55 128C55 128 70 122 100 122C130 122 145 128 145 128" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      
      {/* Green Onions */}
      <ellipse cx="80" cy="125" rx="8" ry="3" fill="#10B981" opacity="0.8" transform="rotate(-30 80 125)" />
      <ellipse cx="120" cy="125" rx="8" ry="3" fill="#10B981" opacity="0.8" transform="rotate(30 120 125)" />
      <ellipse cx="100" cy="110" rx="6" ry="2.5" fill="#10B981" opacity="0.7" />
      <ellipse cx="90" cy="140" rx="7" ry="2.5" fill="#10B981" opacity="0.8" transform="rotate(-20 90 140)" />
      
      {/* Celery Leaves */}
      <path d="M110 138Q120 135 125 140Q120 145 110 142" fill="#059669" opacity="0.7" />
      <path d="M85 115Q90 110 95 115Q90 120 85 115" fill="#059669" opacity="0.7" />
      
      {/* Steam/Wisps */}
      <path d="M70 90C70 90 73 80 70 70" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M100 85C100 85 103 75 100 65" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M130 90C130 90 133 80 130 70" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      
      {/* Chopsticks */}
      <rect x="145" y="60" width="8" height="80" rx="2" fill="url(#chopstickGradient1)" transform="rotate(25 145 60)" />
      <rect x="155" y="60" width="8" height="80" rx="2" fill="url(#chopstickGradient2)" transform="rotate(25 155 60)" />
      
      {/* Decorative Dots */}
      <circle cx="60" cy="100" r="3" fill="#FCD34D" opacity="0.6" />
      <circle cx="140" cy="100" r="3" fill="#FCD34D" opacity="0.6" />
      <circle cx="100" cy="165" r="3" fill="#FCD34D" opacity="0.6" />
      
      {/* Gradients */}
      <defs>
        <radialGradient id="bgGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCD34D" />
        </radialGradient>
        
        <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        
        <linearGradient id="bowlShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        
        <radialGradient id="soupGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        
        <radialGradient id="baksoGradient1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        
        <radialGradient id="baksoGradient2" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        
        <radialGradient id="baksoGradient3" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        
        <radialGradient id="baksoGradient4" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        
        <linearGradient id="chopstickGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        
        <linearGradient id="chopstickGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filterCategory]);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          category: filterCategory !== 'all' ? filterCategory : undefined,
          search: searchQuery || undefined,
        }),
      ]);
      setCategories(categoriesRes.data.categories || []);
      const productsData = productsRes.data.products || productsRes.data.rows || [];
      setProducts(productsData);
      setTotalCount(productsRes.data.count || productsData.length);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await productAPI.toggleAvailability(productId);
      loadData();
    } catch (error) {
      alert('Gagal update status produk');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await productAPI.deleteProduct(productId);
      loadData();
      alert('✅ Produk berhasil dihapus');
    } catch (error) {
      alert('Gagal menghapus produk');
    }
  };

  const filteredProducts = products;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCount} products
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Add Product</span>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
              {product.image && product.image.trim() !== '' ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Placeholder */}
              <div className={`flex items-center justify-center h-full p-4 ${product.image && product.image.trim() !== '' ? 'hidden' : ''}`}>
                <BaksoPlaceholder />
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && (
                  <Badge className="text-xs px-1.5 py-0.5 bg-yellow-500 text-white">
                    ⭐
                  </Badge>
                )}
                {!product.is_available && (
                  <Badge className="text-xs px-1.5 py-0.5 bg-red-500 text-white">
                    Unavailable
                  </Badge>
                )}
              </div>

              {/* Toggle Availability */}
              <button
                onClick={() => handleToggleAvailability(product.id, product.is_available)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                {product.is_available ? (
                  <ToggleRight className="w-4 h-4 text-green-400" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-red-400" />
                )}
              </button>

              {/* Quick Actions Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight mb-1.5">
                {product.name}
              </h3>
              <p className="text-primary font-bold text-sm">
                {formatRupiah(product.price)}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < (product.spicy_level || 0)
                          ? 'text-red-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      🌶️
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Stock: {product.stock || 0}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada produk ditemukan</p>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs font-medium"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalCount} products
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Fitur tambah/edit produk tersedia di halaman admin
            </p>
            <Button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="w-full">
              Tutup
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
