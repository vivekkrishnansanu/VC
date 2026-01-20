'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-solid border-blue-200 border-r-transparent',
            sizeClasses[size]
          )}
        />
        <div
          className={cn(
            'absolute inset-0 animate-spin rounded-full border-solid border-transparent border-r-blue-600 border-t-blue-600',
            sizeClasses[size],
            'animate-[spin_1.5s_linear_infinite]'
          )}
        />
      </div>
      {text && (
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{text}</p>
          <div className="mt-2 flex gap-1 justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}
