import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  QrCode,
  ArrowLeft,
  Home,
  LayoutDashboard,
  ScanLine,
  LogIn,
  Search,
  Compass,
  FileQuestion,
  HelpCircle,
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />
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

      {/* Main 404 Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Badge and Big 404 Graphic */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <FileQuestion className="w-3.5 h-3.5 text-rose-400" />
              <span>HTTP 404 Error • Page Not Found</span>
            </div>

            <div className="relative inline-block">
              <span className="text-8xl sm:text-9xl font-black font-heading tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-600 bg-clip-text text-transparent select-none drop-shadow-2xl">
                404
              </span>
              <div className="absolute -top-2 -right-4 p-2.5 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-400 animate-bounce">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
              Lost in Cyberspace?
            </h1>

            <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed">
              We couldn't find the page you're looking for. It may have been moved, deleted, or the address might contain a typo.
            </p>

            {/* Requested URL snippet */}
            {location.pathname && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 font-mono max-w-full truncate">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-500">Requested path:</span>
                <span className="text-rose-300 font-semibold truncate">{location.pathname}</span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-0.5"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
            )}
          </div>

          {/* Helpful Destination Quick Links */}
          <div className="pt-6 border-t border-slate-900 max-w-lg mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Helpful Quick Links</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
              <Link
                to="/"
                className="p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="font-medium">Homepage</span>
              </Link>
              <Link
                to="/dashboard"
                className="p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/scanner"
                className="p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 col-span-2 sm:col-span-1"
              >
                <ScanLine className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Scanner Tester</span>
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
