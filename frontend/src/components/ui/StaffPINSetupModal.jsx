import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui/BaseComponents';
import { customerPINAPI } from '@/lib/api';
import { useAuthStore } from '@/store';

export function StaffPINSetupModal({ isOpen, onClose, onComplete, pinCheckStatus = 'needed' }) {
  const { user } = useAuthStore();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePinChange = (index, value, isConfirm = false) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const setter = isConfirm ? setConfirmPin : setPin;
    const newPin = [...(isConfirm ? confirmPin : pin)];
    newPin[index] = value;
    setter(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${isConfirm ? 'confirm' : 'enter'}-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields filled
    if (value && index === 5) {
      const fullPin = isConfirm 
        ? [...confirmPin.slice(0, 5), value].join('')
        : [...pin.slice(0, 5), value].join('');
      
      if (!isConfirm && fullPin.length === 6) {
        handleSubmit(fullPin);
      }
    }

    setError('');
  };

  const handleSubmit = async (finalPin) => {
    setError('');

    // Validate
    if (finalPin.length !== 6) {
      setError('PIN harus 6 digit');
      return;
    }

    if (pin.join('') !== confirmPin.join('')) {
      setError('PIN tidak cocok');
      return;
    }

    try {
      setIsLoading(true);
      
      // Set PIN
      await customerPINAPI.setPIN(finalPin);
      
      console.log('✅ PIN set successfully');
      setSuccess(true);
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('❌ Failed to set PIN:', error);
      setError(error.response?.data?.error || 'Gagal mengatur PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {success ? 'PIN Berhasil Diatur!' : 'Atur PIN Staff'}
                  </h2>
                  <p className="text-sm text-white/90">
                    {success ? 'Anda sekarang bisa login dengan PIN' : 'Keamanan two-factor authentication'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!success ? (
                <>
                  {/* Warning Box */}
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-bold mb-1">Wajib Atur PIN!</p>
                        <p>
                          {pinCheckStatus === 'expired' 
                            ? 'PIN Anda sudah kadaluarsa (reset 1 bulan). Silakan atur PIN baru untuk keamanan akun.'
                            : 'Sebagai staff, Anda harus mengatur PIN untuk login two-factor authentication.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        PIN (6 digit)
                      </label>
                      <div className="flex gap-2 justify-center">
                        {pin.map((digit, index) => (
                          <input
                            key={index}
                            id={`pin-enter-${index}`}
                            type={showPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="showPin"
                          checked={showPin}
                          onChange={(e) => setShowPin(e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <label htmlFor="showPin" className="text-sm text-gray-600 dark:text-gray-400">
                          Tampilkan PIN
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Konfirmasi PIN
                      </label>
                      <div className="flex gap-2 justify-center">
                        {confirmPin.map((digit, index) => (
                          <input
                            key={index}
                            id={`pin-confirm-${index}`}
                            type={showConfirmPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value, true)}
                            className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="showConfirmPin"
                          checked={showConfirmPin}
                          onChange={(e) => setShowConfirmPin(e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <label htmlFor="showConfirmPin" className="text-sm text-gray-600 dark:text-gray-400">
                          Tampilkan PIN
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={() => handleSubmit(pin.join(''))}
                        isLoading={isLoading}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 py-4 text-base"
                        disabled={pin.join('').length !== 6 || confirmPin.join('').length !== 6}
                      >
                        <KeyRound className="w-5 h-5 mr-2" />
                        {isLoading ? 'Mengatur PIN...' : 'Atur PIN & Lanjut'}
                      </Button>
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                      🔒 PIN akan direset otomatis setiap 1 bulan untuk keamanan
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    PIN Berhasil Diatur!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Anda sekarang bisa login dengan PIN
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
