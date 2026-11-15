import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  ShieldCheck, 
  User as UserIcon,
  Ticket,
  AlertCircle
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
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested event does not exist or has been removed.</p>
        <Link to="/events" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {event.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Organized by{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{event.organizer_name || 'EventSphere Host'}</span>
            </p>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About This Event</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Cloud computing architecture note */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-0.5">Cloudflare D1 Atomic Safeguard</p>
              <p className="text-slate-600 dark:text-slate-400">
                Registrations for this event are executed as atomic transactions across Cloudflare edge worker isolates. Double bookings are blocked at the relational constraint layer.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Registration Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Event Logistics</h3>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Date</p>
                  <p>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Time</p>
                  <p>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Venue / Location</p>
                  <p>{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Capacity & Availability</p>
                  <p className="font-medium text-brand-600 dark:text-brand-400">
                    {remaining} of {event.capacity} seats remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {isRegistered ? (
                <>
                  <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>You are registered for this event!</span>
                  </div>

                  {generatedTicketCode && (
                    <button
                      onClick={() => setTicketModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>View Ticket & QR Code</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    Cancel Registration
                  </button>
                </>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-center"
                >
                  Registration Closed (Capacity Full)
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01]"
                >
                  {registering ? 'Securing Seat in Cloud D1...' : 'Register for Event (Free)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {ticketModalOpen && generatedTicketCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative">
            <button
              onClick={() => setTicketModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700"
            >
              ✕
            </button>
            <QrCodeViewer
              ticketCode={generatedTicketCode}
              eventTitle={event.title}
              participantName={user?.name}
              eventDate={startDate.toLocaleDateString()}
              eventLocation={event.location}
            />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Event Registration?"
        message="Are you sure you want to cancel your registration? Your reserved seat will be immediately released for other participants in the Cloudflare D1 database."
        confirmLabel="Yes, Cancel Registration"
        isDestructive={true}
        onConfirm={handleCancelRegistration}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};
