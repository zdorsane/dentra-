import { cn } from '@/lib/utils';

interface ToothIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * Tooth glyph drawn to match Lucide's visual weight (24px grid, 1.5 stroke,
 * no fill), since Lucide has no dental icon of its own.
 */
export function ToothIcon({
  size = 20,
  className,
  strokeWidth = 1.5,
}: ToothIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.2 3.4c1.3 0 2 .6 3.3.6h3c1.3 0 2-.6 3.3-.6 1.9 0 3.2 1.5 3.2 3.6 0 2.3-.8 3.8-1.3 5.9-.4 1.6-.5 3.2-.7 5.1-.15 1.7-.35 3.6-1.5 3.6-1 0-1.4-1.1-1.7-2.7-.3-1.6-.6-3.4-1.8-3.4s-1.5 1.8-1.8 3.4c-.3 1.6-.7 2.7-1.7 2.7-1.15 0-1.35-1.9-1.5-3.6-.2-1.9-.3-3.5-.7-5.1C5.8 10.8 5 9.3 5 7c0-2.1 1.3-3.6 3.2-3.6Z" />
    </svg>
  );
}
