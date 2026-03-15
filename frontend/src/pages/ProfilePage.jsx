import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Moon, Bell, HelpCircle, Settings, Shield, Star, ChevronRight, Mail, Phone, Edit2, X, CheckCircle, RefreshCw, KeyRound } from 'lucide-react';
import { Button, Card, IconButton, Input } from '../components/ui/BaseComponents';
import { useAppStore } from '../store';
import { orderAPI, loyaltyAPI, authAPI, customerPINAPI } from '../lib/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useAppStore();

  const [stats, setStats] = useState({
    totalOrders: 0,
    loyaltyPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [updating, setUpdating] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching profile stats...');
      
      const [ordersRes, loyaltyRes] = await Promise.all([
        orderAPI.getMyOrders({ limit: 1, page: 1 }),
        loyaltyAPI.getLoyaltyPoints().catch((err) => {
          console.log('⚠️ Loyalty API error, using fallback:', err.message);
          return { data: { points: 0, total_points: 0 } };
        }),
      ]);

      console.log('📊 Orders response:', ordersRes.data);
      console.log('🎁 Loyalty response:', loyaltyRes.data);

      setStats({
        totalOrders: ordersRes.data?.total || ordersRes.data?.count || ordersRes.data?.totalOrders || 0,
        loyaltyPoints: loyaltyRes.data?.points || loyaltyRes.data?.total_points || loyaltyRes.data?.loyalty_points || 0,
      });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error.message);
      setStats({ totalOrders: 0, loyaltyPoints: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name || !editForm.phone) {
      alert('Nama dan nomor telepon wajib diisi');
      return;
    }

    try {
      setUpdating(true);
      await authAPI.updateProfile(editForm);
      updateUser(editForm);
      setShowEditModal(false);
      alert('Profile berhasil diupdate');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.error || 'Gagal mengupdate profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPIN = async () => {
    // 🔒 SECURITY CHECK: Don't show reset modal if email not set
    if (!user?.email) {
      // Show toast notification instead of alert
      const toastEvent = new CustomEvent('show-toast', {
        detail: {
          title: 'Email Diperlukan',
          description: 'Silakan update profile Anda terlebih dahulu untuk menambahkan email, kemudian coba reset PIN lagi.',
          variant: 'warning',
        },
      });
      window.dispatchEvent(toastEvent);
      
      // Redirect to edit modal
      setShowEditModal(true);
      return;
    }

    // Show reset confirmation modal
    setResetEmail(user.email);
    setShowResetModal(true);
  };

  const handleSendVerificationEmail = async () => {
    try {
      setSendingVerification(true);
      setVerificationSent(false);
      
      await authAPI.sendVerificationEmail();
      
      setVerificationSent(true);
      
      // Show success toast
      const toastEvent = new CustomEvent('show-toast', {
        detail: {
          title: '✅ Email Verifikasi Terkirim',
          description: 'Cek inbox Anda dan klik link verifikasi. Bonus 50 poin akan ditambahkan setelah verifikasi!',
          variant: 'success',
          duration: 8000,
        },
      });
      window.dispatchEvent(toastEvent);
      
    } catch (error) {
      console.error('Failed to send verification email:', error);
      
      const toastEvent = new CustomEvent('show-toast', {
        detail: {
          title: '❌ Gagal Mengirim Email',
          description: error.response?.data?.error || 'Terjadi kesalahan. Silakan coba lagi.',
          variant: 'error',
        },
      });
      window.dispatchEvent(toastEvent);
      
    } finally {
      setSendingVerification(false);
    }
  };

  const handleConfirmResetPIN = async () => {
    setShowResetModal(false);
    
    try {
      setResetLoading(true);
      console.log('📧 Sending reset PIN request...');
      console.log('📊 Phone:', user.phone);
      console.log('📊 Email:', user.email);

      // Send phone and email for validation
      const response = await customerPINAPI.forgotPIN(user.phone, user.email);
      console.log('✅ Reset email sent:', response.data);

      const attemptsRemaining = response.data.attempts_remaining;
      const backendMessage = response.data.message || 'Link reset PIN telah dikirim ke email Anda';

      // Show success toast
      const toastEvent = new CustomEvent('show-toast', {
        detail: {
          title: '✅ Email Terkirim',
          description: backendMessage,
          variant: 'success',
        },
      });
      window.dispatchEvent(toastEvent);

      console.log('📧 Reset PIN email sent to:', user.email);
      if (attemptsRemaining !== undefined) {
        console.log('📊 Attempts remaining:', attemptsRemaining);
      }
    } catch (error) {
      console.error('❌ Failed to send reset email:', error);
      const errorMsg = error.response?.data?.error || 'Gagal mengirim link reset PIN';

      // Show error toast
      const errorToast = new CustomEvent('show-toast', {
        detail: {
          title: error.response?.status === 429 ? '⚠️ Terlalu Banyak Percobaan' : '❌ Gagal Reset PIN',
          description: errorMsg,
          variant: 'error',
        },
      });
      window.dispatchEvent(errorToast);
    } finally {
      setResetLoading(false);
    }
  };

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: 'Edit Profile',
      subtitle: 'Kelola informasi akun Anda',
      onClick: handleEditClick,
      gradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <KeyRound className="w-5 h-5" />,
      label: 'Reset PIN',
      subtitle: user?.email ? 'Atur ulang PIN via email' : 'Email diperlukan',
      onClick: handleResetPIN,
      gradient: 'from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      disabled: !user?.email, // Disable button if email not set
      opacity: !user?.email ? 'opacity-50' : 'opacity-100',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifikasi',
      subtitle: 'Atur preferensi notifikasi',
      onClick: () => navigate('/notifications'),
      gradient: 'from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: <Moon className="w-5 h-5" />,
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      subtitle: darkMode ? 'Mode terang' : 'Mode gelap',
      onClick: toggleDarkMode,
      gradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Bantuan',
      subtitle: 'Pusat bantuan dan dukungan',
      onClick: () => {},
      gradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            Profile Saya
          </h1>
          <IconButton
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg"
          >
            <Settings className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 py-6">
        <Card className="p-6 bg-gradient-to-br from-primary to-orange-500 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 text-6xl">🍜</div>
            <div className="absolute bottom-4 left-4 text-4xl">🍲</div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-lg relative">
                {user?.name?.charAt(0).toUpperCase()}
                {/* Verified Badge */}
                {user?.email ? (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-primary flex items-center justify-center shadow-lg" title="Akun Terverifikasi">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full border-4 border-primary flex items-center justify-center shadow-lg" title="Belum Terverifikasi">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {user?.name || 'User'}
                  {user?.email && (
                    <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </h2>
                <p className="text-sm text-white/90 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {user?.phone || 'Belum diatur'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" />
                  {user?.email ? (
                    <div className="flex items-center gap-2">
                      <span>{user.email}</span>
                      {user.email_verified ? (
                        <span className="text-xs text-green-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={sendingVerification || verificationSent}
                          className="text-xs bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1 transition-all"
                        >
                          {sendingVerification ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Mengirim...
                            </>
                          ) : verificationSent ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Terkirim
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3" />
                              Verifikasi (+50 pts)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-red-300">Belum diatur</span>
                  )}
                </div>
              </div>
              <IconButton
                onClick={handleEditClick}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Edit2 className="w-5 h-5" />
              </IconButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">Total Pesanan</span>
                  </div>
                  <button
                    onClick={fetchStats}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.totalOrders}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">Poin Loyalty</span>
                  </div>
                  <button
                    onClick={fetchStats}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.loyaltyPoints}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Info */}
      <div className="px-4 py-2">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border-blue-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Akun Verified</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nomor telepon terverifikasi</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu */}
      <div className="px-4 py-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
          Pengaturan
        </h3>
        {menuItems.map((item, idx) => (
          <Card
            key={idx}
            onClick={item.disabled ? undefined : item.onClick}
            className={`p-4 bg-gradient-to-r ${item.gradient} ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'} transition-all transform ${!item.disabled && 'hover:scale-[1.01]'} border-l-4 ${item.opacity || ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                </div>
              </div>
              {item.disabled ? (
                <X className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </Card>
        ))}

        {/* Logout Button */}
        <Card className="p-4 mt-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-900/30">
          <Button
            variant="error"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar dari Akun</span>
          </Button>
        </Card>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Bakso Premium v1.0.0
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
            Made with 🍜 for bakso lovers
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update informasi akun Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama lengkap"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="081234567890"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full"
                    pattern="[0-9]*"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-gray-400">(Opsional)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="contoh@email.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  isLoading={updating}
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/30"
                >
                  {updating ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reset PIN Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Reset PIN via Email</h2>
                  <p className="text-sm text-white/90">Konfirmasi pengiriman link reset</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>📧 Email:</strong> {resetEmail}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Link reset PIN akan dikirim ke email di atas. Link ini hanya berlaku selama 1 jam.
                </p>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ Pastikan email yang dimasukkan benar. Cek inbox dan spam folder Anda setelah mengirim.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1"
                  disabled={resetLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleConfirmResetPIN}
                  isLoading={resetLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                >
                  {resetLoading ? (
                    'Mengirim...'
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2 inline" />
                      Kirim Link Reset
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
