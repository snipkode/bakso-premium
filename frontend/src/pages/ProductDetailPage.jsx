import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Info } from 'lucide-react';
import { productAPI } from '../lib/api';
import { useCartStore } from '../store';
import { Button, Card, LoadingSpinner } from '../components/ui/BaseComponents';
import { formatRupiah } from '../lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await productAPI.getProductById(id);
      setProduct(data.product);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(
      {
        ...product,
        selectedOptions,
      },
      quantity
    );
    navigate('/cart');
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Header Image */}
      <div className="relative">
        <div className="aspect-square bg-surface">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍜
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-6 relative">
        <Card className="p-5 rounded-t-ios-xl">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-text-primary flex-1">
              {product.name}
            </h1>
            {product.is_featured && (
              <span className="text-2xl">⭐</span>
            )}
          </div>

          <p className="text-text-tertiary mb-4">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-primary">
              {formatRupiah(product.price)}
            </span>
            {product.spicy_level > 0 && (
              <span className="text-lg">
                {'🌶️'.repeat(product.spicy_level)}
              </span>
            )}
            <span className="text-sm text-text-tertiary">
              ⏱️ {product.preparation_time} menit
            </span>
          </div>

          {/* Customizations */}
          {product.customizations && product.customizations.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Info className="w-4 h-4" />
                Pilihan Customisasi
              </h3>
              {product.customizations.map((custom, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {custom.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {custom.options.map((option, optIdx) => (
                      <Button
                        key={optIdx}
                        variant={
                          selectedOptions[custom.name] === option
                            ? 'primary'
                            : 'secondary'
                        }
                        size="sm"
                        onClick={() => handleOptionChange(custom.name, option)}
                        className="text-sm"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Jumlah
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full p-0"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="w-16 text-center text-xl font-bold">
                {quantity}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border pb-safe-bottom">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <p className="text-sm text-text-tertiary">Total</p>
            <p className="text-xl font-bold text-primary">
              {formatRupiah(product.price * quantity)}
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1 max-w-xs"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah ke Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
