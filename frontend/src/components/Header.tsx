import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleBadge = () => {
    const badges: Record<string, { label: string; className: string }> = {
      customer: { label: 'Customer', className: 'bg-primary/10 text-primary' },
      restaurant: { label: 'Restaurant', className: 'bg-accent/10 text-accent' },
      courier: { label: 'Courier', className: 'bg-warning/10 text-warning' },
      admin: { label: 'Admin', className: 'bg-destructive/10 text-destructive' },
    };
    return badges[user.role];
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h2 className="font-semibold text-foreground">{user.email}</h2>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>
    </header>
  );
}
