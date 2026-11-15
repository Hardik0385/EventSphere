import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Search,
  CheckCircle2, 
  Sparkles,
  Ticket,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { Event } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { EventCard } from '../../components/EventCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<Event[]>('/api/events?upcoming=true');
        if (res.success && res.data) {
          setFeaturedEvents(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = [
    'Tech & AI',
    'Design & Creative',
    'Hackathons',
    'Conferences',
    'Workshops',
    'Social & Meetups',
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-16 sm:pt-24 lg:pt-32">
        {/* Subtle light-green ambient radiance */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Discover gatherings that inspire</span>
          </div>

          {/* Clean, Human Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Discover and host{' '}
            <span className="text-emerald-500 dark:text-emerald-400">
              exceptional events.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Find workshops, conferences, and community meetups happening around you. 
            Enjoy effortless RSVPs, digital passes, and quick entry.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-2">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/events${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
              }}
              className="flex items-center gap-2 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
            >
              <div className="flex items-center flex-1 pl-3 text-neutral-400">
                <Search className="w-4 h-4 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, topics, or venues..."
                  className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs tracking-wide transition-colors"
              >
                Search
              </button>
            </form>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/events?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Upcoming
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-neutral-500">No events scheduled at the moment.</p>
          </div>
        )}
      </section>

      {/* 3. Simple 3-Step Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple & Seamless
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">
            How EventSphere Works
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            Everything you need for an effortless event experience, whether attending or hosting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Discover Events
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Explore curated workshops, hackathons, and conferences with live seat counts and venue schedules.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Instant RSVP
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Reserve your spot with a single click. Your ticket is confirmed instantly with guaranteed capacity.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              One-Scan Entry
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Present your personalized digital ticket pass at the venue entrance for smooth, contactless entry.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Host an Event CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              For Organizers & Creators
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to host your next gathering?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Create your event page in minutes, publish tickets, and monitor registrations in real-time.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/organizer/create-event"
                className="px-6 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md transition-colors text-sm inline-flex items-center gap-2"
              >
                <span>Create an Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors text-sm"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
