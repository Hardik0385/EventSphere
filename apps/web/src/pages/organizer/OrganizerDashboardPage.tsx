import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  PlusCircle, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { OrganizerStats } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { StatsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

export const OrganizerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<OrganizerStats>('/api/analytics/organizer');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Organizer Console
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Event Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics and participant tracking computed live by Cloudflare D1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizer/verify-tickets"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span>Verify Tickets</span>
          </Link>
          <Link
            to="/organizer/create-event"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Hosted Events</span>
              <Calendar className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_events}</p>
            <p className="text-[11px] text-slate-500 mt-1">{stats.active_events} active / published</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Registrations</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_registrations}</p>
            <p className="text-[11px] text-slate-500 mt-1">Confirmed participants</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Attendance Rate</span>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.attendance_rate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{stats.total_checkins} verified check-ins</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Capacity Fill</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.capacity_utilization}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Overall capacity utilized</p>
          </div>
        </div>
      ) : null}

      {/* Visual Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Registration Trends */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Registration Timeline</h3>
                <p className="text-xs text-slate-500">Participant registration velocity</p>
              </div>
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>

            <div className="h-64 w-full pt-4">
              {stats.registration_trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No registration trend data recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.registration_trends}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0c8ee9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0c8ee9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#0c8ee9" strokeWidth={2} fillOpacity={1} fill="url(#regGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Event Capacity vs Registered */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Event Capacity Breakdown</h3>
                <p className="text-xs text-slate-500">Seats filled vs available limit</p>
              </div>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-64 w-full pt-4">
              {stats.event_attendance_breakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No event records available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.event_attendance_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="title" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(0, 10) + '...'} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="registered" name="Registered" fill="#0c8ee9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="checked_in" name="Checked In" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" name="Capacity" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Organizer Navigation Links */}
      <div className="flex items-center justify-between pt-4">
        <Link
          to="/organizer/events"
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <span>View and Manage All Events →</span>
        </Link>
      </div>
    </div>
  );
};
