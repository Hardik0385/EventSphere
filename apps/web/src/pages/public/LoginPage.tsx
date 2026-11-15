import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 dark:bg-emerald-500/10 border border-neutral-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black text-lg">
              E
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Sign In to EventSphere
          </h2>
          <p className="text-xs text-neutral-500">
            Access your event passes, registrations, and dashboard.
          </p>
        </div>

        {/* Demo Accounts Bar */}
        <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold uppercase tracking-wider">Quick Fill Demo Accounts</span>
            <span className="text-[10px]">Click to fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@eventsphere.cloud')}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-neutral-800 dark:text-neutral-200 font-medium text-xs transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('organizer@eventsphere.cloud')}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-neutral-800 dark:text-neutral-200 font-medium text-xs transition-colors"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('participant@eventsphere.cloud')}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-neutral-800 dark:text-neutral-200 font-medium text-xs transition-colors"
            >
              Attendee
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
