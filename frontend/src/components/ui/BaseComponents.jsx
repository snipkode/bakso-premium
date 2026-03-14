import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// SVG Bowl Icon for image fallbacks - More detailed design
function BowlIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#FEF3C7" opacity="0.5"/>
      
      {/* Bowl */}
      <ellipse cx="50" cy="70" rx="35" ry="12" fill="#FDE68A" />
      <path
        d="M15 70C15 70 20 90 50 90C80 90 85 70 85 70"
        fill="#FCD34D"
      />
      <path
        d="M15 70C15 70 20 85 50 85C80 85 85 70 85 70"
        fill="#FBBF24"
        opacity="0.5"
      />
      
      {/* Steam */}
      <path
        d="M35 55C35 55 38 45 35 40M50 55C50 55 53 45 50 40M65 55C65 55 68 45 65 40"
        stroke="#9CA3AF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      >
        <animate attributeName="d" values="M35 55C35 55 38 45 35 40M50 55C50 55 53 45 50 40M65 55C65 55 68 45 65 40;M35 53C35 53 38 43 35 38M50 53C50 53 53 43 50 38M65 53C65 53 68 43 65 38;M35 55C35 55 38 45 35 40M50 55C50 55 53 45 50 40M65 55C65 55 68 45 65 40" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Noodles */}
      <ellipse cx="50" cy="65" rx="30" ry="8" fill="#FCD34D" />
      <path
        d="M25 65C25 65 35 60 50 60C65 60 75 65 75 65"
        stroke="#F59E0B"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Meatballs */}
      <circle cx="40" cy="62" r="6" fill="#F97316" opacity="0.8"/>
      <circle cx="60" cy="62" r="6" fill="#F97316" opacity="0.8"/>
      <circle cx="50" cy="68" r="5" fill="#F97316" opacity="0.8"/>
    </svg>
  );
}

// Generic Food SVG Fallback
function FoodIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#FEF3C7" opacity="0.5"/>
      <text x="50" y="65" textAnchor="middle" fontSize="50" fill="#F97316">🍜</text>
    </svg>
  );
}

// Drink SVG Fallback
function DrinkIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#DBEAFE" opacity="0.5"/>
      <text x="50" y="65" textAnchor="middle" fontSize="50" fill="#3B82F6">🥤</text>
    </svg>
  );
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackType = 'bowl',
  retryLimit = 3,
  ...props
}) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (retryCount < retryLimit && src) {
      // Retry loading the same image with cache bust
      const timeout = Math.min(1000 * Math.pow(2, retryCount), 5000);
      setTimeout(() => {
        const separator = src.includes('?') ? '&' : '?';
        setCurrentSrc(`${src}${separator}retry=${retryCount + 1}&t=${Date.now()}`);
        setRetryCount(retryCount + 1);
        setIsLoading(true);
      }, timeout);
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    // Reset retry count on successful load
    if (retryCount > 0) {
      setRetryCount(0);
    }
  };

  // Show loading animation while loading
  if (isLoading) {
    return (
      <div className={cn('relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-800', className)}>
        {/* Shimmer Loading Animation */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent shimmer-loading" />
        </div>
        {/* Center Loading Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 relative"
          >
            {/* Animated Loading Ring */}
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-orange-200 dark:text-gray-600"
              />
              <path
                d="M50 10 A40 40 0 0 1 90 50"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="text-orange-500"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            {/* Food Icon in Center */}
            <div className="absolute inset-0 flex items-center justify-center text-lg">
              {fallbackType === 'drink' ? '🥤' : '🍜'}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show static SVG fallback on error (no animation)
  if (!currentSrc || error) {
    return (
      <div className={cn('bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center', className)}>
        {fallbackType === 'bowl' && <BowlIcon className="w-1/2 h-1/2" />}
        {fallbackType === 'food' && <FoodIcon className="w-1/2 h-1/2" />}
        {fallbackType === 'drink' && <DrinkIcon className="w-1/2 h-1/2" />}
        {fallbackType === 'emoji' && (
          <div className="w-1/2 h-1/2 flex items-center justify-center text-5xl">
            🍜
          </div>
        )}
      </div>
    );
  }

  // Show actual image when loaded successfully
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  disabled,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-ios-md hover:shadow-ios-lg',
    secondary: 'bg-surface text-text-primary hover:bg-surface/80 border border-border',
    ghost: 'text-primary hover:bg-primary/10',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    success: 'bg-success text-white hover:bg-success/90',
    error: 'bg-error text-white hover:bg-error/90',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-ios',
          'bg-surface border border-border',
          'text-text-primary placeholder-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'transition-all duration-200',
          error && 'border-error focus:ring-error/50 focus:border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

export function Card({ children, className, onClick, ...props }) {
  return (
    <div
      className={cn(
        'bg-card rounded-ios-lg shadow-ios border border-border',
        'transition-all duration-200',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'primary', className }) {
  const variants = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    secondary: 'bg-surface text-text-primary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full bg-primary text-white flex items-center justify-center font-medium overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <ImageWithFallback
          src={src}
          alt={name}
          className="rounded-full"
          fallbackType="emoji"
        />
      ) : (
        initials
      )}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin text-primary', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-tertiary mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}

export function Divider({ children, className }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      {children && (
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-text-tertiary">
            {children}
          </span>
        </div>
      )}
    </div>
  );
}

export function IconButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        'p-2 rounded-full',
        'hover:bg-surface active:scale-95',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (isMobile = false) => {
    const pages = [];
    // Mobile: show only 3 pages (current-1, current, current+1)
    // Desktop: show 5 pages for better navigation
    const maxVisible = isMobile ? 3 : 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Mobile: no ellipsis, just show 3 pages
    if (isMobile) {
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Desktop: with ellipsis
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Previous Button - Always visible */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex-shrink-0"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers - Scrollable container */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0 max-w-[calc(100vw-140px)] sm:max-w-none">
        {/* Mobile: show only 3 pages */}
        <div className="flex items-center gap-1.5 sm:hidden">
          {getPageNumbers(true).map((page, index) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                page === currentPage
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Desktop: show 5 pages with ellipsis */}
        <div className="hidden sm:flex items-center gap-1.5">
          {getPageNumbers(false).map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs flex-shrink-0"
              >
                ‧‧‧
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                  page === currentPage
                    ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                {page}
              </button>
            )
          )}
        </div>
      </div>

      {/* Next Button - Always visible */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex-shrink-0"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
