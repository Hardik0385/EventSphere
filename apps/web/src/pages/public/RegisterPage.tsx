import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Ticket, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'participant' | 'organizer'>('participant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please complete all required fields');
      return;
    }
    if (password.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name, email, password, role });
      success(`Account created! Welcome, ${user.name}!`);
      if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-2">
            <span className="font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white">
              Event<span className="text-emerald-500">Sphere</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-neutral-500">
            Join EventSphere to discover and host remarkable gatherings.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                />
              </div>
            </div>

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
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('participant')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    role === 'participant'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Ticket className={`w-4 h-4 ${role === 'participant' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Attend Events</span>
                  <span className="text-[10px] text-neutral-500">Discover & RSVP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    role === 'organizer'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Users className={`w-4 h-4 ${role === 'organizer' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Host Events</span>
                  <span className="text-[10px] text-neutral-500">Create & Manage</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
