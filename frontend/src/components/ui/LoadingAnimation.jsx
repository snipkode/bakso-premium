import { motion } from 'framer-motion';

export function BaksoLoadingAnimation({ size = 'md', text = 'Preparing your order...' }) {
  const sizes = {
    sm: { bowl: 60, steam: 4, text: 'text-sm' },
    md: { bowl: 100, steam: 6, text: 'text-base' },
    lg: { bowl: 150, steam: 8, text: 'text-lg' },
  };

  const { bowl, steam, text: textSize } = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Loading Animation */}
      <div className="relative">
        {/* Steam Animation */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.8 }}
              animate={{ y: -20, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
              className="w-1 bg-gradient-to-t from-gray-300 to-transparent rounded-full"
              style={{ height: `${steam * 4}px` }}
            />
          ))}
        </div>

        {/* Bowl */}
        <motion.svg
          width={bowl}
          height={bowl * 0.8}
          viewBox="0 0 100 80"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {/* Bowl Base */}
          <ellipse cx="50" cy="70" rx="40" ry="10" fill="#1F2937" />
          <path d="M10 70C10 70 15 80 50 80C85 80 90 70 90 70" fill="#374151" />
          
          {/* Bowl */}
          <ellipse cx="50" cy="65" rx="35" ry="15" fill="#4B5563" />
          <path d="M15 65C15 65 20 75 50 75C80 75 85 65 85 65" fill="#6B7280" />
          
          {/* Soup */}
          <ellipse cx="50" cy="60" rx="30" ry="12" fill="#F59E0B" />
          
          {/* Bakso Balls */}
          <motion.circle
            cx="35"
            cy="58"
            r="8"
            fill="#92400E"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="65"
            cy="58"
            r="8"
            fill="#92400E"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="#92400E"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
          
          {/* Noodles */}
          <motion.path
            d="M25 60C25 60 40 55 50 55C60 55 75 60 75 60"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ d: [
              "M25 60C25 60 40 55 50 55C60 55 75 60 75 60",
              "M25 62C25 62 40 57 50 57C60 57 75 62 75 62",
              "M25 60C25 60 40 55 50 55C60 55 75 60 75 60",
            ]}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.path
            d="M20 65C20 65 35 60 50 60C65 60 80 65 80 65"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ d: [
              "M20 65C20 65 35 60 50 60C65 60 80 65 80 65",
              "M20 67C20 67 35 62 50 62C65 62 80 67 80 67",
              "M20 65C20 65 35 60 50 60C65 60 80 65 80 65",
            ]}}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
          />
          
          {/* Chopsticks */}
          <motion.g
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <rect x="75" y="20" width="4" height="50" rx="1" fill="#D97706" transform="rotate(30 75 20)" />
            <rect x="82" y="20" width="4" height="50" rx="1" fill="#B45309" transform="rotate(30 82 20)" />
          </motion.g>
        </motion.svg>
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-4 text-gray-600 dark:text-gray-400 font-medium ${textSize}`}
      >
        {text}
      </motion.p>

      {/* Dots Animation */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

export function XHRLoadingOverlay({ isLoading, text = 'Loading...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <BaksoLoadingAnimation size="lg" text={text} />
      </div>
    </div>
  );
}
