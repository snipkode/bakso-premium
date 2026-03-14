import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ArrowRight, ChefHat, Eye, EyeOff, Sparkles, KeyRound, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button, Input, Card } from '@/components/ui/BaseComponents';
import { BaksoLoginAnimation } from '@/components/ui/BaksoLoginAnimation';
import { BaksoIconAnimation } from '@/components/ui/BaksoIconAnimation';
import { PINOnboardingModal } from '@/components/ui/PINOnboardingModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const { customerAuth, staffLogin, customerPINLogin, isLoading, error, needsPINOnboarding, setNeedsPINOnboarding } = useAuthStore();

  const [loginType, setLoginType] = useState('customer');
  const [customerSubTab, setCustomerSubTab] = useState('new');
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    pin: '',
  });

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    
    // Validate phone format
    if (!/^08[0-9]{8,}$/.test(formData.phone)) {
      alert('Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx');
      return;
    }
    
    try {
      const result = await customerAuth(formData.name, formData.phone);
      
      console.log('📊 Login result:', result);
      console.log('📊 is_existing_user:', result?.is_existing_user);
      console.log('📊 has_pin:', result?.user?.is_pin_set);
      console.log('📊 message:', result?.message);
      
      // Show warning for existing users
      if (result?.is_existing_user) {
        const hasPIN = result?.user?.is_pin_set;
        
        // Store user data and show modal
        setExistingUserData({ hasPIN, message: result.message });
        setShowExistingUserModal(true);
        return; // Don't continue yet, wait for modal decision
      }
      
      // New user - proceed with onboarding
      const shouldShowOnboarding = !result?.user?.is_pin_set;
      
      if (shouldShowOnboarding) {
        setShowOnboarding(true);
      } else {
        navigate('/menu');
      }
    } catch (error) {
      console.error('❌ Customer auth failed:', error);
    }
  };

  const handleExistingUserDecision = (usePIN) => {
    setShowExistingUserModal(false);
    
    if (usePIN) {
      // Switch to existing customer tab
      setCustomerSubTab('existing');
      setFormData({ ...formData, pin: '' });
    } else {
      // Continue with new customer flow
      const shouldShowOnboarding = !existingUserData?.hasPIN;
      
      if (shouldShowOnboarding) {
        setShowOnboarding(true);
      } else {
        navigate('/menu');
      }
    }
    
    setExistingUserData(null);
  };

  const handlePINLogin = async (e) => {
    e.preventDefault();
    try {
      await customerPINLogin(formData.phone, formData.pin);
      navigate('/menu');
    } catch (error) {
      console.error('PIN login failed:', error);
      // Error will be shown via store error state
    }
  };

  const handleOnboardingComplete = async () => {
    console.log('✅ Onboarding complete!');
    setShowOnboarding(false);
    setNeedsPINOnboarding(false);
    console.log('🎯 Navigating to menu...');
    navigate('/menu');
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await staffLogin(formData.phone, formData.password);
      const role = result?.user?.role;
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'kitchen') {
        navigate('/kitchen');
      } else if (role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Staff login failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6"
            >
              <div className="w-40 h-40">
                <BaksoLoginAnimation />
              </div>
              <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">
                Memproses...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Scrollable */}
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-4 pt-6 pb-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-3"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto">
                <BaksoIconAnimation className="w-full h-full" />
              </div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 mt-3">
                Bakso Premium
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm font-medium">
                Nikmati bakso terbaik di kota 🍜
              </p>
            </motion.div>
          </div>

          {/* Login Type Tabs */}
          <div className="flex-shrink-0 px-4 mb-3">
            <Card className="p-1.5 flex gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoginType('customer')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  loginType === 'customer'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🍽️ Pelanggan
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoginType('staff')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  loginType === 'staff'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                👨‍🍳 Staff
              </motion.button>
            </Card>
          </div>

          {/* Customer Type - Radio Buttons */}
          <AnimatePresence>
            {loginType === 'customer' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex-shrink-0 px-4 mb-4 overflow-hidden"
              >
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 border-orange-200/50 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-6">
                    {/* Radio Buttons */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="customerType"
                          value="baru"
                          checked={customerSubTab === 'new'}
                          onChange={() => setCustomerSubTab('new')}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          customerSubTab === 'new'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {customerSubTab === 'new' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full bg-white rounded-full"
                              style={{ margin: '2px' }}
                            />
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        customerSubTab === 'new'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Baru
                      </span>
                    </label>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="customerType"
                          value="lama"
                          checked={customerSubTab === 'existing'}
                          onChange={() => setCustomerSubTab('existing')}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          customerSubTab === 'existing'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {customerSubTab === 'existing' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full bg-white rounded-full"
                              style={{ margin: '2px' }}
                            />
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        customerSubTab === 'existing'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Lama
                      </span>
                    </label>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <div className="flex-1 px-4 pb-6">
            <AnimatePresence mode="wait">
              {loginType === 'customer' ? (
                customerSubTab === 'new' ? (
                  <motion.form
                    key="new-customer"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleCustomerAuth}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Nama Lengkap"
                          placeholder="Masukkan nama Anda"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="pl-11"
                        />
                        <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <Input
                          label="Nomor WhatsApp"
                          placeholder="081234567890"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="pl-11"
                        />
                        <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/30 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Lanjut <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </motion.button>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                      👋 Selamat datang! Anda akan langsung login dengan nomor WhatsApp
                    </p>
                    
                    <div className="text-xs text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                      ℹ️ Jika nomor sudah terdaftar, Anda akan login otomatis
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="existing-customer"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handlePINLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Nomor Telepon"
                          placeholder="Masukkan nomor telepon"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="pl-11"
                        />
                        <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <Input
                          label="PIN (6 digit)"
                          placeholder="Masukkan PIN Anda"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={formData.pin}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, pin: value });
                          }}
                          required
                          className="pl-11"
                        />
                        <KeyRound className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/30 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Login dengan PIN
                    </motion.button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <Mail className="w-4 h-4" />
                        Lupa PIN? Reset via email
                      </button>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-xs text-blue-800 dark:text-blue-300">
                          <p className="font-bold mb-1">Belum punya PIN?</p>
                          <p>Anda bisa mengatur PIN setelah login sebagai pelanggan baru.</p>
                        </div>
                      </div>
                    </div>
                  </motion.form>
                )
              ) : (
                <motion.form
                  key="staff"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleStaffLogin}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Nomor Telepon"
                        placeholder="Masukkan nomor telepon"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="pl-11"
                      />
                      <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="relative">
                      <Input
                        label="Password"
                        placeholder="Masukkan password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pl-11 pr-11"
                      />
                      <ChefHat className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-blue-500/30 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Login Staff
                  </motion.button>

                  <div className="mt-6 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Demo Login:</p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">A</div>
                        <span className="font-mono">081234567890 / admin123</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">K</div>
                        <span className="font-mono">081234567891 / kitchen123</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">D</div>
                        <span className="font-mono">081234567892 / driver123</span>
                      </div>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 text-center border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Dengan melanjutkan, Anda menyetujui{' '}
              <span className="text-orange-600 dark:text-orange-400 font-semibold">Syarat & Ketentuan</span>
            </p>
          </div>
        </div>
      </div>

      {/* PIN Onboarding Modal */}
      <PINOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Existing User Modal */}
      {showExistingUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Selamat Datang Kembali!</h2>
                  <p className="text-sm text-white/90">Nomor ini sudah terdaftar</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {existingUserData?.hasPIN ? (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                      Akun Anda sudah memiliki PIN
                    </p>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Login dengan PIN lebih cepat dan praktis
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => handleExistingUserDecision(false)}
                      className="flex-1"
                    >
                      Lanjutkan
                    </Button>
                    <Button
                      onClick={() => handleExistingUserDecision(true)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                    >
                      Login dengan PIN
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                      Akun Anda belum memiliki PIN
                    </p>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Atur PIN untuk login lebih cepat dan aman
                    </p>
                  </div>

                  <Button
                    onClick={() => handleExistingUserDecision(false)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                  >
                    Lanjutkan
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
