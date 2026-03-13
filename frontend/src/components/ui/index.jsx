export * from './BaseComponents';

import { Card, Badge, IconButton, Avatar, ImageWithFallback } from './BaseComponents';
import { formatRupiah, getStatusLabel, getStatusColor } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function ProductCard({ product, onClick }) {
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer group"
    >
      <div className="aspect-square bg-surface relative">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className=""
          fallbackType="bowl"
        />
        {product.is_featured && (
          <Badge variant="primary" className="absolute top-2 left-2">
            ⭐ Featured
          </Badge>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="error">Unavailable</Badge>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-text-primary line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-text-tertiary line-clamp-2 mt-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold">
            {formatRupiah(product.price)}
          </span>
          {product.spicy_level > 0 && (
            <span className="text-xs">
              {'🌶️'.repeat(product.spicy_level)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export function OrderCard({ order, onClick }) {
  return (
    <Card onClick={onClick} className="p-4 cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-text-tertiary">{order.order_number}</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {new Date(order.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={getStatusColor(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="space-y-2">
        {order.items?.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {item.quantity}x {item.product_name}
            </span>
            <span className="text-text-primary">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </div>
        ))}
        {order.items?.length > 2 && (
          <p className="text-xs text-text-tertiary">
            +{order.items.length - 2} item lainnya
          </p>
        )}
      </div>

      <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
        <span className="text-sm text-text-secondary">Total</span>
        <span className="text-lg font-bold text-primary">
          {formatRupiah(order.total)}
        </span>
      </div>

      {order.queue_number && (
        <div className="mt-3 bg-surface rounded-lg p-2 flex items-center justify-between">
          <span className="text-sm text-text-secondary">Antrian</span>
          <span className="text-lg font-bold text-primary">#{order.queue_number}</span>
        </div>
      )}
    </Card>
  );
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <Card className="p-3 flex gap-3">
      <div className="w-20 h-20 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.product_name}
          className="rounded-lg"
          fallbackType="bowl"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-text-primary line-clamp-1">
          {item.product_name}
        </h4>
        {item.customizations && Object.keys(item.customizations).length > 0 && (
          <p className="text-xs text-text-tertiary mt-1">
            {Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(', ')}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <IconButton
              onClick={onDecrease}
              className="w-7 h-7 bg-surface hover:bg-surface/80"
            >
              <Minus className="w-4 h-4" />
            </IconButton>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <IconButton
              onClick={onIncrease}
              className="w-7 h-7 bg-surface hover:bg-surface/80"
            >
              <Plus className="w-4 h-4" />
            </IconButton>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary">
              {formatRupiah(item.price * item.quantity)}
            </span>
            <IconButton onClick={onRemove} className="text-error hover:bg-error/10">
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StaffStatusCard({ department, staff }) {
  const getBadgeColor = (status) => {
    if (status === 'online') return 'success';
    if (status === 'busy') return 'warning';
    return 'secondary';
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-text-primary mb-3">{department}</h3>
      <div className="space-y-2">
        {staff.length === 0 ? (
          <p className="text-sm text-text-tertiary">Tidak ada staff</p>
        ) : (
          staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={s.name} size="sm" />
                <span className="text-sm text-text-primary">{s.name}</span>
              </div>
              <Badge variant={getBadgeColor(s.status)}>
                {s.status === 'online' ? '🟢' : s.status === 'busy' ? '🟡' : '⚪'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
