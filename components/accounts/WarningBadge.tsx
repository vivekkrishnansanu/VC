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
        !isBlocker && 'bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
        className
      )}
      style={!isBlocker ? { color: 'rgba(255, 19, 0, 1)', textAlign: 'center', paddingLeft: '6px', paddingRight: '6px' } : undefined}
    >
      <Icon className="h-3 w-3" />
      <span>{displayText}</span>
    </Badge>
  );
}
