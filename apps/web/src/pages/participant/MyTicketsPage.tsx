import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { Registration } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { QrCodeViewer } from '../../components/QrCodeViewer';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get<Registration[]>('/api/registrations/my');
        if (res.success && res.data) {
          // Only show confirmed active tickets
          setRegistrations(res.data.filter((r) => r.registration_status === 'confirmed'));
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Digital Tickets & QR Codes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Present these QR codes at the event entry desk for instantaneous check-in.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No active tickets"
          description="You don't have any confirmed event tickets at this moment. Register for an upcoming event to generate your admission QR code."
          action={{
            label: 'Find Events',
            onClick: () => (window.location.href = '/events'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {registrations.map((reg) => (
            <div key={reg.id} className="space-y-3">
              <QrCodeViewer
                ticketCode={reg.ticket_code}
                eventTitle={reg.event_title || 'Event Ticket'}
                participantName={user?.name}
                eventDate={reg.event_start_time ? new Date(reg.event_start_time).toLocaleDateString() : undefined}
                eventLocation={reg.event_location}
              />
              {reg.checked_in_at && (
                <div className="max-w-sm mx-auto text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  ✓ Checked in on {new Date(reg.checked_in_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
