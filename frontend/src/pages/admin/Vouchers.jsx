import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, Percent, DollarSign, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { voucherAPI } from '@/lib/api';
import { Button, Card, Badge, LoadingSpinner, Input } from '@/components/ui/BaseComponents';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function AdminVouchers() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'fixed',
    value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const { data } = await voucherAPI.getVouchers();
      setVouchers(data.vouchers || []);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || '',
        type: voucher.type,
        value: voucher.value.toString(),
        min_purchase: voucher.min_purchase?.toString() || '',
        max_discount: voucher.max_discount?.toString() || '',
        usage_limit: voucher.usage_limit?.toString() || '',
        valid_until: voucher.valid_until ? new Date(voucher.valid_until).toISOString().split('T')[0] : '',
        is_active: voucher.is_active,
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'fixed',
        value: '',
        min_purchase: '',
        max_discount: '',
        usage_limit: '',
        valid_until: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        value: parseInt(formData.value),
        min_purchase: formData.min_purchase ? parseInt(formData.min_purchase) : 0,
        max_discount: formData.max_discount ? parseInt(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: new Date().toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };

      if (editingVoucher) {
        await voucherAPI.updateVoucher(editingVoucher.id, payload);
      } else {
        await voucherAPI.createVoucher(payload);
      }

      setShowModal(false);
      loadVouchers();
    } catch (error) {
      console.error('Failed to save voucher:', error);
      alert(error.response?.data?.error?.details?.[0]?.message || 'Gagal menyimpan voucher');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus voucher ini?')) return;
    
    try {
      await voucherAPI.deleteVoucher(id);
      loadVouchers();
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      alert(error.response?.data?.error || 'Gagal menghapus voucher');
    }
  };

  const getVoucherStats = (voucher) => {
    const usage = voucher.usage_limit ? `${voucher.used_count || 0}/${voucher.usage_limit}` : `${voucher.used_count || 0} used`;
    const discount = voucher.type === 'percentage' ? `${voucher.value}%` : formatRupiah(voucher.value);
    return { usage, discount };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voucher</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {vouchers.length} voucher aktif
              </p>
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Buat Voucher
            </Button>
          </div>
        </div>
      </div>

      {/* Voucher List */}
      <div className="p-4 space-y-3">
        {vouchers.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada voucher</p>
          </Card>
        ) : (
          vouchers.map((voucher) => {
            const { usage, discount } = getVoucherStats(voucher);
            const isValid = voucher.is_active && voucher.valid_until > new Date().toISOString();
            
            return (
              <Card key={voucher.id} className="p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      voucher.type === 'percentage' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-500'
                    }`}>
                      {voucher.type === 'percentage' ? (
                        <Percent className="w-6 h-6 text-white" />
                      ) : (
                        <DollarSign className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{voucher.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{voucher.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isValid ? 'success' : 'error'} className="text-xs">
                      {isValid ? 'Active' : 'Inactive'}
                    </Badge>
                    <button
                      onClick={() => handleOpenModal(voucher)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Discount</p>
                    <p className="text-lg font-bold text-primary">{discount}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Usage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{usage}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Until: {formatDate(voucher.valid_until)}</span>
                  </div>
                  {voucher.min_purchase > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Min: {formatRupiah(voucher.min_purchase)}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingVoucher ? 'Edit Voucher' : 'Buat Voucher Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kode Voucher
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BAKSO10"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipe Discount
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="fixed">Fixed (Rp)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Voucher
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Diskon Bakso 10%"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Diskon 10% untuk semua menu bakso"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nilai Discount
                </label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'percentage' ? '10' : '10000'}
                  className="w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min. Pembelian
                  </label>
                  <Input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    placeholder="50000"
                    className="w-full"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max. Discount
                    </label>
                    <Input
                      type="number"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      placeholder="20000"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kuota Penggunaan
                  </label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Berlaku Sampai
                  </label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                >
                  {editingVoucher ? 'Update' : 'Buat'} Voucher
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
