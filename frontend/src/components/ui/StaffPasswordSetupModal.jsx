import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/BaseComponents';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';

export function StaffPasswordSetupModal({ isOpen, onClose, onComplete, isBypassable = false }) {
  const { user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Prevent back button
  useEffect(() => {
    if (isOpen && !isBypassable) {
      const handleBackButton = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        return false;
      };
      
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleBackButton);
      
      // Prevent page refresh/close
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isOpen, isBypassable]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!password || password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update password
      await authAPI.updateProfile({ password });
      
      console.log('✅ Password updated successfully');
      onComplete();
    } catch (error) {
      console.error('❌ Failed to set password:', error);
      setError(error.response?.data?.error || 'Gagal mengatur password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // Full screen overlay - completely blocks interaction
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-end sm:items-center justify-center"
        >
          {/* Slide-up modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header - No close button, shows lock icon */}
            <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
                  <p className="text-sm text-white/90">Wajib untuk keamanan akun staff</p>
                </div>
                {!isBypassable && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold">REQUIRED</span>
                  </div>
                )}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '50%' }}
                    className="h-full bg-white"
                  />
                </div>
                <span className="text-xs text-white/80">Step 1 of 2</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Warning Box */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-bold mb-1">Wajib Atur Password!</p>
                    <p>
                      Sebagai staff, Anda harus mengatur password untuk mengaktifkan two-factor authentication. 
                      Ini akan melindungi akun Anda dari akses tidak sah.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password Anda"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 py-4 text-base"
                  >
                    <KeyRound className="w-5 h-5 mr-2" />
                    {isLoading ? 'Mengatur Password...' : 'Atur Password & Lanjut'}
                  </Button>
                </div>
              </form>

              {/* Info Footer */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex-shrink-0">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                  🔒 Password akan digunakan untuk login two-factor authentication bersama dengan PIN
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
