import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, CheckCircle2, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Registration } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { StatsSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await api.get<Registration[]>('/api/registrations/my');
        if (res.success && res.data) {
          setRegistrations(res.data);
        }
      } catch (err) {
        console.error('Failed to load my registrations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const confirmedRegistrations = registrations.filter((r) => r.registration_status === 'confirmed');
  const checkedInCount = registrations.filter((r) => Boolean(r.checked_in_at)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Participant Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-brand-100 mt-1 max-w-xl">
            You are currently enrolled in {confirmedRegistrations.length} upcoming events. Present your digital tickets at the venue for instant check-in.
          </p>
        </div>

        <Link
          to="/events"
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md flex items-center gap-2"
        >
          <span>Browse More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Registrations</span>
              <Ticket className="w-5 h-5 text-brand-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{confirmedRegistrations.length}</p>
            <p className="text-xs text-slate-500 mt-1">Confirmed event seats reserved</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Events Attended</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{checkedInCount}</p>
            <p className="text-xs text-slate-500 mt-1">Verified on-site check-ins</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Account Role</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white capitalize">{user?.role}</p>
            <p className="text-xs text-slate-500 mt-1">Authorized for participant actions</p>
          </div>
        </div>
      )}

      {/* Recent Registrations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Registered Events
          </h2>
          <Link
            to="/my-registrations"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Registrations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : confirmedRegistrations.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No registrations yet"
            description="You haven't registered for any events yet. Explore upcoming hackathons and workshops to get your tickets!"
            action={{
              label: 'Discover Events',
              onClick: () => (window.location.href = '/events'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {confirmedRegistrations.slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {reg.event_category || 'Event'}
                    </span>
                    {reg.checked_in_at ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        ✓ Checked In
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        Confirmed Seat
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 mb-2">
                    {reg.event_title}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    {reg.event_start_time && (
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        {new Date(reg.event_start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    {reg.event_location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        {reg.event_location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {reg.ticket_code}
                  </span>
                  <Link
                    to={`/my-tickets`}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>View QR Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
