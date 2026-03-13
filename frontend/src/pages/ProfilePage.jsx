import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Moon, Bell, HelpCircle } from 'lucide-react';
import { Button, Card } from '../components/ui/BaseComponents';
import { useAppStore } from '../store';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useAppStore();

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Edit Profile', onClick: () => {} },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifikasi', onClick: () => {} },
    { icon: <Moon className="w-5 h-5" />, label: darkMode ? 'Light Mode' : 'Dark Mode', onClick: toggleDarkMode },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Bantuan', onClick: () => {} },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-sm opacity-80">{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 py-6 space-y-3">
        {menuItems.map((item, idx) => (
          <Card
            key={idx}
            onClick={item.onClick}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary">{item.icon}</span>
              <span className="text-text-primary">{item.label}</span>
            </div>
          </Card>
        ))}

        <Button
          variant="error"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full mt-6 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
