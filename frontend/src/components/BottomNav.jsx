import { NavLink } from 'react-router-dom';
import { Home, Utensils, FileText, User, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store';

export function BottomNav() {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/menu', icon: Utensils, label: 'Menu' },
    { path: '/orders', icon: FileText, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border pb-safe-bottom z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 transition-all relative ${
                  isActive ? 'text-primary' : 'text-text-tertiary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    {/* Cart Badge */}
                    {item.path === '/orders' && totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-md">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating Cart Button - Shows when items in cart */}
      {totalItems > 0 && (
        <button
          onClick={() => window.location.href = '/cart'}
          className="fixed bottom-20 right-4 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-3 rounded-full shadow-lg shadow-primary/30 z-40 flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold text-sm">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
        </button>
      )}
    </>
  );
}
