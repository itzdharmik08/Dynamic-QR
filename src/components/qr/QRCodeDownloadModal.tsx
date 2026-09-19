import React from 'react';
import { X } from 'lucide-react';
import type { DynamicQR } from '../../types/database';
import { QRCodePreview } from './QRCodePreview';

interface QRCodeDownloadModalProps {
  qr: DynamicQR | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeDownloadModal: React.FC<QRCodeDownloadModalProps> = ({
  qr,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !qr) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 font-heading">{qr.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Destination: <span className="font-mono text-brand-600">{qr.destination_url}</span>
          </p>
        </div>

        <QRCodePreview
          qrCode={qr.qr_code}
          title={qr.title}
          size={200}
          showActions={true}
          showInfoBanner={true}
          logoSettings={qr.logo_settings}
          allowLogoCustomization={true}
        />
      </div>
    </div>
  );
};
