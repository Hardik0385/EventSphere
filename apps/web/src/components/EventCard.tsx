import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Check, ArrowUpRight } from 'lucide-react';
import { Event } from '@eventsphere/shared';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedWeekday = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const confirmedCount = event.confirmed_registrations_count || 0;
  const remainingSeats = event.remaining_capacity ?? Math.max(0, event.capacity - confirmedCount);
  const isFull = remainingSeats <= 0;

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-[#121215] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-xl dark:hover:shadow-emerald-950/20 transition-all duration-200">
      <div>
        {/* Top Meta: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {event.category}
          </span>

          {event.is_user_registered ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5" /> Registered
            </span>
          ) : isFull ? (
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
              Sold Out
            </span>
          ) : (
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {remainingSeats} spots left
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Logistics Info */}
        <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{formattedWeekday}, {formattedDate} • {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <div className="text-[11px] text-neutral-500">
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {confirmedCount} / {event.capacity}
          </span> registered
        </div>

        <Link
          to={`/events/${event.id}`}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-all shadow-sm"
        >
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
