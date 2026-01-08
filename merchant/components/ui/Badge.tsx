import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

/**
 * Badge Component - Soft Fintech Minimalism
 * Pill-shaped badges with soft backgrounds
 * Success: Mint green background with darker green text
 * Info: Azure blue background
 */
export function Badge({ 
  children, 
  variant = 'neutral',
  icon: Icon,
  className = ''
}: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
    error: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
    info: 'bg-[#EFF6FF] dark:bg-blue-950/30 text-[#007AFF] dark:text-blue-400',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={2.5} />}
      {children}
    </span>
  );
}


