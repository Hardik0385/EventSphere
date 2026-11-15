import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Ticket, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface QrCodeViewerProps {
  ticketCode: string;
  eventTitle: string;
  participantName?: string;
  eventDate?: string;
  eventLocation?: string;
}

export const QrCodeViewer: React.FC<QrCodeViewerProps> = ({
  ticketCode,
  eventTitle,
  participantName,
  eventDate,
  eventLocation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (canvasRef.current && ticketCode) {
      QRCode.toCanvas(
        canvasRef.current,
        // Opaque verification payload
        JSON.stringify({ ticket: ticketCode, app: 'EventSphere' }),
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [ticketCode]);

  const copyTicketCode = async () => {
    await navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    success('Ticket code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTicketImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `EventSphere-Ticket-${ticketCode}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    success('Ticket downloaded successfully!');
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl max-w-sm mx-auto text-center relative overflow-hidden">
      {/* Decorative Ticket header accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-amber-500 to-indigo-600" />

      {/* Ticket Cut-out notches */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />

      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">
        <Ticket className="w-4 h-4" />
        <span>Official Digital Ticket</span>
      </div>

      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 mb-1">
        {eventTitle}
      </h3>

      {participantName && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Attendee: <span className="font-semibold text-slate-800 dark:text-slate-200">{participantName}</span>
        </p>
      )}

      {/* QR Canvas */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-inner inline-block my-2">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      {/* Ticket Code Display */}
      <div className="my-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
          Ticket Verification Code
        </span>
        <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl font-mono text-base font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
          <span>{ticketCode}</span>
          <button
            onClick={copyTicketCode}
            aria-label="Copy ticket code"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Event Details summary */}
      {(eventDate || eventLocation) && (
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 my-3 text-left bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          {eventDate && <p className="truncate">📅 {eventDate}</p>}
          {eventLocation && <p className="truncate">📍 {eventLocation}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={downloadTicketImage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Save Ticket</span>
        </button>
        <button
          onClick={copyTicketCode}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>Copy</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Verified Cryptographic Admission Token</span>
      </div>
    </div>
  );
};
