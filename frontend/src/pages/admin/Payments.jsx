import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Upload, Search, Eye, RefreshCw, DollarSign, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { Card, Button, Badge, LoadingSpinner, Input, Pagination } from '../../components/ui/BaseComponents';
import { AdminLoadingOverlay } from '../../components/ui/AdminLoading';
import { formatRupiah, formatDate } from '../../lib/utils';
import { subscribeToPaymentUpdates } from '../../lib/socket';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadPayments();
    loadStats();

    const unsubscribe = subscribeToPaymentUpdates(() => {
      loadPayments();
      loadStats();
    });

    return () => unsubscribe();
  }, [currentPage, pageSize, filter]);

  const loadStats = async () => {
    try {
      const response = await paymentAPI.getAllPayments({ limit: 1000 });
      const allPayments = response.data.payments || response.data.rows || [];
      
      setStats({
        pending: allPayments.filter(p => p.status === 'pending').length,
        verified: allPayments.filter(p => p.status === 'verified').length,
        rejected: allPayments.filter(p => p.status === 'rejected').length,
        totalAmount: allPayments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setAdminLoading(true);
      let response;

      if (filter === 'pending') {
        response = await paymentAPI.getPendingPayments();
        const data = response.data.payments || [];
        setPayments(data);
        setTotalCount(data.length);
      } else if (filter === 'all') {
        response = await paymentAPI.getAllPayments({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        });
        const data = response.data.payments || response.data.rows || [];
        setPayments(data);
        setTotalCount(response.data.count || data.length);
      } else {
        response = await paymentAPI.getAllPayments({
          status: filter,
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        });
        const data = response.data.payments || response.data.rows || [];
        setPayments(data);
        setTotalCount(response.data.count || data.length);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setAdminLoading(false);
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status, rejectionReason = '') => {
    if (!confirm(`Verifikasi pembayaran ini sebagai ${status}?`)) return;

    setVerifying(paymentId);
    setAdminLoading(true);
    try {
      await paymentAPI.verifyPayment(paymentId, status, rejectionReason);
      alert(`✅ Pembayaran ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`);
      loadPayments();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal verifikasi pembayaran');
    } finally {
      setVerifying(null);
      setAdminLoading(false);
    }
  };

  const handleViewProof = (proofUrl) => {
    if (proofUrl) {
      window.open(proofUrl.startsWith('http') ? proofUrl : `http://localhost:9000${proofUrl}`, '_blank');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const orderNumber = payment.order?.order_number || '';
    const customerName = payment.order?.user?.name || payment.order?.customer_name || '';
    return orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer': return <CreditCard className="w-4 h-4" />;
      case 'e_wallet': return <Wallet className="w-4 h-4" />;
      case 'cod': return <DollarSign className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'bank_transfer': return 'Transfer Bank';
      case 'e_wallet': return 'E-Wallet';
      case 'cod': return 'COD';
      default: return method.replace('_', ' ');
    }
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
      {/* Admin Loading Overlay */}
      <AdminLoadingOverlay isLoading={adminLoading} text="Memuat data..." />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Verification</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {stats.pending} pending verification
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => { loadPayments(); loadStats(); }}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Verified</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.verified}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-gray-500">Rejected</span>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-sm font-bold text-blue-600">{formatRupiah(stats.totalAmount, { compact: true })}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search order number or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { status: 'pending', label: 'Pending', color: 'yellow', count: stats.pending },
          { status: 'verified', label: 'Verified', color: 'green', count: stats.verified },
          { status: 'rejected', label: 'Rejected', color: 'red', count: stats.rejected },
          { status: 'all', label: 'All', color: 'gray', count: stats.pending + stats.verified + stats.rejected },
        ].map((tab) => (
          <button
            key={tab.status}
            onClick={() => { setFilter(tab.status); setCurrentPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === tab.status
                ? `bg-${tab.color}-500 text-white shadow-md`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md ${
                filter === tab.status ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-2">
        {filteredPayments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No payments found</p>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-3 hover:shadow-md transition-all">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {payment.order?.order_number || 'N/A'}
                  </span>
                  <Badge
                    variant={
                      payment.status === 'verified' ? 'success' :
                      payment.status === 'rejected' ? 'error' : 'warning'
                    }
                    className="flex-shrink-0 text-xs px-2 py-0.5"
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-primary">
                    {formatRupiah(payment.amount)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 justify-end mt-0.5">
                    {getMethodIcon(payment.method)}
                    <span className="capitalize">{getMethodLabel(payment.method)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 mb-2 text-xs">
                {payment.method === 'bank_transfer' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Bank</span>
                      <p className="font-medium text-gray-900 dark:text-white">{payment.bank_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Account</span>
                      <p className="font-medium text-gray-900 dark:text-white">{payment.account_number || '-'}</p>
                    </div>
                  </div>
                )}
                {payment.method === 'e_wallet' && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">E-Wallet</span>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.e_wallet_type || '-'}</p>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                  <p className="font-mono text-gray-900 dark:text-white truncate">{payment.transaction_id}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="mb-2 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Customer</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {payment.order?.user?.name || payment.order?.customer_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Order Type</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {payment.order?.order_type || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {payment.status === 'pending' ? (
                <div className="flex gap-1.5">
                  {payment.proof_image && (
                    <Button
                      onClick={() => handleViewProof(payment.proof_image)}
                      variant="secondary"
                      size="sm"
                      className="px-3 py-1.5 text-xs h-auto"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Proof
                    </Button>
                  )}
                  <Button
                    onClick={() => handleVerify(payment.id, 'rejected')}
                    variant="error"
                    size="sm"
                    isLoading={verifying === payment.id}
                    className="px-3 py-1.5 text-xs h-auto flex-1"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerify(payment.id, 'verified')}
                    variant="success"
                    size="sm"
                    isLoading={verifying === payment.id}
                    className="px-3 py-1.5 text-xs h-auto flex-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verify
                  </Button>
                </div>
              ) : payment.status === 'verified' ? (
                <div className="text-center text-green-600 text-xs py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Verified on {formatDate(payment.verified_at, { short: true })}
                </div>
              ) : (
                <div className="text-center text-red-600 text-xs py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="w-4 h-4 inline mr-1" />
                  Rejected
                  {payment.rejection_reason && (
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{payment.rejection_reason}</p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
