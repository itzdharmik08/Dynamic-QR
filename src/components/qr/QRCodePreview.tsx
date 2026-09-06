import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { getPermanentUrl } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface QRCodePreviewProps {
  qrCode: string;
  title?: string;
  size?: number;
  showActions?: boolean;
  showInfoBanner?: boolean;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  qrCode,
  title = 'QR Code',
  size = 220,
  showActions = true,
  showInfoBanner = false,
  darkColor = '#0f172a',
  lightColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const permanentUrl = getPermanentUrl(qrCode);

  useEffect(() => {
    if (!canvasRef.current || !qrCode) return;

    QRCode.toCanvas(
      canvasRef.current,
      permanentUrl,
      {
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (err) {
          console.error('Failed to generate QR Code:', err);
          setError('Failed to render QR Code');
        } else {
          setError(null);
        }
      }
    );
  }, [qrCode, permanentUrl, size, darkColor, lightColor]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
      showToast('Permanent QR URL copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      // Generate a high-resolution version for printing (1024x1024)
      const highResDataUrl = await QRCode.toDataURL(permanentUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H',
      });

      const link = document.createElement('a');
      link.download = `dynamic-qr-${qrCode.toLowerCase()}.png`;
      link.href = highResDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Downloaded PNG for ${qrCode}`, 'success');
    } catch (err) {
      console.error('PNG download error:', err);
      showToast('Failed to download PNG', 'error');
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(permanentUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dynamic-qr-${qrCode.toLowerCase()}.svg`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showToast(`Downloaded vector SVG for ${qrCode}`, 'success');
    } catch (err) {
      console.error('SVG download error:', err);
      showToast('Failed to download SVG', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Canvas Container with Card styling */}
      <div className="relative group p-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col items-center justify-center transition-transform hover:scale-[1.01]">
        {error ? (
          <div className="w-48 h-48 flex items-center justify-center text-rose-500 text-sm text-center p-4">
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} title={title} className="rounded-lg shadow-sm" />
        )}

        {/* Shortcode tag badge */}
        <div className="mt-3 w-full flex items-center justify-between px-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-mono font-bold text-slate-800 tracking-wider">
            ID: {qrCode}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Dynamic
          </span>
        </div>
      </div>

      {/* Permanent URL box */}
      <div className="w-full mt-4 max-w-sm">
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Permanent QR URL
        </label>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span className="text-slate-300 truncate flex-1 select-all">{permanentUrl}</span>
          <button
            type="button"
            onClick={handleCopyUrl}
            title="Copy Permanent URL"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={permanentUrl}
            target="_blank"
            rel="noreferrer"
            title="Test Redirect in new tab"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="w-full max-w-sm grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" /> Download PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" /> Download SVG
          </button>
        </div>
      )}

      {/* Important Educational Banner */}
      {showInfoBanner && (
        <div className="mt-5 w-full max-w-sm rounded-xl p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Print this QR code. </span>
            You can change its destination URL anytime from your dashboard without ever reprinting this physical code!
          </div>
        </div>
      )}
    </div>
  );
};
