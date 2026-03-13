import { useEffect, useState } from 'react';
import { Search, Filter, Eye, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../lib/api';
import { Card, Button, Badge, LoadingSpinner, Input } from '../../components/ui/BaseComponents';
import { formatRupiah, formatDate, getStatusLabel, getStatusColor } from '../../lib/utils';
import { subscribeToOrderUpdates } from '../../lib/socket';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();

    // Real-time updates
    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, []);

  const loadOrders = async () => {
    try {
      const params = {
        limit: 50,
        ...(filterStatus !== 'all' && { status: filterStatus }),
      };
      const response = await orderAPI.getAllOrders(params);
      setOrders(response.data.orders || response.data.rows || response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchType = filterType === 'all' || order.order_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      alert(`✅ Status diubah ke: ${newStatus}`);
      loadOrders();
    } catch (error) {
      alert('Gagal update status');
    }
  };

  const handleViewDetail = (orderId) => {
    window.open(`/admin/orders/${orderId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Orders</h1>
          <p className="text-text-tertiary text-sm">{orders.length} total orders</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadOrders}>
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

      {/* Status Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { status: 'all', label: 'Total', color: 'bg-gray-500' },
          { status: 'pending', label: 'Pending', color: 'bg-warning' },
          { status: 'preparing', label: 'Cooking', color: 'bg-primary' },
          { status: 'completed', label: 'Done', color: 'bg-success' },
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setFilterStatus(stat.status)}
            className={`p-2 rounded-lg ${
              filterStatus === stat.status ? stat.color : 'bg-secondary'
            } text-white`}
          >
            <p className="text-lg font-bold">{statusCounts[stat.status] || 0}</p>
            <p className="text-xs">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-border rounded-xl bg-surface text-text-primary text-sm"
        >
          <option value="all">Semua Tipe</option>
          <option value="dine-in">🍽️ Dine-in</option>
          <option value="takeaway">🛍️ Takeaway</option>
          <option value="delivery">🛵 Delivery</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center text-text-tertiary">
            <p>Tidak ada orders ditemukan</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{order.order_number}</span>
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Clock className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {formatRupiah(order.total)}
                  </p>
                  <p className="text-xs text-text-tertiary capitalize">
                    {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                    {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                    {order.order_type === 'delivery' && '🛵 Delivery'}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-surface rounded-lg p-3 mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-tertiary">Customer</span>
                  <span className="text-text-primary">
                    {order.user?.name || order.customer_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Phone</span>
                  <span className="text-text-primary">
                    {order.user?.phone || order.customer_phone || 'N/A'}
                  </span>
                </div>
                {order.order_type === 'dine-in' && order.table_number && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-text-tertiary">Table</span>
                    <span className="text-text-primary">{order.table_number}</span>
                  </div>
                )}
                {order.order_type === 'delivery' && order.delivery_address && (
                  <div className="mt-2 text-sm">
                    <span className="text-text-tertiary block mb-1">Address</span>
                    <span className="text-text-primary">{order.delivery_address}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-3">
                <p className="text-sm font-medium text-text-primary mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <p key={idx} className="text-sm text-text-secondary">
                      {item.quantity}x {item.product_name}
                    </p>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-text-tertiary">
                      +{order.items.length - 3} item lainnya
                    </p>
                  )}
                </div>
              </div>

              {/* Queue Number */}
              {order.queue_number && (
                <div className="mb-3 bg-primary/10 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">Queue #{order.queue_number}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewDetail(order.id)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </Button>
                
                {order.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'paid')}
                    className="flex-1"
                  >
                    Mark Paid
                  </Button>
                )}
                
                {order.status === 'paid' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="flex-1"
                  >
                    Start Cooking
                  </Button>
                )}
                
                {order.status === 'preparing' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                    className="flex-1"
                  >
                    Mark Ready
                  </Button>
                )}
                
                {order.status === 'ready' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="flex-1"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
