import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Upload, Search, Filter, RefreshCw } from 'lucide-react';
import { paymentAPI, orderAPI } from '../../lib/api';
import { Card, Button, Badge, LoadingSpinner, Input } from '../../components/ui/BaseComponents';
import { formatRupiah, formatDate } from '../../lib/utils';
import { subscribeToPaymentUpdates } from '../../lib/socket';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPayments();

    // Real-time updates
    const unsubscribe = subscribeToPaymentUpdates(() => {
      loadPayments();
    });

    return () => unsubscribe();
  }, []);

  const loadPayments = async () => {
    try {
      let data;
      if (filter === 'pending') {
        data = await paymentAPI.getPendingPayments();
      } else {
        const response = await paymentAPI.getAllPayments({ status: filter });
        data = response.data.payments || response.data;
      }
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status, rejectionReason = '') => {
    if (!confirm(`Verifikasi pembayaran ini sebagai ${status}?`)) return;

    setVerifying(paymentId);
    try {
      await paymentAPI.verifyPayment(paymentId, status, rejectionReason);
      alert(`✅ Pembayaran ${status === 'verified' ? 'diterima' : 'ditolak'}`);
      loadPayments();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal verifikasi pembayaran');
    } finally {
      setVerifying(null);
    }
  };

  const handleViewProof = (proofUrl) => {
    if (proofUrl) {
      window.open(proofUrl, '_blank');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const orderNumber = payment.order?.order_number || '';
    const customerName = payment.order?.user?.name || payment.order?.customer_name || '';
    return orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Verifikasi Pembayaran</h1>
          <p className="text-text-tertiary text-sm">
            {pendingCount} pembayaran pending
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadPayments}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <Input
          placeholder="Cari order number atau nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'verified', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              loadPayments();
            }}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-secondary text-text-secondary'
            }`}
          >
            {status}
            {status === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-error text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <Card className="p-8 text-center text-text-tertiary">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada pembayaran {filter}</p>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">
                      {payment.order?.order_number || 'N/A'}
                    </span>
                    <Badge variant={
                      payment.status === 'verified' ? 'success' :
                      payment.status === 'rejected' ? 'error' : 'warning'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-tertiary">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {formatRupiah(payment.amount)}
                  </p>
                  <p className="text-xs text-text-tertiary capitalize">
                    {payment.method.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-surface rounded-lg p-3 mb-3 space-y-2">
                {payment.method === 'bank_transfer' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-tertiary">Bank</span>
                      <span className="text-text-primary">{payment.bank_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-tertiary">No. Rekening</span>
                      <span className="text-text-primary">{payment.account_number}</span>
                    </div>
                  </>
                )}
                {payment.method === 'e_wallet' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">E-Wallet</span>
                    <span className="text-text-primary">{payment.e_wallet_type}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Transaction ID</span>
                  <span className="text-text-primary font-mono">{payment.transaction_id}</span>
                </div>
              </div>

              {/* Order Info */}
              <div className="mb-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-text-tertiary">Customer</span>
                  <span className="text-text-primary">
                    {payment.order?.user?.name || payment.order?.customer_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Order Type</span>
                  <span className="text-text-primary capitalize">
                    {payment.order?.order_type || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Items</span>
                  <span className="text-text-primary">
                    {payment.order?.items?.length || 0} item
                  </span>
                </div>
              </div>

              {/* Actions */}
              {payment.status === 'pending' && (
                <div className="flex gap-2">
                  {payment.proof_url && (
                    <Button
                      onClick={() => handleViewProof(payment.proof_url)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Lihat Bukti
                    </Button>
                  )}
                  <Button
                    onClick={() => handleVerify(payment.id, 'rejected')}
                    variant="error"
                    size="sm"
                    isLoading={verifying === payment.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleVerify(payment.id, 'verified')}
                    variant="success"
                    size="sm"
                    isLoading={verifying === payment.id}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verifikasi
                  </Button>
                </div>
              )}

              {payment.status === 'verified' && (
                <div className="text-center text-success text-sm py-2 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 inline mr-1" />
                  Terverifikasi - {formatDate(payment.verified_at)}
                </div>
              )}

              {payment.status === 'rejected' && (
                <div className="text-center text-error text-sm py-2 bg-error/10 rounded-lg">
                  <XCircle className="w-5 h-5 inline mr-1" />
                  Ditolak
                  {payment.rejection_reason && (
                    <p className="text-xs mt-1">{payment.rejection_reason}</p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
