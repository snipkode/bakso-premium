import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Share2 } from 'lucide-react';
import { orderAPI } from '../lib/api';
import { Button, Card } from '../components/ui/BaseComponents';
import { formatRupiah, formatTime } from '../lib/utils';
import { getSocket, subscribeToOrderUpdates } from '../lib/socket';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    
    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      if (data.orderId === id) {
        loadOrder();
      }
    });

    return () => unsubscribe();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await orderAPI.getOrderById(id);
      setOrder(data.order);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Success Animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-success flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Pesanan Diterima!
        </h1>
        <p className="text-text-tertiary text-center mb-8">
          Terima kasih! Pesanan Anda sedang diproses.
        </p>

        {/* Order Info */}
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-text-tertiary">Nomor Pesanan</p>
            <p className="text-xl font-bold text-text-primary">{order.order_number}</p>
          </div>

          {order.queue_number && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 text-white text-center"
            >
              <p className="text-sm opacity-90">Antrian Anda</p>
              <p className="text-4xl font-bold mt-1">#{order.queue_number}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Estimasi: {formatTime(order.estimated_time)}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Total</span>
              <span className="text-text-primary font-semibold">{formatRupiah(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Status</span>
              <span className="text-primary font-semibold capitalize">
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="w-full max-w-md mt-6 space-y-3">
          <Button
            onClick={() => navigate(`/track/${id}`)}
            className="w-full"
            size="lg"
          >
            Lacak Pesanan
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="w-full"
            size="lg"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
