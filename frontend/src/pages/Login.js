import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful', {
        description: `Welcome back, ${user.name}!`
      });

      // Redirect based on role
      if (user.role === 'team_member') {
        navigate('/my-tasks');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed', {
        description: error.response?.data?.detail || 'Invalid email or password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Login form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 font-heading">MediaHub</h1>
            <p className="text-slate-600 mt-2">Sign in to manage your media events</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#37429c] focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#37429c] focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              data-testid="login-submit-button"
              type="submit"
              className="w-full bg-[#37429c] hover:bg-[#b49749] text-white font-medium px-6 py-2.5 rounded-lg shadow-md  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>


        </div>
      </div>

      {/* Right side - Hero image */}
      <div
        className="hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://arts.smvec.ac.in/assets/img/image/DJI_0981.webp)'
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-[black]/70 to-[black]/50 flex items-center justify-center p-12 ">
          <div className="text-white text-center">
            <h2 className="text-5xl font-bold mb-4 font-heading text-[white]">Capture Every Moment</h2>
            <p className="text-xl opacity-90">
              Professional event management for creative teams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
