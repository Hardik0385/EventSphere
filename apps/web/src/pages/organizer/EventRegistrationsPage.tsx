import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search,
  Ticket
} from 'lucide-react';
import { Event, Registration } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const EventRegistrationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRegistrations = async () => {
    try {
      const res = await api.get<{ event: Event; registrations: any[] }>(`/api/events/${id}/registrations`);
      if (res.success && res.data) {
        setEvent(res.data.event);
        setRegistrations(res.data.registrations);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load event registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const filtered = registrations.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.user_name || '').toLowerCase().includes(q) ||
      (r.user_email || '').toLowerCase().includes(q) ||
      (r.ticket_code || '').toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (registrations.length === 0) {
      error('No registration records to export');
      return;
    }

    const headers = ['Ticket Code', 'Participant Name', 'Email', 'Registration Status', 'Registered At', 'Checked In At'];
    const rows = registrations.map((r) => [
      r.ticket_code,
      `"${r.user_name?.replace(/"/g, '""') || ''}"`,
      r.user_email || '',
      r.registration_status,
      r.created_at,
      r.checked_in_at || 'Not Checked In',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendees-${event?.title?.slice(0, 20) || 'event'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Participant list exported to CSV!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Events
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendee Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Event: <span className="font-semibold text-slate-800 dark:text-slate-200">{event?.title || 'Loading...'}</span>
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={loading || registrations.length === 0}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or ticket code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span>Total: <strong className="text-slate-900 dark:text-white">{registrations.length}</strong></span>
          <span>Checked In: <strong className="text-emerald-600 dark:text-emerald-400">{registrations.filter((r) => r.checked_in_at).length}</strong></span>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No attendees found"
          description={searchTerm ? "No participant matches your search filter." : "No participants have registered for this event yet."}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Ticket Code</th>
                  <th className="py-4 px-6">Registration Status</th>
                  <th className="py-4 px-6">Check-In Status</th>
                  <th className="py-4 px-6">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{reg.user_name}</p>
                      <p className="text-[11px] text-slate-400">{reg.user_email}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                        {reg.ticket_code}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        reg.registration_status === 'confirmed' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {reg.registration_status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {reg.checked_in_at ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          <p className="font-semibold">✓ Checked In</p>
                          <p className="text-[10px] text-slate-400">{new Date(reg.checked_in_at).toLocaleTimeString()}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not Checked In</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-[11px]">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
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
