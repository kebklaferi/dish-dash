import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError('All fields are required');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, username);
      // Redirect to home after successful registration
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">FoodDash</h1>
          <p className="text-muted-foreground">Your favorite meals, delivered fast</p>
        </div>

        <Card className="border-0 shadow-soft-lg">
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <Label className="mb-2 block">Username</Label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  type="text" 
                  placeholder="johndoe" 
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="mb-2 block">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  placeholder="you@example.com" 
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="mb-2 block">Password</Label>
                <Input 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password" 
                  placeholder="••••••••" 
                  disabled={isLoading}
                />
              </div>

              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
