import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight, Package, AlertTriangle, TrendingUp, RefreshCw, XCircle } from 'lucide-react';
import { productAPI } from '../../lib/api';
import { Card, Button, Input, Badge, LoadingSpinner, Pagination } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';

// Beautiful Bakso SVG Placeholder Component
function BaksoPlaceholder() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.3" />
      <ellipse cx="100" cy="140" rx="70" ry="25" fill="url(#bowlGradient)" />
      <path d="M30 140C30 140 40 175 100 175C160 175 170 140 170 140" fill="url(#bowlShadow)" />
      <ellipse cx="100" cy="135" rx="60" ry="20" fill="url(#soupGradient)" />
      <circle cx="70" cy="130" r="18" fill="url(#baksoGradient1)" />
      <circle cx="130" cy="130" r="18" fill="url(#baksoGradient2)" />
      <circle cx="100" cy="115" r="18" fill="url(#baksoGradient3)" />
      <circle cx="100" cy="145" r="15" fill="url(#baksoGradient4)" />
      <circle cx="75" cy="125" r="6" fill="white" opacity="0.3" />
      <circle cx="135" cy="125" r="6" fill="white" opacity="0.3" />
      <circle cx="105" cy="110" r="6" fill="white" opacity="0.3" />
      <circle cx="105" cy="140" r="5" fill="white" opacity="0.3" />
      <path d="M50 135C50 135 65 128 100 128C135 128 150 135 150 135" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M45 142C45 142 60 135 100 135C140 135 155 142 155 142" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M55 128C55 128 70 122 100 122C130 122 145 128 145 128" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="80" cy="125" rx="8" ry="3" fill="#10B981" opacity="0.8" transform="rotate(-30 80 125)" />
      <ellipse cx="120" cy="125" rx="8" ry="3" fill="#10B981" opacity="0.8" transform="rotate(30 120 125)" />
      <ellipse cx="100" cy="110" rx="6" ry="2.5" fill="#10B981" opacity="0.7" />
      <ellipse cx="90" cy="140" rx="7" ry="2.5" fill="#10B981" opacity="0.8" transform="rotate(-20 90 140)" />
      <path d="M110 138Q120 135 125 140Q120 145 110 142" fill="#059669" opacity="0.7" />
      <path d="M85 115Q90 110 95 115Q90 120 85 115" fill="#059669" opacity="0.7" />
      <path d="M70 90C70 90 73 80 70 70" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M100 85C100 85 103 75 100 65" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M130 90C130 90 133 80 130 70" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <rect x="145" y="60" width="8" height="80" rx="2" fill="url(#chopstickGradient1)" transform="rotate(25 145 60)" />
      <rect x="155" y="60" width="8" height="80" rx="2" fill="url(#chopstickGradient2)" transform="rotate(25 155 60)" />
      <circle cx="60" cy="100" r="3" fill="#FCD34D" opacity="0.6" />
      <circle cx="140" cy="100" r="3" fill="#FCD34D" opacity="0.6" />
      <circle cx="100" cy="165" r="3" fill="#FCD34D" opacity="0.6" />
      <defs>
        <radialGradient id="bgGradient" cx="0%" cy="0%" r="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#FCD34D" /></radialGradient>
        <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1F2937" /><stop offset="100%" stopColor="#374151" /></linearGradient>
        <linearGradient id="bowlShadow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#111827" /><stop offset="100%" stopColor="#1F2937" /></linearGradient>
        <radialGradient id="soupGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor="#F59E0B" /></radialGradient>
        <radialGradient id="baksoGradient1" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#A0522D" /><stop offset="100%" stopColor="#8B4513" /></radialGradient>
        <radialGradient id="baksoGradient2" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#A0522D" /><stop offset="100%" stopColor="#8B4513" /></radialGradient>
        <radialGradient id="baksoGradient3" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#A0522D" /><stop offset="100%" stopColor="#8B4513" /></radialGradient>
        <radialGradient id="baksoGradient4" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#A0522D" /><stop offset="100%" stopColor="#8B4513" /></radialGradient>
        <linearGradient id="chopstickGradient1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D97706" /><stop offset="100%" stopColor="#B45309" /></linearGradient>
        <linearGradient id="chopstickGradient2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B45309" /><stop offset="100%" stopColor="#92400E" /></linearGradient>
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
  const [filterStock, setFilterStock] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image: '',
    is_featured: false,
    spicy_level: 0,
    stock: 100,
    min_stock: 10,
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    available: 0,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filterStock changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStock]);

  // Auto-navigate if current page is empty
  useEffect(() => {
    if (products.length === 0 && currentPage > 1 && totalCount > 0) {
      const lastPage = Math.ceil(totalCount / pageSize);
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      }
    }
  }, [products.length, currentPage, totalCount, pageSize]);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes, lowStockRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          category: filterCategory !== 'all' ? filterCategory : undefined,
          search: searchQuery || undefined,
        }),
        productAPI.getLowStockProducts(),
      ]);

      setCategories(categoriesRes.data.categories || []);
      let productsData = productsRes.data.products || productsRes.data.rows || [];
      const totalFromServer = productsRes.data.count || productsData.length;

      // Apply stock filter client-side
      let filteredProducts = productsData;
      if (filterStock !== 'all') {
        switch (filterStock) {
          case 'low':
            filteredProducts = productsData.filter(p => p.stock <= p.min_stock && p.stock > 0);
            break;
          case 'out':
            filteredProducts = productsData.filter(p => p.stock === 0);
            break;
          case 'available':
            filteredProducts = productsData.filter(p => p.is_available && p.stock > 0);
            break;
          default:
            break;
        }
      }

      setProducts(filteredProducts);
      setTotalCount(filterStock !== 'all' ? filteredProducts.length : totalFromServer);

      // Calculate stats
      const lowStock = lowStockRes.data.products || [];
      setStats({
        total: totalFromServer,
        lowStock: lowStock.filter(p => p.stock <= p.min_stock && p.stock > 0).length,
        outOfStock: filteredProducts.filter(p => p.stock === 0).length,
        available: filteredProducts.filter(p => p.is_available && p.stock > 0).length,
      });
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

  const openAddModal = () => {
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      description: '',
      price: '',
      image: '',
      is_featured: false,
      spicy_level: 0,
      stock: 100,
      min_stock: 10,
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      is_featured: product.is_featured,
      spicy_level: product.spicy_level || 0,
      stock: product.stock,
      min_stock: product.min_stock,
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setShowStockModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowStockModal(false);
    setEditingProduct(null);
    setStockProduct(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      alert('Name, price, and category are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, formData);
        alert('✅ Product updated');
      } else {
        await productAPI.createProduct(formData);
        alert('✅ Product created');
      }
      closeModal();
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!stockProduct) return;
    
    setSubmitting(true);
    try {
      await productAPI.updateStock(stockProduct.id, {
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 10,
      });
      alert('✅ Stock updated');
      closeModal();
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStockStatus = (product) => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    if (product.stock <= product.min_stock) return { label: 'Low Stock', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { label: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
  };

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
            {totalCount} products • {stats.lowStock} low stock • {stats.outOfStock} out of stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{stats.total}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Available</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.available}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-500">Low Stock</span>
          </div>
          <p className="text-xl font-bold text-orange-600">{stats.lowStock}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-gray-500">Out of Stock</span>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.outOfStock}</p>
        </Card>
      </div>

      {/* Filters */}
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
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="available">Available</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className={`flex items-center justify-center h-full p-4 ${product.image ? 'hidden' : ''}`}>
                    <BaksoPlaceholder />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_featured && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-yellow-500 text-white">⭐</Badge>
                  )}
                  <Badge className={`text-xs px-1.5 py-0.5 ${stockStatus.color} text-white`}>
                    {stockStatus.label}
                  </Badge>
                  {!product.is_available && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-gray-500 text-white">Unavailable</Badge>
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
                      onClick={() => openStockModal(product)}
                      className="flex-1 py-1.5 bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                      title="Update Stock"
                    >
                      📦 Stock
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
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
                      <span key={i} className={`text-xs ${i < (product.spicy_level || 0) ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>
                        🌶️
                      </span>
                    ))}
                  </div>
                  <div className="text-xs">
                    <span className={stockStatus.textColor + ' font-medium'}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
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

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                  className="py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (Rp) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    className="py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock *
                  </label>
                  <Input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Stock *
                  </label>
                  <Input
                    type="number"
                    value={formData.min_stock || ''}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Spicy Level (0-5)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.spicy_level || ''}
                    onChange={(e) => setFormData({ ...formData, spicy_level: parseInt(e.target.value) || 0 })}
                    className="py-2.5 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5 text-sm" disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 py-2.5 text-sm" disabled={submitting}>
                {submitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Update Stock - {stockProduct.name}
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Current Stock</span>
                  <span className="font-bold">{stockProduct.stock}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min Stock</span>
                  <span className="font-bold">{stockProduct.min_stock}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Status</span>
                  <span className={getStockStatus(stockProduct).textColor + ' font-bold'}>
                    {getStockStatus(stockProduct).label}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Stock *
                </label>
                <Input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Stock Alert *
                </label>
                <Input
                  type="number"
                  value={formData.min_stock || ''}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5 text-sm" disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStock} className="flex-1 py-2.5 text-sm" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
