import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
  RefreshCw,
  Database,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { qrService } from '../lib/qrService';
import type { DynamicQR, QRStats } from '../types/database';
import { StatsCard } from '../components/ui/StatsCard';
import { QRCodeTable } from '../components/qr/QRCodeTable';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [qrs, setQrs] = useState<DynamicQR[]>([]);
  const [stats, setStats] = useState<QRStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = useCallback(async (showNotification = false) => {
    if (!user?.id) {
      setQrs([]);
      setStats({ total: 0, active: 0, inactive: 0, totalScans: 0 });
      setLoading(false);
      return;
    }

    try {
      if (showNotification) setRefreshing(true);
      setTableError(null);
      const items = await qrService.getQRs(user.id);
      setQrs(items);

      if (qrService.getIsTableMissing()) {
        setTableError("Supabase credentials detected, but table 'dynamic_qrs' has not been created yet in your Supabase project. The app is currently running in local storage fallback mode so you can test all features right now!");
      }

      const computedStats = await qrService.getStats(user?.id);
      setStats(computedStats);

      if (showNotification) {
        showToast('Dashboard data refreshed', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch QR codes';
      if (msg.includes('dynamic_qrs') || msg.includes('schema cache') || msg.includes('does not exist')) {
        setTableError(msg);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, showToast]);

  const handleCopySchemaSql = async () => {
    const sql = `-- Dynamic QR Code Management System - Supabase Schema
CREATE TABLE IF NOT EXISTS public.dynamic_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE NOT NULL,
    title TEXT,
    destination_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    scan_count INTEGER NOT NULL DEFAULT 0 CHECK (scan_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_qr_code ON public.dynamic_qrs (qr_code);
CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_user_id ON public.dynamic_qrs (user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_status ON public.dynamic_qrs (status);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_dynamic_qrs_updated_at ON public.dynamic_qrs;
CREATE TRIGGER tr_dynamic_qrs_updated_at
    BEFORE UPDATE ON public.dynamic_qrs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.increment_scan_count(qr_code_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.dynamic_qrs
    SET scan_count = scan_count + 1
    WHERE qr_code = qr_code_param AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.dynamic_qrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dynamic_qrs"
    ON public.dynamic_qrs FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dynamic_qrs"
    ON public.dynamic_qrs FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dynamic_qrs"
    ON public.dynamic_qrs FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dynamic_qrs"
    ON public.dynamic_qrs FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view dynamic_qrs for redirection"
    ON public.dynamic_qrs FOR SELECT TO anon
    USING (true);

GRANT EXECUTE ON FUNCTION public.increment_scan_count(TEXT) TO anon, authenticated;`;

    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      showToast('Schema SQL copied to clipboard!', 'success');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      showToast('Failed to copy SQL', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    await qrService.deleteQR(id);
    await loadData();
  };

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await qrService.updateQR(id, { status: nextStatus });
    await loadData();
  };

  const handleUpdateDestination = async (id: string, newDest: string, newTitle?: string) => {
    await qrService.updateQR(id, {
      destination_url: newDest,
      title: newTitle,
    });
    showToast('Destination updated! Physical QR remains identical.', 'success');
    await loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Supabase info banner if in demo mode */}
      {!isSupabaseConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-amber-100 text-amber-700">
              <Database className="w-4 h-4" />
            </span>
            <span>
              <strong>Running in Demo Mode:</strong> Data is saved in browser storage. Add your{' '}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px] text-amber-900">VITE_SUPABASE_URL</code> and{' '}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px] text-amber-900">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px] text-amber-900">.env</code> to connect to your remote PostgreSQL database.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 shrink-0">
            Fully Functional Demo
          </span>
        </div>
      )}

      {/* Database Schema Setup Warning Card if table does not exist */}
      {tableError && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Supabase Table 'dynamic_qrs' Not Found
              </h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                You have connected your Supabase project in <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-900">.env</code>, but the database table hasn't been initialized yet.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2 shadow-xs">
            <p className="font-semibold text-slate-900">Quick 2-Step Setup:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Open your Supabase project dashboard and click on the <strong>SQL Editor</strong> in the left sidebar.</li>
              <li>Click <strong>New query</strong>, paste the schema script, and click <strong>Run</strong>.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopySchemaSql}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all hover:-translate-y-0.5"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy Schema SQL Script'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                qrService.resetTableMissingStatus();
                loadData(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Dynamic QR Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your permanent QR codes and dynamically route scans anywhere.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/qr/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-brand-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dynamic QR</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total QR Codes"
          value={stats.total}
          icon={QrCode}
          color="indigo"
          description="Permanent codes"
        />
        <StatsCard
          title="Active QR Codes"
          value={stats.active}
          icon={CheckCircle2}
          color="emerald"
          description="Routing enabled"
        />
        <StatsCard
          title="Inactive QR Codes"
          value={stats.inactive}
          icon={AlertCircle}
          color="amber"
          description="Disabled / Paused"
        />
        <StatsCard
          title="Total Scans"
          value={stats.totalScans}
          icon={BarChart3}
          color="blue"
          description="Real-time scan counter"
        />
      </div>

      {/* Main QR Codes Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Your Dynamic QR Codes
            </h2>
            <p className="text-xs text-slate-500">
              Click any code to view, change destination, or download print files.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading your QR codes...</p>
          </div>
        ) : (
          <QRCodeTable
            qrs={qrs}
            onRefresh={loadData}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onUpdateDestination={handleUpdateDestination}
          />
        )}
      </div>
    </div>
  );
};
