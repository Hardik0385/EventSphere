import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  ArrowRight
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
import { AdminStats } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { StatsSkeleton } from '../../components/LoadingSkeleton';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get<AdminStats>('/api/analytics/admin');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            System Administration
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-1">
            Platform Master Console
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Platform-wide health, role governance, and event moderation metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/events"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Moderate Events</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Users</span>
            <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{stats.total_users}</p>
            <p className="text-[10px] text-neutral-500">{stats.total_organizers} org / {stats.total_participants} part</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Events</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.total_events}</p>
            <p className="text-[10px] text-neutral-500">Platform-wide</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Registrations</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.total_registrations}</p>
            <p className="text-[10px] text-neutral-500">Active passes</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Check-Ins</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.total_checkins}</p>
            <p className="text-[10px] text-neutral-500">Admitted at gate</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Attendance</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.overall_attendance_rate}%</p>
            <p className="text-[10px] text-neutral-500">Overall show rate</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">System Status</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">100%</p>
            <p className="text-[10px] text-neutral-500">Operational</p>
          </div>
        </div>
      ) : null}

      {/* Visual Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Registrations Over Time */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Platform Registrations Over Time</h3>
                <p className="text-xs text-neutral-500">Aggregate daily user registration curve</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-64 w-full pt-4">
              {stats.registrations_over_time.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  No registration trend points yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.registrations_over_time}>
                    <defs>
                      <linearGradient id="adminRegGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#121215',
                        border: '1px solid #27272a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#adminRegGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Events by Category */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Events by Category</h3>
                <p className="text-xs text-neutral-500">Platform distribution across categories</p>
              </div>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-64 w-full pt-4">
              {stats.events_by_category.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  No categories recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.events_by_category}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(0, 10)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#121215',
                        border: '1px solid #27272a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      {stats && (
        <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent System Audit Logs</h3>
              <p className="text-xs text-neutral-500">Recorded platform activities and mutations</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor ID</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                {stats.recent_activity.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4">
                      <span className="font-sans font-bold text-emerald-600 dark:text-emerald-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{log.actor_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-neutral-100 dark:bg-neutral-800">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 truncate max-w-xs">{log.entity_id}</td>
                    <td className="py-3 px-4 text-right text-neutral-400 font-sans">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
