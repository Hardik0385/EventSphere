import React from 'react';
import { LucideIcon, Calendar } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Calendar,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) => {
  const finalActionLabel = action?.label || actionLabel;
  const finalActionHandler = action?.onClick || onAction;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-[#121215]/50">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {finalActionLabel && finalActionHandler && (
        <button
          onClick={finalActionHandler}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 shadow-sm transition-colors"
        >
          {finalActionLabel}
        </button>
      )}
    </div>
  );
};
