import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ScanLine,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/qr/create', label: 'Create QR', icon: PlusCircle },
    { to: '/scanner', label: 'Scanner & Tester', icon: ScanLine },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/95 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Nav Links */}
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <div className="mt-2 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Workflow Card */}
          <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-brand-400 font-semibold mb-1">
              <Layers className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <p className="text-slate-400 leading-relaxed mt-1 text-[11px]">
              Print your QR once. Update the destination URL at any time. The printed QR will seamlessly redirect to the new URL!
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {/* Supabase status indicator */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px]">
              <p className="text-slate-400 font-medium">Backend Status</p>
              <p className="font-semibold text-slate-200">
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Mode'}
              </p>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>

          {user && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
