import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Eye, RefreshCw, Clock, ChevronRight, Filter } from 'lucide-react';
import { orderAPI } from '../../lib/api';
import { Card, Button, Badge, LoadingSpinner, Input, Pagination } from '../../components/ui/BaseComponents';
import { formatRupiah, formatDate, getStatusLabel, getStatusColor } from '../../lib/utils';
import { subscribeToOrderUpdates } from '../../lib/socket';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadOrders();

    // Real-time updates
    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, [currentPage, pageSize, filterStatus]);

  const loadOrders = async () => {
    try {
      const params = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        ...(filterStatus !== 'all' && { status: filterStatus }),
      };
      const response = await orderAPI.getAllOrders(params);
      const data = response.data;
      setOrders(data.orders || data.rows || data || []);
      setTotalCount(data.count || (data.orders || data.rows || data || []).length);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders;
  const totalPages = Math.ceil(totalCount / pageSize);

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
    navigate(`/admin/orders/${orderId}`);
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

  const statusTabs = [
    { status: 'all', label: 'Semua', color: 'gray' },
    { status: 'pending', label: 'Pending', color: 'yellow' },
    { status: 'preparing', label: 'Masak', color: 'blue' },
    { status: 'ready', label: 'Siap', color: 'purple' },
    { status: 'completed', label: 'Selesai', color: 'green' },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCount} total orders
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadOrders}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari no. order atau nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {statusTabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => setFilterStatus(tab.status)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filterStatus === tab.status
                ? `bg-${tab.color}-500 text-white shadow-md`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.status !== 'all' && statusCounts[tab.status] > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/20">
                {statusCounts[tab.status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada orders ditemukan</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="p-3 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleViewDetail(order.id)}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {order.order_number}
                  </span>
                  <Badge
                    variant={getStatusColor(order.status)}
                    className="flex-shrink-0 text-xs px-2 py-0.5"
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              {/* Middle Row */}
              <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(order.createdAt, { short: true })}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                  {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                  {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                  {order.order_type === 'delivery' && '🛵 Delivery'}
                </span>
              </div>

              {/* Customer & Items */}
              <div className="mb-2 text-xs">
                <p className="text-gray-600 dark:text-gray-400 truncate">
                  👤 {order.user?.name || order.customer_name || 'N/A'}
                </p>
                <p className="text-gray-500 dark:text-gray-500 truncate mt-0.5">
                  📦 {order.items?.slice(0, 2).map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                  {order.items?.length > 2 && ` +${order.items.length - 2}`}
                </p>
              </div>

              {/* Bottom Row - Total & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-base font-bold text-primary">
                    {formatRupiah(order.total)}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1.5">
                  {order.status === 'pending' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, 'preparing');
                      }}
                      className="px-3 py-1.5 text-xs h-auto"
                    >
                      ✓ Bayar
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, 'ready');
                      }}
                      className="px-3 py-1.5 text-xs h-auto"
                    >
                      ✓ Siap
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, 'completed');
                      }}
                      className="px-3 py-1.5 text-xs h-auto"
                    >
                      ✓ Selesai
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(order.id);
                    }}
                    className="px-3 py-1.5 text-xs h-auto"
                  >
                    Detail
                  </Button>
                </div>
              </div>
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
