import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowUpRight, Calendar, Users, Ticket, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold">
          About EventSphere
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Connecting communities through memorable events.
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          EventSphere is a modern platform crafted to make discovering, hosting, and ticketing gatherings effortless for attendees and organizers alike.
        </p>
      </div>

      {/* Core Values / Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Instant RSVP & Passes
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Register in seconds. Attendees receive guaranteed digital entry passes with verified QR codes ready for check-in.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            Empowered Organizers
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Create events, manage capacity thresholds, inspect registrations, and view real-time attendee statistics.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            No Double-Bookings
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Strict transactional capacity controls ensure you never oversell a venue, even during high-traffic registration rushes.
          </p>
        </div>
      </div>

      {/* Subtle Technical / Evaluation Note */}
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Under the Hood</h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            EventSphere is powered by globally distributed edge compute with zero dedicated server overhead.
          </p>
        </div>
        <Link
          to="/cloud-architecture"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Architecture Explorer</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm shadow-md transition-colors"
        >
          <span>Explore Upcoming Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
