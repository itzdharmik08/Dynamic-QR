import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrService } from '../lib/qrService';
import type { DynamicQR } from '../types/database';
import {
  ExternalLink,
  AlertTriangle,
  FileQuestion,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const RedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<DynamicQR | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

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

        // Fire-and-forget scan count increment
        qrService.incrementScanCount(record.qr_code).catch((err) => {
          console.error('Scan count increment error:', err);
        });

        // Instant redirect directly to destination URL
        window.location.replace(record.destination_url);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 animate-pulse">
            <Compass className="w-8 h-8 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Resolving Destination...</h2>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Looking up dynamic route for /q/{code}
        </p>
      </div>
    );
  }

  // Case 1: QR Code Not Found (404)
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-sm animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-5">
            <FileQuestion className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            404 Not Found
          </span>
          <h1 className="text-2xl font-bold text-white mt-4 font-heading">QR Code Not Found</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The dynamic QR code <span className="font-mono text-brand-300 font-semibold">{code}</span> does not exist or has been removed.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all"
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-sm animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Disabled
          </span>
          <h1 className="text-2xl font-bold text-white mt-4 font-heading">QR Code Inactive</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            This QR code (<span className="font-mono text-slate-200 font-semibold">{code}</span>) is temporarily inactive. Please contact the owner or check back later.
          </p>
          {qr?.title && (
            <p className="text-xs text-slate-500 mt-3 italic">
              Item: {qr.title}
            </p>
          )}
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all"
            >
              Learn About Dynamic QR Codes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Active -> Seamless Auto-Redirect
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-5">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white font-heading">Redirecting...</h1>
        <p className="text-sm text-slate-400 mt-2">
          Taking you to the destination for <span className="font-mono text-brand-300 font-semibold">{code}</span>:
        </p>

        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 break-all">
          {qr?.destination_url}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={qr?.destination_url}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/25 transition-all"
          >
            <span>Click here if not redirected automatically</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <p className="text-[11px] text-slate-500">
            Powered by Dynamic QR Management
          </p>
        </div>
      </div>
    </div>
  );
};
