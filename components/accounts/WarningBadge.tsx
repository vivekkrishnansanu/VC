'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarningBadgeProps {
  type: 'pending-approvals' | 'unsupported-phones' | 'missing-devices' | 'incomplete-call-flow';
  count?: number;
  variant: 'warning' | 'blocker';
  className?: string;
}

export function WarningBadge({ type, count, variant, className }: WarningBadgeProps) {
  const isBlocker = variant === 'blocker';
  const Icon = isBlocker ? AlertCircle : AlertTriangle;
  
  const labels: Record<WarningBadgeProps['type'], string> = {
    'pending-approvals': 'Pending Approvals',
    'unsupported-phones': 'Unsupported Phones',
    'missing-devices': 'Missing Devices',
    'incomplete-call-flow': 'Incomplete Call Flow',
  };

  const label = labels[type];
  const displayText = count !== undefined && count > 0 
    ? `${label}${count > 1 ? ` (${count})` : ''}`
    : label;

  return (
    <Badge
      variant={isBlocker ? 'destructive' : 'secondary'}
      className={cn(
        'flex items-center gap-1.5 text-xs',
        isBlocker && 'bg-destructive text-destructive-foreground',
        !isBlocker && 'bg-[#FFFDEB] text-[#92400E] border-2 border-[#F0C94F]',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', !isBlocker && 'text-[#F0C94F]')} />
      <span>{displayText}</span>
    </Badge>
  );
}
