import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SingleEventAnalytics } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { StatsSkeleton } from '../../components/LoadingSkeleton';

export const EventAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SingleEventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<SingleEventAnalytics>(`/api/analytics/events/${id}`);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load event analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <StatsSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500">Analytics data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Events
        </Link>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Event Analytics
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {data.event.title}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Seats</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{data.total_registrations}</p>
          <p className="text-[11px] text-neutral-500 mt-1">out of {data.event.capacity} total seats</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Check-Ins</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.total_checkins}</p>
          <p className="text-[11px] text-neutral-500 mt-1">attendees admitted at gate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Attendance Rate</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.attendance_rate}%</p>
          <p className="text-[11px] text-neutral-500 mt-1">check-ins / registrations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Capacity Fill</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.capacity_utilization}%</p>
          <p className="text-[11px] text-neutral-500 mt-1">seats occupied percentage</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">Registration Timeline</h3>
        <p className="text-xs text-neutral-500">Attendee registrations over time</p>

        <div className="h-72 w-full pt-4">
          {data.registrations_timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              No timeline data points recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.registrations_timeline}>
                <defs>
                  <linearGradient id="singleRegGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#singleRegGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
