import { motion } from 'framer-motion';
import { BaksoLoadingAnimation } from './LoadingAnimation';

export function HomePageSkeleton() {
  return (
    <div className="pb-24">
      {/* XHR Loading Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm mx-4">
          <BaksoLoadingAnimation size="md" text="Memuat data..." />
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="relative bg-gradient-to-br from-primary/30 to-secondary/30 h-64">
        <div className="px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Features Skeleton */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-3 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner Skeleton */}
      <div className="px-4 py-6">
        <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>

      {/* CTA Skeleton */}
      <div className="px-4 py-6">
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-3">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="text-right">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 text-center">
              <div className="h-6 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-3 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="pb-32 min-h-screen animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          {/* Timeline Skeleton */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Track Order Skeleton */}
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>

        {/* Order Info Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
