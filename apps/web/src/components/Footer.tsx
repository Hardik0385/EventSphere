import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Server, ShieldCheck, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                EventSphere
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Cloud Computing Project
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              A high-performance Serverless Event Management Platform built to demonstrate 
              FaaS (Cloudflare Workers), Edge Data Storage (Cloudflare D1), and global static distribution (Cloudflare Pages).
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
                <Server className="w-3.5 h-3.5 text-amber-400" /> Cloudflare Workers
              </span>
              <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Cloudflare D1
              </span>
              <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Cloudflare Pages
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-amber-400 transition-colors">Browse Events</Link>
              </li>
              <li>
                <Link to="/cloud-architecture" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Cloud Explorer <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">Live Demo</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">About Architecture</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Cloud Computing Concepts */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Cloud Principles</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Zero Dedicated Servers
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Atomic Edge Registrations
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Cryptographic QR Tickets
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Cloudflare Free Tier
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EventSphere – University Cloud Computing Laboratory Project.</p>
          <p className="flex items-center gap-1">
            Built with React, Vite, TypeScript, Hono & Cloudflare D1
          </p>
        </div>
      </div>
    </footer>
  );
};
