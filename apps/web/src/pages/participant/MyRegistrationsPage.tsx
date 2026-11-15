import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, XCircle, QrCode, ArrowLeft } from 'lucide-react';
import { Registration } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { QrCodeViewer } from '../../components/QrCodeViewer';

export const MyRegistrationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get<Registration[]>('/api/registrations/my');
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelClick = (reg: Registration) => {
    setSelectedReg(reg);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedReg) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/api/registrations/${selectedReg.id}`);
      if (res.success) {
        success('Registration cancelled successfully. Seat has been released.');
        setCancelModalOpen(false);
        fetchRegistrations();
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  const openQrModal = (reg: Registration) => {
    setSelectedTicket(reg);
    setQrModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            My Event Registrations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your booked seats, view passes, or cancel attendance.
          </p>
        </div>

        <Link
          to="/events"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
        >
          Explore More Events
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations found"
          description="You haven't signed up for any events yet. Check out upcoming gatherings and reserve your pass."
          actionLabel="Browse Events"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 font-semibold">
                <tr>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6">Ticket Code</th>
                  <th className="py-4 px-6">Date & Venue</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                {registrations.map((reg) => {
                  const isCancelled = reg.registration_status === 'cancelled';
                  const isCheckedIn = Boolean(reg.checked_in_at);

                  return (
                    <tr key={reg.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/events/${reg.event_id}`}
                          className="font-bold text-sm text-neutral-900 dark:text-white hover:text-emerald-500 transition-colors block line-clamp-1"
                        >
                          {reg.event_title}
                        </Link>
                        <span className="text-[10px] text-neutral-400">Category: {reg.event_category || 'General'}</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                          {reg.ticket_code}
                        </span>
                      </td>

                      <td className="py-4 px-6 space-y-0.5 text-[11px] text-neutral-500">
                        {reg.event_start_time && (
                          <p>
                            📅 {new Date(reg.event_start_time).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                        {reg.event_location && <p className="truncate max-w-xs">📍 {reg.event_location}</p>}
                      </td>

                      <td className="py-4 px-6">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                            Cancelled
                          </span>
                        ) : isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                            Confirmed
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        {!isCancelled && (
                          <>
                            <button
                              onClick={() => openQrModal(reg)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-semibold text-neutral-800 dark:text-neutral-200 transition-colors inline-flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View Pass</span>
                            </button>

                            <button
                              onClick={() => handleCancelClick(reg)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/30 text-rose-600 font-semibold transition-colors inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel This Registration?"
        message={`Are you sure you want to cancel your seat for "${selectedReg?.event_title}"? Your ticket will be invalidated and your seat will be returned to available capacity.`}
        confirmLabel="Yes, Release My Seat"
        confirmVariant="danger"
        isLoading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* QR Code Modal */}
      {qrModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg border border-neutral-700"
            >
              ✕
            </button>
            <QrCodeViewer
              ticketCode={selectedTicket.ticket_code}
              eventTitle={selectedTicket.event_title || 'Event Ticket'}
              participantName={selectedTicket.user_name}
              eventDate={selectedTicket.event_start_time ? new Date(selectedTicket.event_start_time).toLocaleDateString() : undefined}
              eventLocation={selectedTicket.event_location}
            />
          </div>
        </div>
      )}
    </div>
  );
};
