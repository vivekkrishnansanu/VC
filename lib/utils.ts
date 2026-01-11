import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classnames safely.
 *
 * Note: We intentionally keep this as a single file (and do not mirror it with a
 * `lib/utils/` directory) to avoid ambiguous module resolution in Next dev/HMR.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
