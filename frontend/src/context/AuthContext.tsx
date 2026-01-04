import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        apiLogout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: newUser } = await apiLogin({ email, password });
    setUser(newUser);
  };

  const register = async (email: string, password: string, username: string) => {
    const { user: newUser } = await apiRegister({ email, password, username });
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    apiLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
