import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Printer,
  Smartphone,
  BarChart3,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold font-heading text-slate-900">
              Dynamic<span className="text-brand-600">QR</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/scanner"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Scanner Tester
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all"
              >
                <span>Sign In / Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          {/* Subtle glowing background tint */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Production-Grade Dynamic QR Code Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.1]">
              Print Once. <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                Redirect Anywhere. Forever.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Generate dynamic QR codes encoded with permanent short URLs. Whenever you update your destination from the dashboard, physical printed codes redirect to the new URL instantly without reprinting.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-sm shadow-brand-600/20 transition-all hover:-translate-y-0.5"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/scanner"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
              >
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span>Test Scanner & Simulator</span>
              </Link>
            </div>

            {/* Visual Dynamic Workflow Diagram */}
            <div className="pt-12 sm:pt-16 max-w-4xl mx-auto">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center justify-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>The Dynamic QR Architecture</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Step 1 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-bold font-mono">
                      01
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-slate-500" /> Permanent QR Code
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Encodes <code className="text-brand-700 font-mono font-semibold">https://domain.com/q/ABC123</code>. Print it on brochures, posters, or merchandise.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                      02
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-slate-500" /> Dynamic Cloud Lookup
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Scanners hit <code className="text-indigo-700 font-mono font-semibold">/q/ABC123</code>. Supabase looks up the live destination and increments the scan counter.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold font-mono">
                      03
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-slate-500" /> Instant Redirection
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Redirects seamlessly to <code className="text-emerald-700 font-mono font-semibold">product-1</code> or updated <code className="text-emerald-700 font-mono font-semibold">product-2</code>!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Row Level Security</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Supabase RLS ensures only authenticated users can edit their QR codes while public users can scan safely.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <BarChart3 className="w-5 h-5 text-brand-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Real-Time Analytics</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Secure PostgreSQL RPC increments scan counts atomically without granting destructive table permissions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <Printer className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">PNG & SVG Vectors</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Download 1024x1024 high-res PNGs or infinite-resolution vector SVGs ready for professional printing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <Smartphone className="w-5 h-5 text-sky-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Testing Suite</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Built-in camera scanner and image file upload to test and verify your dynamic redirect workflows instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Production-Quality Dynamic QR Code Management System</p>
          <div className="flex items-center gap-4">
            <Link to="/scanner" className="hover:text-slate-800">Scanner</Link>
            <Link to="/dashboard" className="hover:text-slate-800">Dashboard</Link>
            <Link to="/login" className="hover:text-slate-800">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
