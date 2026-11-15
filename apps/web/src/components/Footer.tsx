import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#09090b] text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-emerald-500/10 border border-neutral-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <span className="font-black text-sm text-emerald-500">E</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
                Event<span className="text-emerald-500">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Discover and host exceptional gatherings. Fast, reliable ticketing, digital entry passes, and real-time attendance tools for modern organizers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 mb-3.5">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  About EventSphere
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Host & Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 mb-3.5">
              For Organizers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/organizer/create-event" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Host an Event
                </Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/cloud-architecture" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Architecture Overview <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-400 dark:text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
