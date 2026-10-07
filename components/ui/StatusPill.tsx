import { cn } from '@/lib/utils';
import type { StatusTone } from '@/lib/utils';

interface StatusPillProps {
  label: string;
  tone: StatusTone;
  className?: string;
  size?: 'sm' | 'xs';
}

/**
 * Status indicator.
 *
 * Carries both a colour and a shape cue (the leading dot plus the written
 * label), so status is never communicated by colour alone.
 */
export function StatusPill({ label, tone, className, size = 'sm' }: StatusPillProps) {
  return (
    <span
      className={cn(
        'dt-chamfer-xs inline-flex items-center gap-[6px] border font-bold uppercase leading-none whitespace-nowrap',
        size === 'sm'
          ? 'px-[9px] py-[5px] text-[10px] tracking-[0.12em]'
          : 'px-2 py-1 text-[9px] tracking-[0.1em]',
        tone.className,
        className,
      )}
    >
      <span className={cn('h-[5px] w-[5px] shrink-0', tone.dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
