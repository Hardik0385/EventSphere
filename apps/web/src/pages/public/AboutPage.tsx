import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Server, Database, Globe, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-semibold">
          Cloud Computing Evaluation Project
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About EventSphere
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Demonstrating serverless cloud computing principles, managed SQLite at the edge, and zero-server infrastructure.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          The Problem Statement
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional event registration and ticketing platforms rely heavily on dedicated, always-running servers (e.g., standard Node/Express, Apache, or EC2 instances). These systems suffer from severe drawbacks:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-rose-600 dark:text-rose-400">🚨 High Idle Costs</p>
            <p>Servers run 24/7 consuming electricity and compute budget even when no registrations are occurring.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-rose-600 dark:text-rose-400">💥 Registration Spikes Crash</p>
            <p>Flash registrations (e.g., popular hackathons) overwhelm single-instance application servers.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-rose-600 dark:text-rose-400">🔧 Maintenance Overhead</p>
            <p>OS patching, security updates, firewall rules, and reverse proxies require continuous human maintenance.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-rose-600 dark:text-rose-400">🌐 Latency Penalties</p>
            <p>Centralized servers in one region suffer high round-trip latency for global or remote participants.</p>
          </div>
        </div>
      </div>

      {/* Cloudflare Serverless Solution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-500" />
          The Serverless Cloud Solution
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          EventSphere eliminates dedicated application servers by operating directly on Cloudflare’s global edge network:
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cloudflare Workers (FaaS)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                On-demand micro-function isolates spin up in less than 5 milliseconds to handle requests without persistent container management.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cloudflare D1 (Serverless SQLite)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Relational SQL storage co-located with serverless workers, supporting ACID transactions, strict capacity locking, and automatic replication.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cloudflare Pages (Global CDN)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Modern client-side single page app built with React, Vite, and Tailwind CSS cached across 300+ edge data centers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA to Demonstration */}
      <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white space-y-4">
        <h3 className="text-2xl font-bold">Ready to see the Cloud Architecture in Action?</h3>
        <p className="text-sm text-brand-100 max-w-lg mx-auto">
          Explore our interactive cloud module which lets you execute live edge API queries, measure browser latency, and test capacity enforcement.
        </p>
        <Link
          to="/cloud-architecture"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors shadow-lg"
        >
          <span>Open Cloud Service Explorer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
