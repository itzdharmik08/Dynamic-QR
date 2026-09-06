import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color = 'indigo',
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'group-hover:border-indigo-500/40',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.25)]',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'group-hover:border-emerald-500/40',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.25)]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'group-hover:border-amber-500/40',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]',
    },
    blue: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'group-hover:border-sky-500/40',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.25)]',
    },
  }[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-slate-900/60 p-5 border border-slate-800 transition-all duration-300 hover:-translate-y-0.5 ${colorStyles.border} ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold font-heading text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
