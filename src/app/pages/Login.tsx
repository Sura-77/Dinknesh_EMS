import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/discover';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const storedUser = localStorage.getItem('user');
      const role = storedUser ? JSON.parse(storedUser).role : 'attendee';
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'organizer') navigate('/organizer/dashboard');
      else if (role === 'security' || role === 'staff') navigate('/security/scanner');
      else navigate(from === '/login' ? '/discover' : from);
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-gray-900 dark:focus:ring-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-xl shadow-sm p-8 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">DEMS</div>
            <div className="h-1 w-24 mx-auto mb-6 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)}
                required className={inputClass} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" value={password}
                  onChange={e => setPassword(e.target.value)} required className={`${inputClass} pr-12`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4 rounded border-gray-300 dark:border-gray-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-gray-900 dark:text-white hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline text-gray-900 dark:text-white">Sign up</Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you an organizer?{' '}
              <Link to="/organizer/signup" className="font-semibold hover:underline text-gray-900 dark:text-white">
                Create organizer account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
