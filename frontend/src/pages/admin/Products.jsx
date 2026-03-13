import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { productAPI } from '../../lib/api';
import { Card, Button, Input, Badge, LoadingSpinner } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts(),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setProducts(productsRes.data.products || []);
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
      alert(`Produk ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`);
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

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category_id === filterCategory;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Produk</h1>
          <p className="text-text-tertiary text-sm">{products.length} produk</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Tambah
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-border rounded-xl bg-surface text-text-primary"
        >
          <option value="all">Semua</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-surface relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-text-tertiary" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && <Badge variant="primary">⭐</Badge>}
                {!product.is_available && <Badge variant="error">Unavailable</Badge>}
              </div>
              
              {/* Toggle Availability */}
              <button
                onClick={() => handleToggleAvailability(product.id, product.is_available)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                {product.is_available ? (
                  <ToggleRight className="w-6 h-6 text-success" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-error" />
                )}
              </button>
            </div>
            
            <div className="p-3">
              <h3 className="font-semibold text-text-primary line-clamp-1">{product.name}</h3>
              <p className="text-primary font-bold mt-1">{formatRupiah(product.price)}</p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-tertiary">
                  {'🌶️'.repeat(product.spicy_level || 0)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-1.5 bg-primary/10 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 bg-error/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-tertiary">Tidak ada produk ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-text-tertiary text-sm mb-4">
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
