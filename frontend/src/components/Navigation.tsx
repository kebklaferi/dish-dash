import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { UserRole } from '@/types';
import {
  Home,
  Store,
  ShoppingBag,
  User,
  ChefHat,
  Truck,
  Shield,
  LogOut,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export function Navigation() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { to: '/', icon: Home, label: 'Home' },
      { to: '/restaurants', icon: Store, label: 'Restaurants' },
    ];

    switch (user.role) {
      case UserRole.CUSTOMER:
        return [
          ...baseItems,
          { to: '/order', icon: ShoppingBag, label: 'Order', badge: itemCount },
        ];
      case UserRole.RESTAURANT:
        return [
          ...baseItems,
          { to: '/restaurant-dashboard', icon: ChefHat, label: 'Dashboard' },
        ];
      case UserRole.COURIER:
        return [
          ...baseItems,
          { to: '/courier-dashboard', icon: Truck, label: 'Deliveries' },
        ];
      case UserRole.ADMIN:
        return [
          ...baseItems,
          { to: '/admin', icon: Shield, label: 'Admin' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-primary relative"
            activeClassName="text-primary bg-primary/10"
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
