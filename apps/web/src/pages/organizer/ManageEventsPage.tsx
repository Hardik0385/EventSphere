import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Trash2, 
  BarChart3, 
  PlusCircle, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Event } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const ManageEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyEvents = async () => {
    try {
      const res = await api.get<Event[]>(`/api/events?organizer_id=${user?.id}`);
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyEvents();
    }
  }, [user?.id]);

  const handleDeleteClick = (evt: Event) => {
    setSelectedEvent(evt);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/events/${selectedEvent.id}`);
      if (res.success) {
        success('Event deleted successfully from Cloudflare D1');
        setDeleteModalOpen(false);
        fetchMyEvents();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Organizer Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manage My Hosted Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View attendees, export registration CSVs, monitor capacity, and review metrics.
          </p>
        </div>

        <Link
          to="/organizer/create-event"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event</span>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="You haven't hosted any events on EventSphere yet. Click below to launch your first serverless event!"
          action={{
            label: 'Create Your First Event',
            onClick: () => (window.location.href = '/organizer/create-event'),
          }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Capacity Filled</th>
                  <th className="py-4 px-6">Event Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {events.map((evt) => {
                  const regCount = evt.confirmed_registrations_count || 0;
                  const pct = Math.min(100, Math.round((regCount / evt.capacity) * 100));

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/events/${evt.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 transition-colors block line-clamp-1"
                        >
                          {evt.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">📍 {evt.location}</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {evt.category}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span>{regCount} / {evt.capacity}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        {new Date(evt.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {evt.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/organizer/events/${evt.id}/registrations`}
                          className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees</span>
                        </Link>

                        <Link
                          to={`/organizer/events/${evt.id}/analytics`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Analytics</span>
                        </Link>

                        <button
                          onClick={() => handleDeleteClick(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Event?"
        message={`Are you sure you want to permanently delete "${selectedEvent?.title}"? All associated registrations and check-in tickets will be removed.`}
        confirmLabel="Yes, Delete Event"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
