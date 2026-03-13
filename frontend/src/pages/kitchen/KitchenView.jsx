import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ChefHat, Clock, CheckCircle, Play, AlertCircle, Truck } from 'lucide-react';
import { orderAPI } from '../../lib/api';
import { useAuthStore } from '../../store';
import { connectSocket } from '../../lib/socket';
import { Button, Badge, LoadingSpinner, Card } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';
import { subscribeToOrderUpdates, emitStaffStatusUpdate } from '../../lib/socket';

export default function KitchenView() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Initialize socket on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🔌 Initializing socket for kitchen:', user.id);
      connectSocket(user.id, user.role, window.location.pathname);
    }
    
    return () => {
      console.log('🔌 Cleaning up socket');
    };
  }, [user?.id, user?.role]);

  const handleLogout = () => {
    if (confirm('Logout dari kitchen?')) {
      logout();
      navigate('/login');
    }
  };

  useEffect(() => {
    loadOrders();
    
    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    // Update staff status
    if (user?.id) {
      emitStaffStatusUpdate(user.id, 'online', 'kitchen');
    }

    return () => {
      unsubscribe();
      if (user?.id) {
        emitStaffStatusUpdate(user.id, 'offline', 'kitchen');
      }
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.getAllOrders({ 
        status: 'paid,preparing,ready,completed',
        limit: 50 
      });
      const ordersList = data.orders || data.rows || data || [];
      setOrders(ordersList.filter(o => ['paid', 'preparing', 'ready', 'completed'].includes(o.status)));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    pending: orders.filter(o => o.status === 'paid').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 h-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Kitchen View</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-success/10 rounded-full">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs font-medium text-success">Online</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 h-auto text-error hover:bg-error/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-2 bg-warning/10 rounded-lg">
              <p className="text-lg font-bold text-warning">{stats.pending}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-primary">{stats.preparing}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cooking</p>
            </div>
            <div className="text-center p-2 bg-success/10 rounded-lg">
              <p className="text-lg font-bold text-success">{stats.ready}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
            </div>
            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.completed}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Done</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {[
              { value: 'all', label: 'All', count: orders.length },
              { value: 'paid', label: 'Pending', count: stats.pending },
              { value: 'preparing', label: 'Cooking', count: stats.preparing },
              { value: 'ready', label: 'Ready', count: stats.ready },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="p-3 pb-20">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-3 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      #{order.queue_number || 'N/A'}
                    </span>
                    <Badge variant={
                      order.status === 'completed' ? 'success' :
                      order.status === 'ready' ? 'success' :
                      order.status === 'preparing' ? 'primary' : 'warning'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {order.order_type}
                  </span>
                </div>

                {/* Order Info */}
                <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{order.order_number}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-3 space-y-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{item.quantity}x</span> {item.product_name}
                      {item.notes && (
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-0.5">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
                  <span className="text-base font-bold text-primary">
                    {formatRupiah(order.total)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === 'paid' && (
                    <Button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="flex-1 text-xs py-2 h-auto"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Cooking
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="flex-1 text-xs py-2 h-auto"
                      size="sm"
                      variant="success"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="flex-1 text-xs py-2 h-auto"
                      size="sm"
                      variant="success"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <div className="flex-1 text-center py-2 text-xs text-success bg-success/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Role Switcher FAB (for admin only) */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="relative group">
            <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95">
              <LogOut className="w-6 h-6" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hidden group-hover:block">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Switch View
              </p>
              <button
                onClick={() => navigate('/admin-panel')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <span className="text-gray-900 dark:text-white">Admin Panel</span>
              </button>
              <button
                onClick={() => navigate('/driver')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-success" />
                </div>
                <span className="text-gray-900 dark:text-white">Driver View</span>
              </button>
              <button
                onClick={() => navigate('/kitchen')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 bg-primary/5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary font-medium">Kitchen View</span>
                <span className="ml-auto text-xs text-primary">(Current)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
