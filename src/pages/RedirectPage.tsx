import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrService } from '../lib/qrService';
import type { DynamicQR } from '../types/database';
import {
  ExternalLink,
  AlertTriangle,
  FileQuestion,
  ShieldCheck,
  Compass,
  Globe,
  Copy,
  Check,
  Pause,
  Play,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const RedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<DynamicQR | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  // Redirection countdown state
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function handleRedirection() {
      try {
        const record = await qrService.getQRByCode(code!);

        if (!isMounted) return;

        if (!record) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setQr(record);

        if (record.status !== 'active') {
          setIsInactive(true);
          setLoading(false);
          return;
        }

        // Increment scan count once
        if (!hasIncrementedRef.current) {
          hasIncrementedRef.current = true;
          qrService.incrementScanCount(record.qr_code).catch((err) => {
            console.error('Scan count increment error:', err);
          });
        }

        // Render destination details & information
        setLoading(false);
      } catch (err) {
        console.error('Redirect lookup error:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    handleRedirection();

    return () => {
      isMounted = false;
    };
  }, [code]);

  // Countdown timer for automatic navigation
  useEffect(() => {
    if (loading || notFound || isInactive || !qr || isPaused) return;

    if (countdown <= 0) {
      window.location.assign(qr.destination_url);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.assign(qr.destination_url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, notFound, isInactive, qr, isPaused, countdown]);

  const handleCopyLink = () => {
    if (!qr) return;
    navigator.clipboard.writeText(qr.destination_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const isHttps = (url: string) => {
    try {
      return new URL(url).protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Loading state (clean, without developer text)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm">
            <Compass className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">Resolving Destination...</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Connecting to destination link...
        </p>
      </div>
    );
  }

  // Case 1: QR Code Not Found (404)
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-5">
            <FileQuestion className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            404 Not Found
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-4 font-heading">QR Code Not Found</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            The dynamic QR code <span className="font-mono text-brand-600 font-semibold">{code}</span> does not exist or has been removed.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-all border border-slate-200"
            >
              Go to Dynamic QR Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: QR Code Inactive
  if (isInactive) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            Disabled
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-4 font-heading">QR Code Inactive</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            This dynamic QR code (<span className="font-mono text-slate-800 font-semibold">{code}</span>) is temporarily inactive. Please contact the owner or check back later.
          </p>
          {qr?.title && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-medium text-slate-500">QR Name:</span> {qr.title}
            </div>
          )}
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-all border border-slate-200"
            >
              Learn About Dynamic QR Codes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Active -> Full Destination Link & Information Display
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-left animate-in zoom-in-95">
        
        {/* Header with Security & Status */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs">
              <Globe className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                Redirecting to Destination
              </h1>
              <p className="text-xs text-slate-500">
                Dynamic QR Route: <span className="font-mono font-medium text-slate-700">/q/{qr?.qr_code}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active
          </span>
        </div>

        {/* Destination Link Card (Prominent) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              Destination Link
            </span>
            {qr && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                {isHttps(qr.destination_url) ? (
                  <>
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Secure HTTPS</span>
                  </>
                ) : (
                  <span>HTTP Link</span>
                )}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                {qr ? getDomain(qr.destination_url) : 'Website'}
              </span>
            </div>
            <a
              href={qr?.destination_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-brand-600 hover:text-brand-700 underline font-medium break-all transition-colors flex items-center gap-1.5"
            >
              <span>{qr?.destination_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          {/* Quick Action: Copy Link */}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Destination Link</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Auto-Redirect Progress & Action */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">
              {isPaused ? (
                <span className="text-amber-600 font-semibold">Redirect Paused</span>
              ) : (
                <>
                  Redirecting automatically in{' '}
                  <span className="font-bold text-brand-600 text-sm">{countdown}s</span>...
                </>
              )}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-amber-600" />
                  <span>Pause Timer</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isPaused ? 'bg-amber-400' : 'bg-brand-600'
              }`}
              style={{ width: `${(countdown / 3) * 100}%` }}
            />
          </div>

          {/* Action Button: Proceed Now */}
          <a
            href={qr?.destination_url}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-sm shadow-brand-600/20 transition-all cursor-pointer mt-1"
          >
            <span>Proceed to Destination Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <p className="text-[11px] text-slate-500 text-center mt-1">
            Dynamic QR Management System • Secure Dynamic Link
          </p>
        </div>

      </div>
    </div>
  );
};
