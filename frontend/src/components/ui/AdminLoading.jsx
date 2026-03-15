import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AdminLoadingOverlay({ isLoading, text = 'Memuat data...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]"
      >
        {/* Bakso Bowl Animation */}
        <div className="relative w-16 h-16">
          {/* Bowl */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Bowl Base */}
              <ellipse cx="32" cy="48" rx="24" ry="8" fill="#FDE68A" />
              <path d="M8 48C8 48 12 60 32 60C52 60 56 48 56 48" fill="#FCD34D" />
              
              {/* Steam */}
              <motion.path
                d="M24 32C24 32 26 24 24 20M32 32C32 32 34 24 32 20M40 32C40 32 42 24 40 20"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Noodles */}
              <ellipse cx="32" cy="44" rx="20" ry="6" fill="#FCD34D" />
              
              {/* Bakso Balls */}
              <motion.circle
                cx="24"
                cy="42"
                r="5"
                fill="#F97316"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="40"
                cy="42"
                r="5"
                fill="#F97316"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
}

export function AdminLoadingSpinner({ size = 'md', text, className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.svg
        className={sizes[size]}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <motion.path
          className="opacity-75 text-orange-500"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          initial={{ pathLength: 0.3 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
      {text && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}
