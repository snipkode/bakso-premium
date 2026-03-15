import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/BaseComponents';

export function StaffPINSetupModal({ isOpen, onClose, onComplete }) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePinChange = (index, value, isConfirm = false) => {
    if (value && !/^\d$/.test(value)) return;

    const setter = isConfirm ? setConfirmPin : setPin;
    const newPin = [...(isConfirm ? confirmPin : pin)];
    newPin[index] = value;
    setter(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${isConfirm ? 'confirm' : 'enter'}-${index + 1}`);
      nextInput?.focus();
    }

    setError('');
  };

  const handleSubmit = async (finalPin) => {
    setError('');

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
      await onComplete(finalPin);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Gagal mengatur PIN');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log('🔐 StaffPINSetupModal rendered, isOpen:', isOpen, 'pin:', pin);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {success ? '✅ PIN Berhasil!' : '🔐 Atur PIN Staff'}
              </h2>
              <p className="text-sm text-white/90">
                {success ? 'Two-factor authentication aktif' : 'Keamanan akun Anda'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Wajib:</strong> PIN 6 digit untuk two-factor authentication staff.
                </p>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Masukkan PIN (6 digit)
                </label>
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-enter-${index}`}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                      disabled={isLoading}
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN */}
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
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, true)}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                      disabled={isLoading}
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>

              {/* Show PIN Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPin"
                  checked={showPin}
                  onChange={(e) => setShowPin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showPin" className="text-sm text-gray-600 dark:text-gray-400">
                  Tampilkan PIN
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={() => handleSubmit(pin.join(''))}
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 py-4 text-base font-bold"
                disabled={pin.join('').length !== 6 || confirmPin.join('').length !== 6}
              >
                <KeyRound className="w-5 h-5 mr-2" />
                {isLoading ? 'Mengatur PIN...' : 'Atur PIN & Lanjut'}
              </Button>
            </div>
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
                Mengalihkan ke dashboard...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
