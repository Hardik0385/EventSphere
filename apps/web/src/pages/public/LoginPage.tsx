import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-2">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to EventSphere
          </h2>
          <p className="text-xs text-slate-500">
            Access your tickets, manage events, or view platform analytics.
          </p>
        </div>

        {/* Quick Demo Login Preset Bar */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Project Evaluator Quick Fill (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@eventsphere.cloud')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950 font-semibold text-[11px] truncate transition-colors shadow-sm"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('organizer@eventsphere.cloud')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950 font-semibold text-[11px] truncate transition-colors shadow-sm"
            >
              🎪 Organizer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('participant@eventsphere.cloud')}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950 font-semibold text-[11px] truncate transition-colors shadow-sm"
            >
              🎓 Participant
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating with Workers...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
