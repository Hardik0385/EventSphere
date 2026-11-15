import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
      <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl mt-4" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-8 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-neutral-100 dark:bg-neutral-800/60 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
          <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
