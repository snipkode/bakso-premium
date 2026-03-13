import { useState } from 'react';
import { cn } from '@/lib/utils';

// SVG Bowl Icon for image fallbacks
function BowlIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bowl */}
      <ellipse cx="50" cy="70" rx="35" ry="12" fill="#E5E7EB" />
      <path
        d="M15 70C15 70 20 90 50 90C80 90 85 70 85 70"
        fill="#D1D5DB"
      />
      {/* Steam */}
      <path
        d="M35 55C35 55 38 45 35 40M50 55C50 55 53 45 50 40M65 55C65 55 68 45 65 40"
        stroke="#9CA3AF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Noodles */}
      <ellipse cx="50" cy="65" rx="30" ry="8" fill="#FCD34D" />
      <path
        d="M25 65C25 65 35 60 50 60C65 60 75 65 75 65"
        stroke="#F59E0B"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackType = 'bowl',
  ...props
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn('bg-surface flex items-center justify-center', className)}>
        {fallbackType === 'bowl' ? (
          <BowlIcon className="w-1/2 h-1/2" />
        ) : (
          <div className="w-1/2 h-1/2 flex items-center justify-center text-4xl">
            🍜
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      onError={() => setError(true)}
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
