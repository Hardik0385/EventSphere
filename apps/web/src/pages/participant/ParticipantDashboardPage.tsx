import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, CheckCircle2, ArrowRight, Clock, MapPin } from 'lucide-react';
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
      <div className="bg-neutral-950 dark:bg-[#121215] border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-[90px] pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            Attendee Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            You are currently enrolled in {confirmedRegistrations.length} upcoming events.
          </p>
        </div>

        <Link
          to="/events"
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
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
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Registrations</span>
              <Ticket className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">{confirmedRegistrations.length}</p>
            <p className="text-xs text-neutral-500 mt-1">Confirmed event seats reserved</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Events Attended</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">{checkedInCount}</p>
            <p className="text-xs text-neutral-500 mt-1">Verified on-site check-ins</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pass Status</span>
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">Active</p>
            <p className="text-xs text-neutral-500 mt-1">All digital passes ready</p>
          </div>
        </div>
      )}

      {/* Upcoming Registered Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            My Enrolled Events
          </h2>
          <Link to="/my-tickets" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View All Tickets
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : confirmedRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between gap-4 hover:border-emerald-500/40 transition-colors shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      Confirmed
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-400">
                      {reg.ticket_code}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {reg.event_title}
                  </h3>
                  <div className="space-y-1 text-xs text-neutral-500">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {reg.event_start_time ? new Date(reg.event_start_time).toLocaleDateString() : 'Date TBA'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {reg.event_location || 'Venue TBA'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Event Details
                  </Link>
                  <Link
                    to="/my-tickets"
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Show Pass</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No event registrations yet"
            description="You have not registered for any events yet. Check out upcoming events and reserve your pass."
            actionLabel="Discover Events"
            onAction={() => window.location.href = '/events'}
          />
        )}
      </div>
    </div>
  );
};
