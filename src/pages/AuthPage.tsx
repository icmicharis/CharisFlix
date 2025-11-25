import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.sendOtp(email);
      setStep('otp');
      toast.success('Verification code sent to your email');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      setLoading(true);
      try {
        const user = await authService.signInWithPassword(email, otp);
        login(authService.mapUser(user));
        navigate('/');
      } catch (error: any) {
        toast.error(error.message);
        setLoading(false);
      }
    } else {
      setStep('password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.verifyOtpAndSetPassword(
        email,
        otp,
        password,
        username
      );
      login(authService.mapUser(user));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.signInWithPassword(email, password);
      login(authService.mapUser(user));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl gradient-text">
            Welcome to CharisFlix
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={loading}
              >
                {loading
                  ? 'Processing...'
                  : isLogin
                  ? 'Sign In'
                  : 'Send Verification Code'}
              </Button>

              {isLogin && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={handleSendOtp}
                >
                  Sign in with OTP instead
                </Button>
              )}
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the verification code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={resetForm}
              >
                Use different email
              </Button>
            </form>
          )}

          {step === 'password' && !isLogin && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
