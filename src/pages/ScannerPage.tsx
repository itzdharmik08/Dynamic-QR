import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Scanner } from '../components/scanner/Scanner';
import { qrService } from '../lib/qrService';
import type { DynamicQR } from '../types/database';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getPermanentUrl } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ScannerPage: React.FC = () => {
  const { showToast } = useToast();
  const [scannedRaw, setScannedRaw] = useState<string | null>(null);
  const [matchedQR, setMatchedQR] = useState<DynamicQR | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  /**
   * Parses scanned text to extract short code.
   * Handles URLs like "https://domain.com/q/DEMO123", "/q/DEMO123", or raw "DEMO123".
   */
  const extractShortCode = (text: string): string => {
    const trimmed = text.trim();
    // Match /q/CODE in URL or path
    const match = trimmed.match(/\/q\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    // If text looks like a short alphanumeric code
    if (/^[a-zA-Z0-9_-]{3,16}$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    return trimmed;
  };

  const handleScan = async (decodedText: string) => {
    if (scannedRaw === decodedText && isLookingUp) return;

    setScannedRaw(decodedText);
    const code = extractShortCode(decodedText);
    setLookupError(null);
    setIsLookingUp(true);

    try {
      const record = await qrService.getQRByCode(code);
      if (record) {
        setMatchedQR(record);
        showToast(`Found dynamic QR code: ${record.qr_code}`, 'success');
      } else {
        setMatchedQR(null);
        setLookupError(`Code "${code}" was scanned, but not found in your Dynamic QR database.`);
      }
    } catch {
      setMatchedQR(null);
      setLookupError('Failed to query database for this QR code.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleReset = () => {
    setScannedRaw(null);
    setMatchedQR(null);
    setLookupError(null);
  };

  // Quick preset test for DEMO123
  const handleTestDemoCode = (code: string) => {
    handleScan(`${window.location.origin}/q/${code}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <ScanLine className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Verification & Testing Tool
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
          QR Code Scanner & Redirection Tester
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scan any dynamic QR code with your camera or an image file to verify its current live destination URL.
        </p>
      </div>

      {/* Acceptance Test Workflow Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-indigo-950 block font-semibold">
            How to verify dynamic redirection:
          </strong>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            1. Scan a QR code here and observe the initial destination (e.g. Product 1). <br />
            2. Go to the dashboard and change its destination to Product 2 (without reprinting). <br />
            3. Scan the exact same QR code again: it will resolve to Product 2!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Scanner Widget */}
        <div className="space-y-4">
          <Scanner onScan={handleScan} />

          {/* Quick Demo Simulator Buttons */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
            <p className="text-slate-600 mb-2 font-medium">
              Don't have a camera or image? Simulate a scan with demo codes:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTestDemoCode('DEMO123')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-mono text-xs font-semibold border border-slate-200 transition-colors"
              >
                Scan DEMO123
              </button>
              <button
                type="button"
                onClick={() => handleTestDemoCode('SUMMER24')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-mono text-xs font-semibold border border-slate-200 transition-colors"
              >
                Scan SUMMER24
              </button>
            </div>
          </div>
        </div>

        {/* Right: Scan Results Display */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm min-h-[360px] flex flex-col justify-center">
            {isLookingUp ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-900">Inspecting Scanned Code...</p>
                <p className="text-xs text-slate-500 mt-1">Resolving dynamic routing in database</p>
              </div>
            ) : matchedQR ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        QR Code Detected!
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dynamic routing active and verified
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={matchedQR.status} />
                </div>

                {/* Scanned Data List */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      QR Identifier Code
                    </span>
                    <p className="text-sm font-mono font-bold text-brand-600">
                      {matchedQR.qr_code}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      Permanent Scanned URL
                    </span>
                    <p className="text-xs font-mono text-slate-700 break-all select-all">
                      {getPermanentUrl(matchedQR.qr_code)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        Current Live Destination
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Dynamic Target
                      </span>
                    </div>
                    <p className="text-xs font-mono text-emerald-700 font-semibold break-all select-all">
                      {matchedQR.destination_url}
                    </p>
                  </div>

                  <div className="flex items-center justify-between px-2 text-slate-600 text-xs">
                    <span>Scans recorded so far:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {matchedQR.scan_count}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <a
                    href={getPermanentUrl(matchedQR.qr_code)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all text-xs hover:-translate-y-0.5"
                  >
                    <span>Open Destination via Dynamic Redirect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/qr/${matchedQR.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Destination URL</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      title="Clear and scan another"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : lookupError ? (
              <div className="text-center py-8">
                <div className="p-3 inline-flex rounded-full bg-amber-50 text-amber-600 mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Unrecognized QR</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">{lookupError}</p>
                {scannedRaw && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 break-all mb-4">
                    Raw: {scannedRaw}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Scan Again
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 inline-flex rounded-2xl bg-slate-100 text-slate-400 mb-3">
                  <ScanLine className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Waiting for QR Scan...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Hold a printed QR code up to your camera, upload an image file, or click a demo code above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
