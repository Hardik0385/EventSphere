import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  User, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const TicketVerificationPage: React.FC = () => {
  const { success, error, warning } = useToast();

  const [ticketCode, setTicketCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [ticketResult, setTicketResult] = useState<any | null>(null);

  // Quick test demo ticket codes
  const sampleCodes = ['ES-CLOUD-89421', 'ES-SRVLS-33910', 'ES-AIHKT-77218'];

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketCode.trim()) {
      error('Please enter or scan a ticket code');
      return;
    }

    setVerifying(true);
    setTicketResult(null);
    try {
      const res = await api.post<any>('/api/tickets/verify', {
        ticket_code: ticketCode.trim(),
      });
      if (res.success && res.data) {
        setTicketResult(res.data);
        if (res.data.is_already_checked_in) {
          warning('Notice: This ticket has already been checked in!');
        } else {
          success('Ticket verified successfully! Ready for check-in.');
        }
      }
    } catch (err: any) {
      error(err.message || 'Ticket not found or invalid');
      setTicketResult({
        error: err.message || 'Invalid ticket code',
        valid: false,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketCode.trim()) return;

    setCheckingIn(true);
    try {
      const res = await api.post<any>('/api/tickets/check-in', {
        ticket_code: ticketCode.trim(),
      });

      if (res.success && res.data) {
        success(res.message || 'Check-in confirmed!');
        setTicketResult({
          ...ticketResult,
          is_already_checked_in: true,
          checked_in_at: res.data.checked_in_at,
          status_message: `Checked in successfully just now!`,
        });
      }
    } catch (err: any) {
      error(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/organizer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Organizer Hub
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          QR Ticket Verification & Gate Check-In
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Validate cryptographic event passes and prevent duplicate check-ins at entry.
        </p>
      </div>

      {/* Demo sample quick fills */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quick Demo Sample Tickets (Seed Database)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setTicketCode(code);
              }}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950 font-mono text-xs font-bold transition-colors shadow-sm"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Scanner / Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter or Paste Ticket Code (QR Fallback)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ES-CLOUD-89421"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm uppercase font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Search className="w-4 h-4" />
                <span>{verifying ? 'Verifying at Edge...' : 'Verify Ticket'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Verification Result Display */}
        {ticketResult && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in">
            {ticketResult.error ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-3">
                <XCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Ticket Verification Failed</h4>
                  <p className="text-xs text-rose-600/90 dark:text-rose-400 mt-0.5">{ticketResult.error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status banner */}
                {ticketResult.is_already_checked_in ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Duplicate Check-In Detected</h4>
                      <p className="text-xs mt-0.5">
                        This ticket was already checked in on{' '}
                        <strong>{new Date(ticketResult.checked_in_at).toLocaleString()}</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Valid Ticket Confirmed</h4>
                      <p className="text-xs mt-0.5">Ready for admission check-in.</p>
                    </div>
                  </div>
                )}

                {/* Attendee Details Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Attendee Name</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{ticketResult.participant_name}</p>
                      <p className="text-slate-500">{ticketResult.participant_email}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Event</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{ticketResult.event_title}</p>
                      <p className="text-slate-500">📍 {ticketResult.event_location}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Registered: {new Date(ticketResult.registered_at).toLocaleDateString()}</span>
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{ticketResult.ticket_code}</span>
                  </div>
                </div>

                {/* Check-In Action Button */}
                {!ticketResult.is_already_checked_in && (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{checkingIn ? 'Recording Check-In in Cloudflare D1...' : 'Confirm Gate Check-In'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
