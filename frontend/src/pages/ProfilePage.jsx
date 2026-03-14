import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Moon, Bell, HelpCircle, Settings, Shield, Star, ChevronRight, Mail, Phone } from 'lucide-react';
import { Button, Card, IconButton } from '../components/ui/BaseComponents';
import { useAppStore } from '../store';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useAppStore();

  const menuItems = [
    { 
      icon: <User className="w-5 h-5" />, 
      label: 'Edit Profile', 
      subtitle: 'Kelola informasi akun Anda',
      onClick: () => {},
      gradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
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

  const stats = [
    { label: 'Total Pesanan', value: '0', icon: <Star className="w-4 h-4" /> },
    { label: 'Poin Loyalty', value: '0', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-orange-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            Profile
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
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{user?.name || 'User'}</h2>
                <p className="text-sm text-white/90 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {user?.phone || 'Belum diatur'}
                </p>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user?.email || 'Belum diatur'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/80">{stat.icon}</span>
                    <span className="text-xs text-white/80">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
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
            onClick={item.onClick}
            className={`p-4 bg-gradient-to-r ${item.gradient} cursor-pointer hover:shadow-md transition-all transform hover:scale-[1.01] border-l-4`}
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
              <ChevronRight className="w-5 h-5 text-gray-400" />
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
    </div>
  );
}
