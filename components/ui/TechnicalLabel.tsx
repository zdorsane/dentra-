import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface TechnicalLabelProps {
  /** Left-hand key, e.g. `SYSTEM`. */
  label: string;
  /** Right-hand value, e.g. `ONLINE`. Omit for a bare label. */
  value?: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
  /** Adds a pulsing cyan status dot. */
  dot?: boolean;
  separator?: string;
}

/**
 * The small `KEY / VALUE` strips used throughout the product to reinforce the
 * technical register — SYSTEM / 01, AI ENGINE / ACTIVE, UPTIME / 99.9%.
 */
export function TechnicalLabel({
  label,
  value,
  className,
  tone = 'light',
  dot = false,
  separator = '/',
}: TechnicalLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] leading-none',
        tone === 'light' ? 'text-[#6B6F72]' : 'text-white/55',
        className,
      )}
    >
      {dot && (
        <span
          className="dt-dot-pulse inline-block h-[6px] w-[6px] bg-[#15BCDF]"
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      {value !== undefined && (
        <>
          <span
            aria-hidden="true"
            className={tone === 'light' ? 'text-[rgba(43,48,51,0.3)]' : 'text-white/25'}
          >
            {separator}
          </span>
          <span className={tone === 'light' ? 'text-[#2B3033]' : 'text-white/85'}>
            {value}
          </span>
        </>
      )}
    </span>
  );
}

interface TechnicalRuleProps {
  className?: string;
  tone?: 'light' | 'dark';
}

/** A hairline with a cyan tick at its head — used to close sections. */
export function TechnicalRule({ className, tone = 'light' }: TechnicalRuleProps) {
  return (
    <span
      className={cn('flex items-center gap-0 w-full', className)}
      aria-hidden="true"
    >
      <span className="h-[3px] w-[3px] bg-[#15BCDF]" />
      <span
        className={cn(
          'h-px flex-1',
          tone === 'light' ? 'bg-[rgba(43,48,51,0.12)]' : 'bg-white/12',
        )}
      />
    </span>
  );
}
