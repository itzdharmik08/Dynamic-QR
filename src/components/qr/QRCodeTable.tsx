import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Trash2,
  Download,
  Power,
  Search,
  ArrowUpDown,
  Eye,
  Globe,
  QrCode,
} from 'lucide-react';
import type { DynamicQR } from '../../types/database';
import { StatusBadge } from '../ui/StatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { QuickEditModal } from './QuickEditModal';
import { QRCodeDownloadModal } from './QRCodeDownloadModal';
import { formatDate, truncate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface QRCodeTableProps {
  qrs: DynamicQR[];
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;
  onUpdateDestination: (id: string, newDest: string, newTitle?: string) => Promise<void>;
}

export const QRCodeTable: React.FC<QRCodeTableProps> = ({
  qrs,
  onRefresh: _onRefresh,
  onDelete,
  onToggleStatus,
  onUpdateDestination,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'scan_count' | 'title'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [qrToQuickEdit, setQrToQuickEdit] = useState<DynamicQR | null>(null);
  const [qrToDownload, setQrToDownload] = useState<DynamicQR | null>(null);
  const [qrToDelete, setQrToDelete] = useState<DynamicQR | null>(null);
  const [qrToToggle, setQrToToggle] = useState<DynamicQR | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered and sorted data
  const filteredQrs = useMemo(() => {
    return qrs
      .filter((qr) => {
        const matchesSearch =
          qr.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.destination_url.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ? true : qr.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];

        if (sortField === 'created_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [qrs, searchTerm, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: 'created_at' | 'scan_count' | 'title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const confirmDelete = async () => {
    if (!qrToDelete) return;
    try {
      setActionLoading(true);
      await onDelete(qrToDelete.id);
      showToast(`QR Code "${qrToDelete.qr_code}" deleted`, 'success');
      setQrToDelete(null);
    } catch {
      showToast('Failed to delete QR code', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!qrToToggle) return;
    try {
      setActionLoading(true);
      await onToggleStatus(qrToToggle.id, qrToToggle.status);
      const newStatus = qrToToggle.status === 'active' ? 'inactive' : 'active';
      showToast(`QR Code status changed to ${newStatus}`, 'success');
      setQrToToggle(null);
    } catch {
      showToast('Failed to update QR status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by code, title, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({qrs.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({qrs.filter((q) => q.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inactive ({qrs.filter((q) => q.status === 'inactive').length})
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        {filteredQrs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-800/80 text-slate-400 mb-3">
              <QrCode className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-200">No dynamic QR codes found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Create your first dynamic QR code to get started!'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-5">
                <Link
                  to="/qr/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
                >
                  Create New QR
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    QR Code
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 cursor-pointer hover:text-slate-200"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center gap-1.5">
                      Name
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Destination URL
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 cursor-pointer hover:text-slate-200"
                    onClick={() => toggleSort('scan_count')}
                  >
                    <div className="flex items-center gap-1.5">
                      Scans
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 cursor-pointer hover:text-slate-200"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center gap-1.5">
                      Created
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQrs.map((qr) => (
                  <tr
                    key={qr.id}
                    className="transition-colors hover:bg-slate-800/40 group"
                  >
                    {/* QR Code Identification */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQrToDownload(qr)}
                          title="Click to preview & download"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 transition-colors border border-slate-700/50"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div>
                          <span className="font-mono font-bold text-brand-300 text-sm">
                            {qr.qr_code}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            /q/{qr.qr_code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Link
                        to={`/qr/${qr.id}`}
                        className="font-semibold text-slate-100 hover:text-brand-400 transition-colors"
                      >
                        {qr.title}
                      </Link>
                    </td>

                    {/* Destination URL */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={qr.destination_url}
                          target="_blank"
                          rel="noreferrer"
                          title={qr.destination_url}
                          className="text-xs font-mono text-slate-300 hover:text-brand-300 truncate inline-block max-w-[200px]"
                        >
                          {truncate(qr.destination_url, 30)}
                        </a>
                        <a
                          href={qr.destination_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={qr.status} size="sm" />
                    </td>

                    {/* Scans */}
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-300">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/80 font-mono text-xs border border-slate-700/50">
                        {qr.scan_count}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                      {formatDate(qr.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Change Destination Modal Button */}
                        <button
                          type="button"
                          onClick={() => setQrToQuickEdit(qr)}
                          title="Change destination URL"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </button>

                        {/* View & Full Details */}
                        <Link
                          to={`/qr/${qr.id}`}
                          title="View & Edit Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Download QR */}
                        <button
                          type="button"
                          onClick={() => setQrToDownload(qr)}
                          title="Download QR Code (PNG / SVG)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Toggle Active / Inactive */}
                        <button
                          type="button"
                          onClick={() => setQrToToggle(qr)}
                          title={qr.status === 'active' ? 'Deactivate QR' : 'Activate QR'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            qr.status === 'active'
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setQrToDelete(qr)}
                          title="Delete QR"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Destination Modal */}
      <QuickEditModal
        qr={qrToQuickEdit}
        isOpen={Boolean(qrToQuickEdit)}
        onClose={() => setQrToQuickEdit(null)}
        onSave={onUpdateDestination}
      />

      {/* QR Code Download & Preview Modal */}
      <QRCodeDownloadModal
        qr={qrToDownload}
        isOpen={Boolean(qrToDownload)}
        onClose={() => setQrToDownload(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(qrToDelete)}
        title="Delete Dynamic QR Code?"
        message={`Are you sure you want to delete "${qrToDelete?.title}" (${qrToDelete?.qr_code})? Any physical printed copies of this QR code will stop redirecting immediately.`}
        confirmLabel="Yes, Delete"
        variant="danger"
        isLoading={actionLoading}
        onClose={() => setQrToDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Confirm Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={Boolean(qrToToggle)}
        title={qrToToggle?.status === 'active' ? 'Deactivate QR Code?' : 'Activate QR Code?'}
        message={
          qrToToggle?.status === 'active'
            ? `When deactivated, scanning "${qrToToggle?.qr_code}" will show a clean "QR Code Inactive" page instead of redirecting.`
            : `Activating will immediately resume redirection to "${qrToToggle?.destination_url}" when scanned.`
        }
        confirmLabel={qrToToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={qrToToggle?.status === 'active' ? 'warning' : 'primary'}
        isLoading={actionLoading}
        onClose={() => setQrToToggle(null)}
        onConfirm={confirmToggleStatus}
      />
    </div>
  );
};
