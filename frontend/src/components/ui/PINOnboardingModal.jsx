import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Shield, Check, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui/BaseComponents';
import { BaksoIconAnimation } from './BaksoIconAnimation';
import { customerPINAPI } from '@/lib/api';

export function PINOnboardingModal({ isOpen, onClose, onComplete }) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN, 3: Success

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
        setTimeout(() => setStep(2), 300);
      } else if (isConfirm && fullPin.length === 6) {
        handleSubmit(fullPin);
      }
    }

    setError('');
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${isConfirm ? 'confirm' : 'enter'}-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (finalPin) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🔑 Setting PIN...');
      
      // Call API to set PIN
      const response = await customerPINAPI.setPIN(finalPin);
      console.log('✅ PIN set successfully:', response.data);
      
      setStep(3);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('❌ Failed to set PIN:', err);
      setError(err.response?.data?.error || 'Gagal mengatur PIN. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          // Prevent closing by clicking outside
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            // Prevent closing by clicking inside
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
              {/* Close button removed - modal cannot be closed until PIN is set */}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BaksoIconAnimation className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Atur PIN Keamanan</h2>
                  <p className="text-sm text-white/90">Amankan akun Anda dengan PIN</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s <= step ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Required Notice */}
              <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl">
                <Shield className="w-4 h-4" />
                <p className="text-xs font-medium">Wajib diatur untuk melanjutkan</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <Shield className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Buat PIN 6 Digit
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      PIN akan digunakan untuk login dengan lebih cepat dan aman
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-enter-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    🔒 PIN Anda akan dienkripsi dan disimpan dengan aman
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <KeyRound className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Konfirmasi PIN
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Masukkan ulang PIN Anda untuk konfirmasi
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    {confirmPin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-confirm-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value, true)}
                        onKeyDown={(e) => handleKeyDown(index, e, true)}
                        className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={handleBack}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Kembali
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    PIN Berhasil Diatur!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Akun Anda sekarang lebih aman
                  </p>
                </motion.div>
              )}

              {/* Info Box */}
              {step < 3 && (
                <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      <p className="font-bold mb-1">Manfaat PIN:</p>
                      <ul className="space-y-1">
                        <li>• Login lebih cepat dengan nomor HP + PIN</li>
                        <li>• Tidak perlu password rumit</li>
                        <li>• Dapat direset via email jika lupa</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
