import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  badge?: ReactNode;
  className?: string;
}

/**
 * StatCard Component - Soft Fintech Minimalism
 * Styled like the "Order Summary" financial cards
 * Large, bold numbers with Azure Blue accents
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  badge,
  className = '',
}: StatCardProps) {
  const iconColors = {
    blue: 'bg-[#EFF6FF] dark:bg-blue-950/30 text-[#007AFF]',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600',
  };

  return (
    <Card hover className={`p-6 group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${iconColors[iconColor]} rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {subtitle}
        </p>
      )}
      {badge && <div className="mt-2">{badge}</div>}
    </Card>
  );
}


