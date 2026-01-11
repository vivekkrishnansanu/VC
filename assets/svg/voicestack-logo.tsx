import type { SVGAttributes } from "react";

import { cn } from "@/lib/utils";

export function VoiceStackMark(props: SVGAttributes<SVGElement>) {
  const { className, ...rest } = props;

  // Simple, theme-driven mark inspired by the provided VoiceStack "V" icon.
  // Uses currentColor so it can be styled via Tailwind (e.g. text-primary).
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      className={cn("text-primary", className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M3.25 5.75a1.25 1.25 0 0 1 2.15-.86L12 11.49l6.6-6.6a1.25 1.25 0 1 1 1.77 1.77l-7.48 7.48a1.25 1.25 0 0 1-1.77 0L3.62 6.64a1.25 1.25 0 0 1-.37-.89Z"
      />
      <path
        fill="currentColor"
        d="M6.25 11.75a1.25 1.25 0 0 1 2.15-.86L12 14.49l3.6-3.6a1.25 1.25 0 1 1 1.77 1.77l-4.48 4.48a1.25 1.25 0 0 1-1.77 0l-4.48-4.48a1.25 1.25 0 0 1-.37-.89Z"
      />
    </svg>
  );
}

export function VoiceStackWordmark({ className }: { className?: string }) {
  return <span className={cn("text-base font-semibold tracking-tight", className)}>VoiceStack</span>;
}

export function VoiceStackLogo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <VoiceStackMark className={cn("h-6 w-6", markClassName)} />
      <VoiceStackWordmark className={textClassName} />
    </div>
  );
}

