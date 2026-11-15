import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Calendar, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Ticket, 
  LogOut, 
  Shield, 
  User as UserIcon,
  ChevronDown,
  Compass
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
                Event<span className="text-emerald-500">Sphere</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/events"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/events')
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                Explore Events
              </Link>
              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <Link
                  to="/organizer/create-event"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/organizer/create-event')
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  Create Event
                </Link>
              )}
              <Link
                to="/about"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/about')
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-emerald-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold max-w-[120px] truncate text-neutral-900 dark:text-neutral-200">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#121215] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/80">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/my-registrations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <Ticket className="w-4 h-4 text-emerald-500" />
                        My Tickets
                      </Link>

                      {(user.role === 'organizer' || user.role === 'admin') && (
                        <>
                          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />
                          <div className="px-4 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Organizer Tools
                          </div>
                          <Link
                            to="/organizer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <BarChart3 className="w-4 h-4 text-emerald-500" />
                            Organizer Hub
                          </Link>
                          <Link
                            to="/organizer/create-event"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-500" />
                            Create Event
                          </Link>
                          <Link
                            to="/organizer/verify-tickets"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                            Gate Check-In
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />
                          <div className="px-4 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Admin
                          </div>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <Shield className="w-4 h-4 text-emerald-500" />
                            Admin Console
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <Users className="w-4 h-4 text-emerald-500" />
                            Users
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                      >
                        <UserIcon className="w-4 h-4 text-neutral-400" />
                        Account Settings
                      </Link>
                      <Link
                        to="/cloud-architecture"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-[11px]"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        System Architecture
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Explore Events
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            About EventSphere
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-sm">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 dark:text-neutral-200"
              >
                My Dashboard
              </Link>
              <Link
                to="/my-registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 dark:text-neutral-200"
              >
                My Tickets
              </Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link
                  to="/organizer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl font-medium text-emerald-500"
                >
                  Organizer Hub
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-500"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-400 text-neutral-950 text-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
