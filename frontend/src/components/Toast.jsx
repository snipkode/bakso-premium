import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast Context
const ToastContext = createContext(null);

// Toast variants with icons and colors
const toastVariants = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/90',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-100',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/90',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-100',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/90',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-100',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/90',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-100',
    iconColor: 'text-blue-500',
  },
};

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'info', duration = 5000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Individual Toast Component
function Toast({ toast, onClose }) {
  const variant = toastVariants[toast.variant] || toastVariants.info;
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'pointer-events-auto',
        'rounded-xl border shadow-lg backdrop-blur-sm',
        'p-4 flex items-start gap-3',
        variant.bgColor,
        variant.borderColor
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', variant.iconColor)}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={cn('font-bold text-sm mb-0.5', variant.textColor)}>
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className={cn('text-xs leading-relaxed', variant.textColor, 'opacity-90')}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-lg transition-colors',
          'hover:bg-black/10 dark:hover:bg-white/10',
          variant.textColor
        )}
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context.addToast;
}

// Convenience function for direct toast calls
export function toast(options) {
  // This will be called via the hook in components
  console.warn('toast() called outside component - use useToast() hook instead');
}
