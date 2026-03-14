import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ArrowRight, ChefHat, Eye, EyeOff, Sparkles, KeyRound, Mail, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button, Input, Card } from '@/components/ui/BaseComponents';
import { BaksoLoginAnimation } from '@/components/ui/BaksoLoginAnimation';
import { BaksoIconAnimation } from '@/components/ui/BaksoIconAnimation';
import { PINOnboardingModal } from '@/components/ui/PINOnboardingModal';
import { customerPINAPI } from '@/lib/api';

// Role greetings for staff redirect
const roleGreetings = {
  admin: { title: 'Administrator', icon: '👨‍💼', color: 'from-purple-500 to-pink-500' },
  kitchen: { title: 'Kitchen Staff', icon: '👨‍🍳', color: 'from-blue-500 to-cyan-500' },
  driver: { title: 'Driver', icon: '🛵', color: 'from-green-500 to-emerald-500' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { customerAuth, staffLogin, customerPINLogin, isLoading, error, needsPINOnboarding, setNeedsPINOnboarding } = useAuthStore();

  const [loginType, setLoginType] = useState('customer');
  const [customerSubTab, setCustomerSubTab] = useState('new');
  const [showPassword, setShowPassword] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [staffLoginType, setStaffLoginType] = useState('password'); // 'password' or 'pin'
  const [showExpiredPINModal, setShowExpiredPINModal] = useState(false);
  const [expiredPINUserData, setExpiredPINUserData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);
  const [showResetPINModal, setShowResetPINModal] = useState(false);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [showStaffRedirectModal, setShowStaffRedirectModal] = useState(false);
  const [staffRole, setStaffRole] = useState('admin');
  const [staffRedirectTimer, setStaffRedirectTimer] = useState(5);
  const [verificationPhone, setVerificationPhone] = useState('');
  const [verificationPhoneError, setVerificationPhoneError] = useState('');
  const [existingUserData, setExistingUserData] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(4);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    pin: '',
    password: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    pin: '',
  });

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Nama lengkap wajib diisi';
    }
    if (name.length < 3) {
      return 'Nama minimal 3 karakter';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Nomor WhatsApp wajib diisi';
    }
    if (!/^08[0-9]{8,}$/.test(phone)) {
      return 'Format nomor tidak valid (gunakan 08xxxxxxxxxx)';
    }
    return '';
  };

  const validatePIN = (pin) => {
    if (!pin || pin.length === 0) {
      return 'PIN wajib diisi';
    }
    if (!/^\d{6}$/.test(pin)) {
      return 'PIN harus 6 digit angka';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Password wajib diisi';
    }
    if (password.length < 6) {
      return 'Password minimal 6 karakter';
    }
    return '';
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'pin':
        error = validatePIN(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = (type) => {
    let isValid = true;
    const errors = { name: '', phone: '', pin: '', password: '' };

    if (type === 'new-customer') {
      const nameError = validateName(formData.name);
      const phoneError = validatePhone(formData.phone);
      errors.name = nameError;
      errors.phone = phoneError;
      if (nameError || phoneError) isValid = false;
    } else if (type === 'existing-customer') {
      const pinError = validatePIN(formData.pin);
      errors.pin = pinError;
      if (pinError) isValid = false;
    } else if (type === 'staff') {
      const phoneError = validatePhone(formData.phone);
      const passwordError = validatePassword(formData.password);
      errors.phone = phoneError;
      errors.password = passwordError;
      if (phoneError || passwordError) isValid = false;
    } else if (type === 'staff-pin') {
      const phoneError = validatePhone(formData.phone);
      const pinError = validatePIN(formData.pin);
      errors.phone = phoneError;
      errors.pin = pinError;
      if (phoneError || pinError) isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleResetPIN = async () => {
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetEmailError('Email tidak valid');
      return;
    }

    setResetEmailError('');

    // Show phone verification modal instead of prompt
    setShowPhoneVerificationModal(true);
  };

  const handlePhoneVerificationSubmit = async () => {
    // Validate phone
    if (!verificationPhone || !/^08[0-9]{8,}$/.test(verificationPhone)) {
      setVerificationPhoneError('Nomor HP tidak valid. Gunakan format 08xxxxxxxxxx');
      return;
    }

    setVerificationPhoneError('');

    try {
      setResetLoading(true);
      console.log('📧 Sending reset PIN email to:', resetEmail);
      console.log('📊 Phone:', verificationPhone);
      
      const response = await customerPINAPI.forgotPIN(verificationPhone, resetEmail);
      console.log('✅ Reset email sent:', response.data);
      
      // Get message from response
      const successMessage = response.data?.message || 'Permintaan reset PIN telah dikirim';
      
      setResetSent(true);
      setShowPhoneVerificationModal(false);
      setVerificationPhone('');
      
      // Store message for display
      setResetSuccessMessage(successMessage);
    } catch (error) {
      console.error('❌ Failed to send reset email:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Gagal mengirim link reset PIN';
      alert('⚠️ ' + errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  const handleClosePhoneVerification = () => {
    setShowPhoneVerificationModal(false);
    setVerificationPhone('');
    setVerificationPhoneError('');
  };

  const handleCloseResetModal = () => {
    setShowResetPINModal(false);
    setResetEmail('');
    setResetSent(false);
  };

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm('new-customer')) {
      return;
    }
    
    try {
      const result = await customerAuth(formData.name, formData.phone);
      
      console.log('📊 Login result:', result);
      
      // New user - proceed with onboarding
      const shouldShowOnboarding = !result?.user?.is_pin_set;
      
      if (shouldShowOnboarding) {
        setShowOnboarding(true);
      } else {
        navigate('/menu');
      }
    } catch (error) {
      console.error('❌ Customer auth failed:', error);
      
      // Handle staff member trying to login as customer (400 with requires_staff_login)
      if (error.response?.status === 400 && error.response?.data?.requires_staff_login) {
        const userRole = error.response.data.role || 'admin';
        
        // Set staff role for modal display
        setStaffRole(userRole);
        
        // Show staff redirect modal
        setShowStaffRedirectModal(true);
        setStaffRedirectTimer(5);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setStaffRedirectTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Auto redirect to staff login
              setLoginType('staff');
              setShowStaffRedirectModal(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return;
      }
      
      // Handle existing user (409 Conflict)
      if (error.response?.status === 409 && error.response?.data?.requires_pin_login) {
        const data = error.response.data;
        const hasPIN = data.has_pin;
        
        console.log('👋 Existing user detected!');
        
        // Store user data and show modal with timer
        setExistingUserData({ hasPIN, message: data.message });
        setRedirectTimer(4);
        setShowExistingUserModal(true);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setRedirectTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Auto redirect to PIN login
              setCustomerSubTab('existing');
              setFormData(prevData => ({ ...prevData, pin: '' }));
              setShowExistingUserModal(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Other errors
        alert(error.response?.data?.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

  const handlePINLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm('existing-customer')) {
      return;
    }
    
    try {
      console.log('🔑 Attempting PIN login...');
      const result = await customerPINLogin(formData.phone, formData.pin);
      
      console.log('✅ PIN login successful!');
      console.log('📊 Token received:', result?.token ? 'Yes' : 'No');
      console.log('📊 User:', result?.user);
      
      // Check if token is in localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('💾 Token in localStorage:', storedToken ? 'Yes' : 'No');
      console.log('💾 User in localStorage:', storedUser ? 'Yes' : 'No');
      
      if (storedToken) {
        console.log('✅ Authentication ready! Navigating to menu...');
        navigate('/menu');
      } else {
        console.error('❌ ERROR: Token not saved to localStorage!');
        alert('Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ PIN login failed:', error);
      console.error('Error response:', error.response);
      
      // Handle special case: User exists but PIN not set (403)
      if (error.response?.status === 403 && error.response?.data?.requires_pin_setup) {
        const userData = error.response.data.user;
        
        console.log('⚠️ User exists but PIN not set:', userData);
        
        // Store user data temporarily for onboarding
        localStorage.setItem('pending_user', JSON.stringify(userData));
        
        // Redirect to onboarding
        alert(
          '🔒 Akun Belum Lengkap\n\n' +
          'Nomor ini sudah terdaftar tetapi belum mengatur PIN.\n\n' +
          'Silakan atur PIN untuk melanjutkan.'
        );
        
        // Switch to new customer tab for onboarding
        setCustomerSubTab('new');
        setFormData({
          ...formData,
          name: userData.name || '',
          phone: userData.phone || '',
          pin: ''
        });
        
        // Show onboarding after alert
        setTimeout(() => {
          setShowOnboarding(true);
        }, 100);
        
        return;
      }
      
      // Other errors
      alert(error.response?.data?.error || 'PIN salah atau terjadi kesalahan.');
    }
  };

  const handleOnboardingComplete = async () => {
    console.log('✅ Onboarding complete!');
    
    // Check if there's a pending user (from PIN login with missing PIN)
    const pendingUserStr = localStorage.getItem('pending_user');
    
    if (pendingUserStr) {
      // User was updating their PIN, not creating new account
      console.log('📝 Updating PIN for existing user');
      localStorage.removeItem('pending_user');
    }
    
    setShowOnboarding(false);
    setNeedsPINOnboarding(false);
    console.log('🎯 Navigating to menu...');
    navigate('/menu');
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    
    // Validate based on login type
    if (staffLoginType === 'pin') {
      if (!validateForm('staff-pin')) {
        return;
      }
      
      // Staff PIN login - use staffLogin API with pin parameter
      try {
        console.log('🔑 Staff PIN login:', formData.phone, formData.pin);
        
        // Call staffLogin with pin instead of password
        const result = await staffLogin(formData.phone, formData.pin);
        
        console.log('✅ Staff PIN login successful:', result);
        
        const role = result?.user?.role;
        
        // Verify user is staff
        if (!['admin', 'kitchen', 'driver'].includes(role)) {
          alert('⚠️ Akun ini bukan akun Staff. Silakan gunakan login Customer.');
          return;
        }
        
        // Store auth data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'kitchen') {
          navigate('/kitchen');
        } else if (role === 'driver') {
          navigate('/driver');
        }
      } catch (error) {
        console.error('❌ Staff PIN login failed:', error);
        
        // Handle PIN expired for staff
        if (error.response?.status === 403 && error.response?.data?.pin_expired) {
          // Store user data and show confirmation modal
          setExpiredPINUserData(error.response.data.user);
          setShowExpiredPINModal(true);
          return;
        }
        
        alert(error.response?.data?.error || 'PIN salah atau terjadi kesalahan.');
      }
    } else {
      // Staff password login
      if (!validateForm('staff')) {
        return;
      }
      
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
    }
  };

  const handleExpiredPINConfirm = async () => {
    // Validate password confirmation
    if (!formData.password) {
      alert('⚠️ Password harus diisi untuk konfirmasi');
      return;
    }

    try {
      // Verify password first
      const result = await staffLogin(formData.phone, formData.password);
      
      // Password verified - proceed to PIN setup
      setShowExpiredPINModal(false);
      setCustomerSubTab('new');
      setFormData({
        ...formData,
        name: expiredPINUserData?.name || '',
        phone: expiredPINUserData?.phone || '',
        password: '',
        pin: ''
      });
      setShowOnboarding(true);
    } catch (error) {
      console.error('❌ Password confirmation failed:', error);
      alert('⚠️ Password salah. Silakan coba lagi.');
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
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            validateField('name', e.target.value);
                          }}
                          required
                          className="pl-11"
                        />
                        <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                        {formErrors.name && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{formErrors.name}</span>
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          label="Nomor WhatsApp"
                          placeholder="081234567890"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            validateField('phone', e.target.value);
                          }}
                          required
                          className="pl-11"
                        />
                        <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                        {formErrors.phone && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{formErrors.phone}</span>
                          </p>
                        )}
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
                      ℹ️ Jika nomor sudah terdaftar, Anda akan diarahkan untuk login dengan PIN
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
                          type={showPIN ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={formData.pin}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, pin: value });
                            validateField('pin', value);
                          }}
                          required
                          className="pl-11 pr-11"
                        />
                        <KeyRound className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPIN(!showPIN)}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPIN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {formErrors.pin && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{formErrors.pin}</span>
                          </p>
                        )}
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
                        onClick={() => setShowResetPINModal(true)}
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
                  {/* Login Type Toggle */}
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Jenis Login Staff</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="staffLoginType"
                          value="password"
                          checked={staffLoginType === 'password'}
                          onChange={(e) => setStaffLoginType(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-xl border-2 transition-all ${
                          staffLoginType === 'password'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}>
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className={`text-sm font-semibold ${
                              staffLoginType === 'password'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>Password</span>
                          </div>
                        </div>
                      </label>

                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="staffLoginType"
                          value="pin"
                          checked={staffLoginType === 'pin'}
                          onChange={(e) => setStaffLoginType(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-xl border-2 transition-all ${
                          staffLoginType === 'pin'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}>
                          <div className="flex items-center justify-center gap-2">
                            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className={`text-sm font-semibold ${
                              staffLoginType === 'pin'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>PIN</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {staffLoginType === 'pin' && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <span>🔄</span>
                          <span><strong>Info:</strong> PIN staff akan direset otomatis setiap 1 bulan untuk keamanan. Anda akan menerima email notifikasi sebelum reset.</span>
                        </p>
                      </div>
                    )}
                  </Card>

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

                    {staffLoginType === 'password' ? (
                      <div className="relative">
                        <Input
                          label="Password"
                          placeholder="Masukkan password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            validateField('password', e.target.value);
                          }}
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
                        {formErrors.password && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{formErrors.password}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          label="PIN (6 digit)"
                          placeholder="Masukkan PIN Anda"
                          type={showPIN ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={formData.pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, pin: value });
                            validateField('pin', value);
                          }}
                          required
                          className="pl-11 pr-11"
                        />
                        <KeyRound className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPIN(!showPIN)}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPIN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {formErrors.pin && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{formErrors.pin}</span>
                          </p>
                        )}
                      </div>
                    )}
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

      {/* Existing User Modal with Timer */}
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

                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-orange-800 dark:text-orange-300 text-center font-semibold">
                      ⏱️ Redirect otomatis dalam <span className="text-2xl text-orange-600 dark:text-orange-400 mx-1">{redirectTimer}</span> detik
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setCustomerSubTab('existing');
                      setShowExistingUserModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                  >
                    Login dengan PIN Sekarang
                  </Button>
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

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 text-center font-semibold">
                      ⏱️ Redirect otomatis dalam <span className="text-2xl text-blue-600 dark:text-blue-400 mx-1">{redirectTimer}</span> detik
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setCustomerSubTab('existing');
                      setShowExistingUserModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                  >
                    Lanjutkan Atur PIN
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {showResetPINModal && (
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
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reset PIN</h2>
                  <p className="text-sm text-white/90">Kirim link reset via email</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!resetSent ? (
                <>
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>ℹ️ Info:</strong> Link reset PIN akan dikirim ke email Anda. Link ini hanya berlaku selama 1 jam.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetEmailError('');
                        }}
                        placeholder="nama@email.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        disabled={resetLoading}
                      />
                    </div>
                    {resetEmailError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{resetEmailError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleCloseResetModal}
                      className="flex-1"
                      disabled={resetLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleResetPIN}
                      isLoading={resetLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30"
                    >
                      {resetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </Button>
                  </div>
                </>
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
                    Permintaan Reset Dikirim!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {resetSuccessMessage}<br />
                    <strong className="text-gray-900 dark:text-white">{resetEmail}</strong>
                  </p>
                  <Button
                    onClick={handleCloseResetModal}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                  >
                    Tutup
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verifikasi Nomor HP</h2>
                  <p className="text-sm text-white/90">Untuk keamanan akun Anda</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>🔒 Keamanan:</strong> Kami perlu memverifikasi nomor HP Anda untuk mengirim link reset PIN.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={verificationPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setVerificationPhone(value);
                      setVerificationPhoneError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePhoneVerificationSubmit();
                      }
                    }}
                    placeholder="081234567890"
                    maxLength={13}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={resetLoading}
                  />
                </div>
                {verificationPhoneError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-3 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{verificationPhoneError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleClosePhoneVerification}
                  className="flex-1"
                  disabled={resetLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePhoneVerificationSubmit}
                  isLoading={resetLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30"
                >
                  {resetLoading ? 'Mengirim...' : 'Verifikasi & Lanjut'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Staff Redirect Modal */}
      {showStaffRedirectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className={`relative bg-gradient-to-br ${roleGreetings[staffRole]?.color || 'from-purple-500 to-pink-500'} p-6 text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                  {roleGreetings[staffRole]?.icon || '👤'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">Selamat Datang, {roleGreetings[staffRole]?.title || 'Staff'}! 👋</h2>
                  <p className="text-sm text-white/90">Anda login sebagai {roleGreetings[staffRole]?.title || 'Staff'}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔑</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Akun ini terdaftar sebagai <strong className="text-orange-600 dark:text-orange-400">{roleGreetings[staffRole]?.title || 'Staff'}</strong>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Silakan gunakan form login Staff untuk masuk
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 text-center font-semibold">
                  ⏱️ Redirect otomatis ke login Staff dalam <span className="text-2xl text-blue-600 dark:text-blue-400 mx-1">{staffRedirectTimer}</span> detik
                </p>
              </div>

              <Button
                onClick={() => {
                  setLoginType('staff');
                  setShowStaffRedirectModal(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30"
              >
                Login Staff Sekarang
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Expired PIN Confirmation Modal */}
      {showExpiredPINModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                  🔄
                </div>
                <div>
                  <h2 className="text-xl font-bold">PIN Kadaluarsa</h2>
                  <p className="text-sm text-white/90">Konfirmasi untuk reset PIN</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                  <strong className="text-amber-600 dark:text-amber-400">{expiredPINUserData?.name}</strong><br/>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{expiredPINUserData?.role}</span>
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
                    🔒 PIN Anda sudah kadaluarsa (reset 1 bulan).<br/><br/>
                    <strong>Untuk keamanan, silakan konfirmasi dengan password untuk mengatur PIN baru.</strong>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password Konfirmasi
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan password Anda"
                    className="pl-4 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowExpiredPINModal(false);
                    setExpiredPINUserData(null);
                    setFormData({ ...formData, password: '' });
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleExpiredPINConfirm}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                >
                  Konfirmasi & Reset PIN
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
