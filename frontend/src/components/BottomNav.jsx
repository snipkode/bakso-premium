import { NavLink } from 'react-router-dom';
import { Home, FileText, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Menu' },
    { path: '/orders', icon: FileText, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border pb-safe-bottom z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center py-3 px-4 transition-all ${
                isActive ? 'text-primary' : 'text-text-tertiary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
