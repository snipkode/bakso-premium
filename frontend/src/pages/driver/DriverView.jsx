import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Truck, MapPin, Phone, Navigation, CheckCircle, Clock, ChefHat } from 'lucide-react';
import { orderAPI } from '../../lib/api';
import { useAuthStore } from '../../store';
import { connectSocket } from '../../lib/socket';
import { Button, Badge, LoadingSpinner, Card } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';
import { subscribeToOrderUpdates, emitStaffStatusUpdate } from '../../lib/socket';

export default function DriverView() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Initialize socket on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🔌 Initializing socket for driver:', user.id);
      connectSocket(user.id, user.role, window.location.pathname);
    }
    
    return () => {
      console.log('🔌 Cleaning up socket');
    };
  }, [user?.id, user?.role]);

  const handleLogout = () => {
    if (confirm('Logout dari driver?')) {
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
      emitStaffStatusUpdate(user.id, 'online', 'driver');
    }

    return () => {
      unsubscribe();
      if (user?.id) {
        emitStaffStatusUpdate(user.id, 'offline', 'driver');
      }
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading driver orders...');
      
      // Backend will filter by role (driver sees delivery orders only)
      // Add timestamp to prevent caching
      const { data } = await orderAPI.getAllOrders({
        limit: 100,
        t: Date.now() // Cache buster
      });
      
      const ordersList = data.orders || data.rows || data || [];
      console.log(`📦 Loaded ${ordersList.length} total orders`);
      
      // Filter for delivery orders (should already be filtered by backend)
      const driverOrders = ordersList.filter(o =>
        o.order_type === 'delivery' &&
        ['ready', 'out_for_delivery', 'completed'].includes(o.status)
      );
      
      console.log(`🛵 Driver orders: ${driverOrders.length}`);
      setOrders(driverOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Gagal load orders: ' + (error.response?.data?.error || error.message));
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

  const handleCallCustomer = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  const handleNavigate = (address) => {
    if (address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
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
    ready: orders.filter(o => o.status === 'ready').length,
    outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
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
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Driver View</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivery orders</p>
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
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center p-2 bg-warning/10 rounded-lg">
              <p className="text-lg font-bold text-warning">{stats.ready}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-primary">{stats.outForDelivery}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">On Way</p>
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
              { value: 'ready', label: 'Ready', count: stats.ready },
              { value: 'out_for_delivery', label: 'On Way', count: stats.outForDelivery },
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
            <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No delivery orders</p>
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
                      order.status === 'out_for_delivery' ? 'primary' : 'warning'
                    }>
                      {order.status === 'out_for_delivery' ? 'On Way' : order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRupiah(order.total)}
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

                {/* Customer Info */}
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {(order.user?.name || order.customer_name || 'C').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {order.user?.name || order.customer_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.user?.phone || order.customer_phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCallCustomer(order.user?.phone || order.customer_phone)}
                      className="px-2 py-1 h-auto"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivery Address</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {order.delivery_address}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleNavigate(order.delivery_address)}
                      className="px-2 py-1 h-auto flex-shrink-0"
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-3 space-y-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{item.quantity}x</span> {item.product_name}
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <Button
                      onClick={() => updateStatus(order.id, 'out_for_delivery')}
                      className="flex-1 text-xs py-2 h-auto"
                      size="sm"
                    >
                      <Truck className="w-4 h-4 mr-1" />
                      Pick Up Order
                    </Button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <Button
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="flex-1 text-xs py-2 h-auto"
                      size="sm"
                      variant="success"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Delivered
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <div className="flex-1 text-center py-2 text-xs text-success bg-success/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Delivered
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
                onClick={() => navigate('/kitchen')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-900 dark:text-white">Kitchen View</span>
              </button>
              <button
                onClick={() => navigate('/driver')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 bg-primary/5"
              >
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-success" />
                </div>
                <span className="text-primary font-medium">Driver View</span>
                <span className="ml-auto text-xs text-primary">(Current)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
