import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  User as UserIcon,
  Ticket,
  AlertCircle,
  Share2
} from 'lucide-react';
import { Event } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QrCodeViewer } from '../../components/QrCodeViewer';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [generatedTicketCode, setGeneratedTicketCode] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [myRegistrationId, setMyRegistrationId] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      const res = await api.get<Event>(`/api/events/${id}`);
      if (res.success && res.data) {
        setEvent(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkMyRegistration = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get<any[]>('/api/registrations/my');
      if (res.success && res.data) {
        const found = res.data.find((r) => r.event_id === id && r.registration_status === 'confirmed');
        if (found) {
          setMyRegistrationId(found.id);
          setGeneratedTicketCode(found.ticket_code);
        } else {
          setMyRegistrationId(null);
        }
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchEvent();
    checkMyRegistration();
  }, [id, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setRegistering(true);
    try {
      const res = await api.post<{ ticket_code: string; registration_id: string }>(`/api/events/${id}/register`);
      if (res.success && res.data) {
        success('Registration confirmed successfully!');
        setGeneratedTicketCode(res.data.ticket_code);
        setMyRegistrationId(res.data.registration_id);
        setTicketModalOpen(true);
        fetchEvent();
      }
    } catch (err: any) {
      error(err.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistrationId) return;
    try {
      const res = await api.delete(`/api/registrations/${myRegistrationId}`);
      if (res.success) {
        success('Registration cancelled. Your seat has been released.');
        setCancelModalOpen(false);
        setMyRegistrationId(null);
        setGeneratedTicketCode(null);
        fetchEvent();
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-10 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-48 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-sm text-neutral-500 mt-2 mb-6">The requested event does not exist or has been removed.</p>
        <Link to="/events" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const remaining = event.remaining_capacity ?? Math.max(0, event.capacity - (event.confirmed_registrations_count || 0));
  const isFull = remaining <= 0;
  const isRegistered = Boolean(myRegistrationId || event.is_user_registered);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              {event.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Hosted by{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{event.organizer_name || 'EventSphere Host'}</span>
            </p>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">About This Event</h3>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Guaranteed Reservation Note */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p>
              <span className="font-semibold text-neutral-900 dark:text-white">Instant Confirmation:</span> Your digital ticket is issued immediately with unique pass verification for smooth on-site check-in.
            </p>
          </div>
        </div>

        {/* Right Col: Logistics & Action Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Date & Venue</h3>

            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Date</p>
                  <p className="text-neutral-500 mt-0.5">{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Time</p>
                  <p className="text-neutral-500 mt-0.5">{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Location</p>
                  <p className="text-neutral-500 mt-0.5">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Capacity</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {remaining} of {event.capacity} seats remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2.5">
              {isRegistered ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>You're registered for this event!</span>
                  </div>

                  {generatedTicketCode && (
                    <button
                      onClick={() => setTicketModalOpen(true)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>View Entry Ticket</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-bold text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                >
                  Event Fully Booked
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {registering ? (
                    <span>Securing Ticket...</span>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Register for Free</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {ticketModalOpen && generatedTicketCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Official Entry Pass
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                {event.title}
              </h3>
              <p className="text-xs text-neutral-500">{startDate.toLocaleDateString()}</p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center">
              <QrCodeViewer ticketCode={generatedTicketCode} eventTitle={event.title} />
              <div className="mt-4 text-center">
                <p className="text-[10px] uppercase font-semibold text-neutral-400">Pass Code</p>
                <code className="text-xs font-mono font-bold tracking-wider text-neutral-900 dark:text-white">
                  {generatedTicketCode}
                </code>
              </div>
            </div>

            <button
              onClick={() => setTicketModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Registration?"
        message="Are you sure you want to cancel your registration? Your reserved seat will be immediately returned to available capacity."
        confirmLabel="Yes, Cancel Registration"
        confirmVariant="danger"
        onConfirm={handleCancelRegistration}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};
