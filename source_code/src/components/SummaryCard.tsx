import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

const colorMap: Record<Color, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'from-primary-500/10 to-primary-500/5', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-500/20' },
  secondary: { bg: 'from-secondary-500/10 to-secondary-500/5', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-500/20' },
  accent: { bg: 'from-accent-500/10 to-accent-500/5', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-500/20' },
  success: { bg: 'from-success-500/10 to-success-500/5', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-500/20' },
  warning: { bg: 'from-warning-500/10 to-warning-500/5', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-500/20' },
  danger: { bg: 'from-danger-500/10 to-danger-500/5', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-500/20' },
};

export default function SummaryCard({
  label, value, icon: Icon, color = 'primary', trend, subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: Color;
  trend?: { value: string; direction: 'up' | 'down' };
  subtitle?: string;
}) {
  const c = colorMap[color];
  return (
    <div className="card card-hover group animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1.5 truncate">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={c.text} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trend.direction === 'up' ? 'text-success-500' : 'text-danger-500'}>
            {trend.direction === 'up' ? <ArrowUpRight size={14} className="inline" /> : <ArrowDownRight size={14} className="inline" />}
            {trend.value}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
