import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  QrCode,
  ArrowLeft,
  Home,
  LayoutDashboard,
  ScanLine,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header / Brand Bar */}
      <header className="relative z-10 border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold font-heading text-white tracking-tight">
              Dynamic<span className="text-brand-400">QR</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/25 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered 404 Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Error 404 • Page Not Found</span>
          </div>

          {/* Large Clean 404 Heading */}
          <div className="py-2">
            <div className="text-7xl sm:text-9xl font-black font-heading tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent select-none drop-shadow-2xl leading-none">
              404
            </div>
          </div>

          {/* Main Titles */}
          <div className="space-y-2 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              Oops! Page not found
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Requested Path Callout */}
          {location.pathname && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 shadow-inner">
              <span className="text-slate-500">Path:</span>
              <span className="text-brand-300 font-semibold">{location.pathname}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-0.5"
              >
                <Home className="w-4 h-4" />
                <span>Homepage</span>
              </Link>
            )}
          </div>

          {/* Quick Helpful Links Grid */}
          <div className="w-full max-w-md pt-6 border-t border-slate-900">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Popular Pages
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/"
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex flex-col items-center gap-1.5 text-center group"
              >
                <Home className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium">Home</span>
              </Link>
              <Link
                to="/dashboard"
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex flex-col items-center gap-1.5 text-center group"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium">Dashboard</span>
              </Link>
              <Link
                to="/scanner"
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex flex-col items-center gap-1.5 text-center group"
              >
                <ScanLine className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium">Scanner</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Dynamic QR Code Management System • All rights reserved</p>
      </footer>
    </div>
  );
};
