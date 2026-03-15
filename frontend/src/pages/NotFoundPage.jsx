import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ShoppingBag, Utensils, User } from 'lucide-react';
import { Button } from '../components/ui/BaseComponents';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-6xl opacity-20"
        >
          🍜
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-10 text-5xl opacity-20"
        >
          🥟
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/4 text-4xl opacity-20"
        >
          🍲
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -6, 6, 0],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/3 right-1/4 text-6xl opacity-20"
        >
          🥢
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl relative z-10"
      >
        {/* 404 Number with Shadow Effect */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative mb-8"
        >
          <h1 className="text-[120px] sm:text-[150px] md:text-[180px] font-extrabold leading-none">
            <span className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </span>
          </h1>
          
          {/* Decorative Bowl */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-md opacity-50" />
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Ups! Halaman Tidak Ditemukan
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin URL salah atau halaman sudah dipindahkan.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
        >
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
          >
            <Home className="w-5 h-5" />
            Beranda
          </Button>
        </motion.div>

        {/* Quick Links Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <span>🔍</span>
            Cari menu lainnya:
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/menu')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-700 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Lihat Menu
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🍜 Bakso lezat
              </p>
            </button>

            <button
              onClick={() => navigate('/orders')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Pesanan Saya
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📋 Lacak order
              </p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Profil
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                👤 Akun saya
              </p>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-gray-500 dark:text-gray-400"
        >
          © 2026 Bakso Premium. Dibuat dengan 🍜 untuk pecinta bakso.
        </motion.p>
      </motion.div>
    </div>
  );
}
