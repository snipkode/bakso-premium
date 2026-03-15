import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Card } from '@/components/ui/BaseComponents';
import { customerPINAPI } from '@/lib/api';

export default function ResetPINPage() {
  const { token, email } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('validating'); // validating, reset, success, error
  const [newPin, setNewPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailDecoded, setEmailDecoded] = useState('');

  useEffect(() => {
    // Decode email from URL
    if (email) {
      setEmailDecoded(decodeURIComponent(email));
    }

    // Validate token
    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    try {
      // Token validation happens on backend when submitting
      // For now, just check if token exists
      if (!token || token.length !== 64) {
        setStep('error');
        setError('Link reset PIN tidak valid atau sudah kadaluarsa.');
        return;
      }
      
      setStep('reset');
    } catch (error) {
      setStep('error');
      setError('Link reset PIN tidak valid atau sudah kadaluarsa.');
    }
  };

  const handlePinChange = (index, value, isConfirm = false) => {
    if (value && !/^\d$/.test(value)) return;

    const setter = isConfirm ? setConfirmPin : setNewPin;
    const newPinArray = [...(isConfirm ? confirmPin : newPin)];
    newPinArray[index] = value;
    setter(newPinArray);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${isConfirm ? 'confirm' : 'new'}-${index + 1}`);
      nextInput?.focus();
    }

    setError('');
  };

  const handleResetPIN = async () => {
    // Validate
    if (newPin.join('').length !== 6) {
      setError('PIN harus 6 digit angka');
      return;
    }

    if (newPin.join('') !== confirmPin.join('')) {
      setError('PIN tidak cocok');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Submit new PIN with token
      const response = await customerPINAPI.resetPIN(token, emailDecoded, newPin.join(''));
      console.log('✅ PIN reset successful:', response.data);

      setStep('success');

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('❌ Failed to reset PIN:', error);
      setError(error.response?.data?.error || 'Gagal mengatur PIN baru. Link mungkin sudah kadaluarsa.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30"
          >
            <KeyRound className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Reset PIN
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Atur ulang PIN akun Anda
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-2xl">
          {step === 'validating' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Memvalidasi link...</p>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              {/* Email Display */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Email:</strong> {emailDecoded}
                </p>
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  PIN Baru (6 digit)
                </label>
                <div className="flex gap-2 justify-center">
                  {newPin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-new-${index}`}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi PIN Baru
                </label>
                <div className="flex gap-2 justify-center">
                  {confirmPin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-confirm-${index}`}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, true)}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={loading}
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
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="showPin" className="text-sm text-gray-600 dark:text-gray-400">
                  Tampilkan PIN
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleResetPIN}
                isLoading={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 py-4 text-base font-bold"
                disabled={newPin.join('').length !== 6 || confirmPin.join('').length !== 6}
              >
                <KeyRound className="w-5 h-5 mr-2 inline" />
                {loading ? 'Mengatur PIN...' : 'Atur PIN Baru'}
              </Button>
            </div>
          )}

          {step === 'success' && (
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda akan diarahkan ke halaman login...
              </p>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <XCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Link Tidak Valid
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'Link reset PIN sudah kadaluarsa atau tidak valid.'}
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 py-4 text-base font-bold"
              >
                Kembali ke Login
              </Button>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Link reset PIN hanya berlaku selama 1 jam
        </p>
      </motion.div>
    </div>
  );
}
