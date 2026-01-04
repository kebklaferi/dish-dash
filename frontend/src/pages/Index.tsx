import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto">
        <Home />
      </main>
      <Navigation />
    </div>
  );
};

export default Index;
