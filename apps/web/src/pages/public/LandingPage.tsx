import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Server, 
  Database, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Calendar, 
  QrCode, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Event } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { EventCard } from '../../components/EventCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<Event[]>('/api/events?upcoming=true');
        if (res.success && res.data) {
          setFeaturedEvents(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = [
    { name: 'Cloud Computing', count: '10+ Events', color: 'from-blue-500 to-indigo-600', icon: Server },
    { name: 'Serverless & Edge', count: '8+ Events', color: 'from-amber-500 to-orange-600', icon: Zap },
    { name: 'Artificial Intelligence', count: '12+ Events', color: 'from-purple-500 to-pink-600', icon: Sparkles },
    { name: 'DevOps & Cloud', count: '6+ Events', color: 'from-emerald-500 to-teal-600', icon: Database },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 lg:pt-20">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-amber-500/20 to-purple-500/20 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-sm animate-bounce">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            <span>Serverless Event Management Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Discover, Register, and Host Events at the{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
              Edge of the Cloud.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Built entirely on Cloudflare Workers, Pages, and D1. Zero dedicated virtual machines, 
            instant cold starts, atomic ticket registrations, and cryptographically verified QR check-ins.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/cloud-architecture"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <Server className="w-4 h-4 text-amber-500" />
              <span>Cloud Architecture Explorer</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-slate-900 dark:text-white">0 ms</p>
              <p className="text-xs text-slate-500">Cold Start Overhead</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs text-slate-500">Atomic Capacity Safety</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">300+</p>
              <p className="text-xs text-slate-500">Cloudflare Edge Points</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400">$0.00</p>
              <p className="text-xs text-slate-500">Idle Server Infrastructure</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Happening Soon
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Cloud & Tech Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View all upcoming events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Event Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Browse by Focus Area
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Find the right hackathons, workshops, and symposiums tailored to your academic and technical goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Platform Features */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Engineered for Scalability
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Why Serverless Changes Event Operations
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Say goodbye to overloaded Apache/Nginx web servers crashing during high-demand student registrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Atomic Seat Allocations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Database-level transactional constraints prevent race conditions and overbooking even when hundreds of students click register simultaneously on the final remaining seat.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cryptographic QR Tickets
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Each confirmed attendee receives an opaque, tamper-evident digital ticket with a verifiable QR code. Organizers verify attendance on-site with duplicate check-in prevention.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Real-Time Edge Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Real database aggregations compute capacity utilization, attendance percentages, and registration timelines for organizers and platform administrators in sub-10 milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Intuitive Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            How EventSphere Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold text-base mb-1">Discover Event</h4>
            <p className="text-xs text-slate-500">Browse categories, view venue info, dates, and live seat counts.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold text-base mb-1">1-Click Register</h4>
            <p className="text-xs text-slate-500">Cloudflare Worker authenticates token and books atomic seat in D1.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold text-base mb-1">Get Digital Ticket</h4>
            <p className="text-xs text-slate-500">Receive an interactive digital ticket with downloadable QR code.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold text-base mb-1">Gate Check-In</h4>
            <p className="text-xs text-slate-500">Organizer scans QR code or enters code to verify and admit attendee.</p>
          </div>
        </div>
      </section>

      {/* 6. Serverless Technology Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              Cloud Computing Course Project
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Demonstrating Modern Cloud Architecture
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore our interactive demonstration module with live health checks, on-the-fly edge query timings, 
              and comprehensive explanations of IaaS, PaaS, SaaS, and FaaS models.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/cloud-architecture"
                className="px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center gap-2"
              >
                <span>Launch Cloud Service Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
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
