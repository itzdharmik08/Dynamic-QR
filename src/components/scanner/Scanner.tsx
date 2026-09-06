import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, StopCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  isScanningActive?: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, isScanningActive = true }) => {
  const [scannerMode, setScannerMode] = useState<'camera' | 'file'>('camera');
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const elementId = 'html5-qr-reader-region';

  // Stop camera helper
  const stopCamera = async () => {
    if (scannerRef.current && isCameraRunning) {
      try {
        await scannerRef.current.stop();
        setIsCameraRunning(false);
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  };

  // Start camera helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraError('No camera found on this device. You can test by uploading a QR image below!');
        return;
      }

      // Prefer back camera if available (for mobile/tablet)
      const backCamera = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // ignore frames with no QR found
        }
      );

      setIsCameraRunning(true);
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(`${msg}. Please grant camera permissions or use the file upload tab.`);
      setIsCameraRunning(false);
    }
  };

  // Handle camera mount/unmount lifecycle
  useEffect(() => {
    if (scannerMode === 'camera' && isScanningActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scannerMode, isScanningActive]);

  // Handle image file drop/select
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    try {
      let html5QrCode = scannerRef.current;
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;
      }

      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err: unknown) {
      console.error('File scan error:', err);
      setFileError('Could not detect a valid QR code in this image. Try uploading a clearer image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mb-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setScannerMode('camera');
            setFileError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            scannerMode === 'camera'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera</span>
        </button>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setScannerMode('file');
            setCameraError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            scannerMode === 'file'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image / File</span>
        </button>
      </div>

      {/* Reader Target Area */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl">
        <div
          id={elementId}
          className={`w-full overflow-hidden rounded-xl aspect-square flex items-center justify-center ${
            scannerMode === 'camera' ? 'block' : 'hidden'
          }`}
        />

        {scannerMode === 'camera' && cameraError && (
          <div className="p-4 text-center">
            <div className="p-3 inline-flex rounded-full bg-rose-500/10 text-rose-400 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-xs text-rose-300 font-medium mb-3">{cameraError}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
              <button
                onClick={() => setScannerMode('file')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-medium text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Use Image Upload
              </button>
            </div>
          </div>
        )}

        {scannerMode === 'camera' && isCameraRunning && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Camera Live
            </span>
            <button
              onClick={stopCamera}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" /> Stop Camera
            </button>
          </div>
        )}

        {/* File Upload Mode */}
        {scannerMode === 'file' && (
          <div className="py-8 px-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-8 cursor-pointer transition-all hover:bg-slate-800/40 group flex flex-col items-center justify-center"
            >
              <div className="p-3.5 rounded-2xl bg-slate-800 group-hover:bg-brand-600/20 group-hover:text-brand-400 text-slate-400 mb-3 transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Click to upload a QR code image
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PNG, JPG, WEBP, or SVG
              </p>
            </div>

            {fileError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
