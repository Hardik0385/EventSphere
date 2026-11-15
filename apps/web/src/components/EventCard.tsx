import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { Event } from '@eventsphere/shared';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const confirmedCount = event.confirmed_registrations_count || 0;
  const remainingSeats = event.remaining_capacity ?? Math.max(0, event.capacity - confirmedCount);
  const percentageFilled = Math.min(100, Math.round((confirmedCount / event.capacity) * 100));
  const isFull = remainingSeats <= 0;

  // Category tag colors
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'cloud computing':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'serverless & edge':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'artificial intelligence':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'college festival':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          {event.is_user_registered ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Registered
            </span>
          ) : isFull ? (
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full">
              Full Capacity
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-md">
              {remainingSeats} seats left
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
          {event.title}
        </h3>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Event Details metadata */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Capacity Progress & Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="flex items-center gap-1 text-slate-500">
            <Users className="w-3.5 h-3.5" /> Capacity
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {confirmedCount} / {event.capacity} ({percentageFilled}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageFilled >= 90
                ? 'bg-rose-500'
                : percentageFilled >= 70
                ? 'bg-amber-500'
                : 'bg-brand-500'
            }`}
            style={{ width: `${percentageFilled}%` }}
          />
        </div>

        <Link
          to={`/events/${event.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white transition-all shadow-sm group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
