import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trash2, ArrowLeft, Search, ExternalLink, Users } from 'lucide-react';
import { Event } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const EventManagementPage: React.FC = () => {
  const { success, error } = useToast();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get<any[]>('/api/admin/events');
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = (evt: any) => {
    setSelectedEvent(evt);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/admin/events/${selectedEvent.id}`);
      if (res.success) {
        success('Event deleted by administrator');
        setDeleteModalOpen(false);
        fetchEvents();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = events.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      (e.title || '').toLowerCase().includes(q) ||
      (e.organizer_name || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform-Wide Event Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all published events across all organizers and purge inappropriate postings.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, organizer, or category..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white shadow-sm"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6">Organizer</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Registrations</th>
                  <th className="py-4 px-6">Check-Ins</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/events/${evt.id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 transition-colors block line-clamp-1"
                      >
                        {evt.title}
                      </Link>
                      <span className="text-[10px] text-slate-400">ID: {evt.id}</span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{evt.organizer_name}</p>
                      <p className="text-[10px] text-slate-400">{evt.organizer_email}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                        {evt.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {evt.confirmed_registrations_count || 0} / {evt.capacity}
                    </td>

                    <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                      {evt.checkins_count || 0}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(evt)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Admin Purge Event?"
        message={`Are you sure you want to delete "${selectedEvent?.title}"? As an administrator, this will remove the event, registrations, and tickets platform-wide.`}
        confirmLabel="Confirm Purge"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
