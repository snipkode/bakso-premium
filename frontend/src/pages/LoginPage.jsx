import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, ArrowRight, ChefHat, Truck } from 'lucide-react';
import { useAuthStore } from '../store';
import { Button, Input, Card } from '../components/ui/BaseComponents';

export default function LoginPage() {
  const navigate = useNavigate();
  const { customerAuth, staffLogin, isLoading, error } = useAuthStore();
  
  const [loginType, setLoginType] = useState('customer'); // customer or staff
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    try {
      await customerAuth(formData.name, formData.phone);
      navigate('/menu'); // Customer goes to menu
    } catch (error) {
      console.error('Customer auth failed:', error);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await staffLogin(formData.phone, formData.password);
      
      // Redirect based on role
      const role = result?.user?.role;
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-4xl shadow-ios-lg"
        >
          🍜
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary mt-4">
          Bakso Premium
        </h1>
        <p className="text-text-tertiary mt-1">
          Nikmati bakso terbaik di kota
        </p>
      </div>

      {/* Login Type Tabs */}
      <div className="px-4 mb-6">
        <Card className="p-1 flex">
          <button
            onClick={() => setLoginType('customer')}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
              loginType === 'customer'
                ? 'bg-primary text-white shadow-ios'
                : 'text-text-secondary'
            }`}
          >
            Pelanggan
          </button>
          <button
            onClick={() => setLoginType('staff')}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
              loginType === 'staff'
                ? 'bg-primary text-white shadow-ios'
                : 'text-text-secondary'
            }`}
          >
            Staff
          </button>
        </Card>
      </div>

      {/* Forms */}
      <div className="flex-1 px-4">
        {loginType === 'customer' ? (
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCustomerAuth}
            className="space-y-4"
          >
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama Anda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              icon={<User />}
            />
            <Input
              label="Nomor WhatsApp"
              placeholder="081234567890"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              icon={<Phone />}
            />
            <Button
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
            >
              Lanjut
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.form>
        ) : (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleStaffLogin}
            className="space-y-4"
          >
            <Input
              label="Nomor Telepon"
              placeholder="Masukkan nomor telepon"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              icon={<Phone />}
            />
            <Input
              label="Password"
              placeholder="Masukkan password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
            >
              Login
            </Button>

            {/* Quick login hints */}
            <div className="mt-6 p-4 bg-surface rounded-xl">
              <p className="text-sm font-medium text-text-primary mb-2">
                Demo Login:
              </p>
              <div className="space-y-2 text-xs text-text-tertiary">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  <span>Admin: 081234567890 / admin123</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  <span>Kitchen: 081234567891 / kitchen123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Driver: 081234567892 / driver123</span>
                </div>
              </div>
            </div>
          </motion.form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl">
            <p className="text-sm text-error text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-xs text-text-tertiary">
        <p>Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan</p>
      </div>
    </div>
  );
}
