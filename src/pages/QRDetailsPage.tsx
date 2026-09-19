import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  Tag,
  Save,
  Trash2,
  Power,
  ExternalLink,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ScanLine,
} from 'lucide-react';
import { qrService } from '../lib/qrService';
import type { DynamicQR } from '../types/database';
import { QRCodePreview } from '../components/qr/QRCodePreview';
import { QRLogoCustomizer } from '../components/qr/QRLogoCustomizer';
import { DEFAULT_LOGO_SETTINGS, type QRLogoSettings } from '../lib/qrLogo';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDate, isValidUrl, normalizeUrl, getPermanentUrl } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const QRDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [qr, setQr] = useState<DynamicQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form edit states
  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [logoSettings, setLogoSettings] = useState<QRLogoSettings>(DEFAULT_LOGO_SETTINGS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadQR() {
      try {
        setLoading(true);
        const record = await qrService.getQRById(id!);
        if (!record) {
          showToast('QR code not found', 'error');
          navigate('/dashboard');
          return;
        }
        setQr(record);
        setTitle(record.title);
        setDestinationUrl(record.destination_url);
        setStatus(record.status);
        setLogoSettings(record.logo_settings || DEFAULT_LOGO_SETTINGS);
      } catch {
        showToast('Failed to load QR details', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadQR();
  }, [id, navigate, showToast]);

  // Derived unsaved modifications
  const initialLogo = qr ? JSON.stringify(qr.logo_settings || DEFAULT_LOGO_SETTINGS) : '';
  const currentLogo = JSON.stringify(logoSettings);
  const hasChanges = qr
    ? title !== qr.title ||
      destinationUrl !== qr.destination_url ||
      status !== qr.status ||
      initialLogo !== currentLogo
    : false;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qr) return;
    setErrorMessage(null);

    const normalized = normalizeUrl(destinationUrl);
    if (!isValidUrl(normalized)) {
      setErrorMessage('Please provide a valid HTTP or HTTPS destination URL.');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await qrService.updateQR(qr.id, {
        title: title.trim(),
        destination_url: normalized,
        status,
        logo_settings: logoSettings,
      });

      setQr(updated);
      setDestinationUrl(updated.destination_url);
      setTitle(updated.title);
      setStatus(updated.status);
      setLogoSettings(updated.logo_settings || logoSettings);

      showToast('Destination and logo settings updated successfully! The printed QR remains unchanged.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!qr) return;
    const newStatus = qr.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await qrService.updateQR(qr.id, { status: newStatus });
      setQr(updated);
      setStatus(updated.status);
      showToast(`QR Code ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!qr) return;
    try {
      setIsDeleting(true);
      await qrService.deleteQR(qr.id);
      showToast(`QR Code "${qr.qr_code}" deleted`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('Failed to delete QR code', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">Loading QR Details...</p>
      </div>
    );
  }

  if (!qr) return null;

  const permanentUrl = getPermanentUrl(qr.qr_code);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
              {qr.title}
            </h1>
            <StatusBadge status={qr.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Identifier Code: <span className="text-brand-600 font-bold">{qr.qr_code}</span>
          </p>
        </div>

        {/* Danger & Status quick controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-xs ${
              qr.status === 'active'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {qr.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Grid: Left is QR Display, Right is Destination Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: QR Display & Export */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <QRCodePreview
              qrCode={qr.qr_code}
              title={qr.title}
              size={220}
              showActions={true}
              showInfoBanner={false}
              logoSettings={logoSettings}
              onLogoSettingsChange={setLogoSettings}
              allowLogoCustomization={true}
            />

            {/* Permanent URL Explanation Callout */}
            <div className="mt-5 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1.5">
              <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Permanent QR URL
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed font-mono select-all font-semibold">
                {permanentUrl}
              </p>
              <p className="text-[11px] text-slate-600 pt-1">
                "This URL never needs to change. Update the destination below instead."
              </p>
            </div>
          </div>

          {/* Quick Scanner shortcut */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Want to test this QR?</p>
              <p className="text-slate-500 text-[11px]">Simulate scanning in the scanner page</p>
            </div>
            <Link
              to="/scanner"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1 border border-slate-200"
            >
              <ScanLine className="w-3.5 h-3.5" /> Test
            </Link>
          </div>
        </div>

        {/* Right: Destination Editor & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                Total Scans
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 font-heading font-mono">
                {qr.scan_count.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Created
              </div>
              <p className="mt-2 text-xs font-medium text-slate-700">
                {formatDate(qr.created_at)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
                <Clock className="w-4 h-4 text-emerald-600" />
                Last Updated
              </div>
              <p className="mt-2 text-xs font-medium text-slate-700">
                {formatDate(qr.updated_at)}
              </p>
            </div>
          </div>

          {/* Edit Destination Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Edit Destination & Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Update where this dynamic QR redirects without reprinting.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Title / Name
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Product 001"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Destination URL <span className="text-rose-500">*</span>
                  </label>
                  <a
                    href={destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-mono font-medium"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://example.com/new-product"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  When users scan this QR, they will immediately be directed to this URL.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      status === 'inactive'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Inactive
                  </button>
                </div>
              </div>

              {/* Center Logo Customizer */}
              <div className="pt-2 border-t border-slate-200">
                <QRLogoCustomizer
                  settings={logoSettings}
                  onChange={setLogoSettings}
                />
              </div>

              {/* Notice that QR stays untouched */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Reminder: The physical QR image does <strong>NOT</strong> need to be reprinted after you change the destination URL.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={!hasChanges || isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all disabled:opacity-50 text-sm hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Dynamic QR Code?"
        message={`Are you sure you want to delete "${qr.title}" (${qr.qr_code})? Any physical printed copies of this QR code will stop working immediately.`}
        confirmLabel="Yes, Delete QR"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
