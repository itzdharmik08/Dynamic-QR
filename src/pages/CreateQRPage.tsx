import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Globe,
  Tag,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { qrService } from '../lib/qrService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QRCodePreview } from '../components/qr/QRCodePreview';
import type { DynamicQR } from '../types/database';
import { generateShortCode, isValidUrl, normalizeUrl } from '../lib/utils';

export const CreateQRPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customCode, setCustomCode] = useState(generateShortCode());
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isCustomizingCode, setIsCustomizingCode] = useState(false);

  // Submission / Result states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdQR, setCreatedQR] = useState<DynamicQR | null>(null);

  const handleRegenerateCode = () => {
    setCustomCode(generateShortCode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalized = normalizeUrl(destinationUrl);
    if (!isValidUrl(normalized)) {
      setErrorMessage('Please enter a valid HTTP or HTTPS destination URL.');
      return;
    }

    if (!customCode.trim()) {
      setErrorMessage('QR Code identifier cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newQR = await qrService.createQR(
        {
          title: title.trim() || `Product ${customCode}`,
          destination_url: normalized,
          status,
          qr_code: customCode.trim().toUpperCase(),
        },
        user?.id
      );

      setCreatedQR(newQR);
      showToast('Dynamic QR Code created successfully!', 'success');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create QR code';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedQR(null);
    setTitle('');
    setDestinationUrl('');
    setCustomCode(generateShortCode());
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
            Create Dynamic QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate a permanent QR code whose destination URL can be changed anytime.
          </p>
        </div>
      </div>

      {/* Success View */}
      {createdQR ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  QR Code Successfully Generated!
                </h2>
                <p className="text-xs text-slate-400">
                  Your dynamic QR code is active and ready to be printed or shared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* QR Preview & Downloads */}
              <div className="flex justify-center">
                <QRCodePreview
                  qrCode={createdQR.qr_code}
                  title={createdQR.title}
                  size={240}
                  showActions={true}
                  showInfoBanner={true}
                />
              </div>

              {/* Details & Next Steps */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Title / Name
                      </span>
                      <p className="text-sm font-semibold text-white">{createdQR.title}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        QR Code ID
                      </span>
                      <p className="text-sm font-mono font-bold text-brand-300">
                        {createdQR.qr_code}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Destination URL
                      </span>
                      <p className="text-xs font-mono text-slate-300 break-all">
                        {createdQR.destination_url}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Educational Banner */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-1">
                      Print this QR code with confidence!
                    </strong>
                    You can change its destination later from your dashboard without ever reprinting the physical QR.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Link
                    to={`/qr/${createdQR.id}`}
                    className="w-full sm:w-auto flex-1 text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all"
                  >
                    View QR Details & Edit
                  </Link>
                  <button
                    type="button"
                    onClick={handleCreateAnother}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                  >
                    Create Another QR
                  </button>
                  <Link
                    to="/scanner"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Test in Scanner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Title / Label
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Product 001"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    A recognizable name to identify this QR code in your dashboard.
                  </p>
                </div>

                {/* Destination URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Destination URL <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="https://example.com/product-001"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Where users will land when scanning. You can change this destination anytime!
                  </p>
                </div>

                {/* Custom Shortcode / Auto-code */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      QR Identifier Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomizingCode(!isCustomizingCode)}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                    >
                      {isCustomizingCode ? 'Use Auto-Generated' : 'Customize Code'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        disabled={!isCustomizingCode}
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                        maxLength={12}
                        className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm tracking-wider uppercase transition-all ${
                          isCustomizingCode
                            ? 'bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500'
                            : 'bg-slate-800/40 text-slate-400 border border-slate-800 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      title="Generate new random code"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Permanent URL will be: /q/{customCode}
                  </p>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active (Redirect Enabled)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('inactive')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        status === 'inactive'
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Inactive (Disabled)
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/25 transition-all disabled:opacity-50 hover:-translate-y-0.5 text-sm"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Generate Dynamic QR</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Encoding Preview */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 text-center">
                Live QR Encoding Preview
              </h3>

              <div className="flex justify-center">
                <QRCodePreview
                  qrCode={customCode}
                  title={title || 'Preview'}
                  size={180}
                  showActions={false}
                  showInfoBanner={false}
                />
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Notice: The QR code encodes only <span className="font-mono text-white">/q/{customCode}</span>. Even if you change the destination later, the image above will remain 100% unchanged!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
