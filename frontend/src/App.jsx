import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useAppStore } from './store';
import { getSocket, disconnectSocket } from './lib/socket';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminPayments from './pages/admin/Payments';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import KitchenView from './pages/kitchen/KitchenView';
import DriverView from './pages/driver/DriverView';

// Components
import { BottomNav } from './components/BottomNav';
import { Toaster } from './components/Toaster';

function App() {
  const { isAuthenticated, user, token } = useAuthStore();
  const { darkMode, setOnline, setPushEnabled } = useAppStore();

  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser && !token) {
      // Token exists but not in store (page refresh)
      useAuthStore.setState({
        token: savedToken,
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }

    // Online/offline detection
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Protected route wrapper
  const ProtectedRoute = ({ children, roles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background pb-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/track/:id" element={<TrackOrderPage />} />

          {/* Customer Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute roles={['customer']}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['customer']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Kitchen Routes */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute roles={['kitchen']}>
                <KitchenView />
              </ProtectedRoute>
            }
          />

          {/* Driver Routes */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={['driver']}>
                <DriverView />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Bottom Navigation for Customer */}
        {isAuthenticated && user?.role === 'customer' && <BottomNav />}
        
        {/* Toast notifications */}
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
