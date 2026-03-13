import { useEffect, useState } from 'react';
import { orderAPI } from '../../lib/api';
import { Card, LoadingSpinner, Badge } from '../../components/ui/BaseComponents';
import { formatRupiah } from '../../lib/utils';
import { getSocket, subscribeToOrderUpdates } from '../../lib/socket';
import { CheckCircle, Clock } from 'lucide-react';

export default function KitchenView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return () => unsubscribe();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.getAllOrders({ status: 'paid,preparing,ready' });
      setOrders(data.rows || data.orders || []);
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

  const pendingOrders = orders.filter((o) => o.status === 'paid');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Kitchen View</h1>

      {/* Queue Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-warning/10">
          <p className="text-2xl font-bold text-warning">{pendingOrders.length}</p>
          <p className="text-xs text-text-tertiary">Pending</p>
        </Card>
        <Card className="p-3 text-center bg-primary/10">
          <p className="text-2xl font-bold text-primary">{preparingOrders.length}</p>
          <p className="text-xs text-text-tertiary">Preparing</p>
        </Card>
        <Card className="p-3 text-center bg-success/10">
          <p className="text-2xl font-bold text-success">{readyOrders.length}</p>
          <p className="text-xs text-text-tertiary">Ready</p>
        </Card>
      </div>

      {/* Orders by Status */}
      <div className="space-y-4">
        {['paid', 'preparing', 'ready'].map((status) => {
          const statusOrders = orders.filter((o) => o.status === status);
          const statusColors = {
            paid: 'warning',
            preparing: 'primary',
            ready: 'success',
          };

          return (
            <div key={status}>
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant={statusColors[status]}>{status.toUpperCase()}</Badge>
                <span className="text-text-secondary">{statusOrders.length} orders</span>
              </h2>
              <div className="space-y-2">
                {statusOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">#{order.queue_number}</span>
                          <Badge variant={statusColors[status]}>{order.order_type}</Badge>
                        </div>
                        <p className="text-sm text-text-tertiary">{order.order_number}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{formatRupiah(order.total)}</span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{item.quantity}x</span> {item.product_name}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {status === 'paid' && (
                        <Button
                          onClick={() => updateStatus(order.id, 'preparing')}
                          className="flex-1"
                          size="sm"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {status === 'preparing' && (
                        <Button
                          onClick={() => updateStatus(order.id, 'ready')}
                          className="flex-1"
                          size="sm"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {status === 'ready' && (
                        <Button
                          onClick={() => updateStatus(order.id, 'completed')}
                          className="flex-1"
                          size="sm"
                          variant="success"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Button({ children, onClick, className, size = 'md', variant = 'primary' }) {
  const variants = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium ${variants[variant]} ${size === 'sm' ? 'text-sm' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
