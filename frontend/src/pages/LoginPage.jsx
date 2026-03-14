import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ArrowRight, ChefHat, Truck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button, Input, Card } from '@/components/ui/BaseComponents';

// Delicious Bakso SVG Animation Component
function BaksoAnimation() {
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64">
      {/* Background Glow */}
      <defs>
        <radialGradient id="bowlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="soupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Glow Background */}
      <circle cx="100" cy="100" r="80" fill="url(#bowlGlow)">
        <animate attributeName="r" values="70;80;70" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.3;0.2" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Bowl */}
      <motion.ellipse
        cx="100"
        cy="140"
        rx="70"
        ry="20"
        fill="url(#bowlGradient)"
        initial={{ scaleY: 0.8 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M30 140 C30 140 35 170 100 170 C165 170 170 140 170 140"
        fill="#EA580C"
        initial={{ scaleY: 0.8 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Soup */}
      <ellipse cx="100" cy="135" rx="60" ry="15" fill="url(#soupGradient)" />

      {/* Steam Animations */}
      <g className="steam">
        <path d="M70 120 Q75 100 70 85" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M70 120 Q75 100 70 85;M70 118 Q72 98 68 83;M70 120 Q75 100 70 85" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M100 115 Q105 95 100 80" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M100 115 Q105 95 100 80;M100 113 Q102 93 98 78;M100 115 Q105 95 100 80" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M130 120 Q135 100 130 85" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M130 120 Q135 100 130 85;M130 118 Q132 98 128 83;M130 120 Q135 100 130 85" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Meatballs */}
      <motion.circle
        cx="80"
        cy="135"
        r="12"
        fill="#F97316"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4, type: "spring" }}
      />
      <motion.circle
        cx="120"
        cy="135"
        r="12"
        fill="#F97316"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
      />
      <motion.circle
        cx="100"
        cy="140"
        r="14"
        fill="#F97316"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
      />

      {/* Noodles */}
      <motion.path
        d="M60 130 Q80 125 100 130 Q120 135 140 130"
        stroke="#FCD34D"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />
      <motion.path
        d="M65 138 Q85 133 105 138 Q125 143 145 138"
        stroke="#FCD34D"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />

      {/* Sparkles */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <circle cx="150" cy="110" r="3" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="115" r="2" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="160" cy="130" r="2.5" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>
      </motion.g>

      {/* Bowl Highlight */}
      <ellipse cx="100" cy="135" rx="60" ry="15" fill="none" stroke="#FDBA74" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { customerAuth, staffLogin, isLoading, error } = useAuthStore();

  const [loginType, setLoginType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    try {
      await customerAuth(formData.name, formData.phone);
      navigate('/menu');
    } catch (error) {
      console.error('Customer auth failed:', error);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await staffLogin(formData.phone, formData.password);
      const role = result?.user?.role;
      if (role === 'admin') navigate('/admin-panel');
      else if (role === 'kitchen') navigate('/kitchen');
      else if (role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (error) {
      console.error('Staff login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 dark:bg-amber-900/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header with Bakso Animation */}
      <div className="relative px-4 pt-8 pb-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-4"
        >
          <BaksoAnimation />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
            Bakso Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm font-medium">
            Nikmati bakso terbaik di kota 🍜
          </p>
        </motion.div>
      </div>

      {/* Login Type Tabs */}
      <div className="relative px-4 mb-6">
        <Card className="p-1.5 flex gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
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

      {/* Forms */}
      <div className="relative flex-1 px-4">
        <AnimatePresence mode="wait">
          {loginType === 'customer' ? (
            <motion.form
              key="customer"
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

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/30 rounded-2xl"
                  isLoading={isLoading}
                >
                  Lanjut
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.form>
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

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-blue-500/30 rounded-2xl"
                  isLoading={isLoading}
                >
                  Login Staff
                </Button>
              </motion.div>

              {/* Quick login hints */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700"
              >
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
              </motion.div>
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
      <div className="relative px-4 py-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Dengan melanjutkan, Anda menyetujui{' '}
          <span className="text-orange-600 dark:text-orange-400 font-semibold">Syarat & Ketentuan</span>
        </p>
      </div>
    </div>
  );
}
