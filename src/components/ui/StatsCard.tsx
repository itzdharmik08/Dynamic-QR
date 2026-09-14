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
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
      glow: 'hover:shadow-md',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
      glow: 'hover:shadow-md',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
      glow: 'hover:shadow-md',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'hover:border-sky-300',
      glow: 'hover:shadow-md',
    },
  }[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs transition-all duration-300 hover:-translate-y-0.5 ${colorStyles.border} ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold font-heading text-slate-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
