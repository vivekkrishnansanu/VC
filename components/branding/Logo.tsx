'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'monochrome';
}

export function Logo({ className, size = 'md', showText = true, variant = 'default' }: LogoProps) {
  // VoiceStack logo dimensions: 132x26 (aspect ratio ~5.08:1)
  const sizeClasses = {
    sm: { height: 20, width: 102 },
    md: { height: 26, width: 132 },
    lg: { height: 32, width: 163 },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_8hceKdDGqqJCTe89irk2NM7FK8H7"
        alt="VoiceStack"
        height={sizes.height}
        width={sizes.width}
        className="h-auto"
        priority
        unoptimized
      />
    </div>
  );
}
