import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface DataCardProps {
  title?: string;
  /** Small technical key shown above the title. */
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: 'light' | 'dark';
  /** Chamfers the outer shell — reserve for emphasised panels. */
  chamfer?: boolean;
  padded?: boolean;
}

/**
 * The generic panel used across the dashboard: header rule, optional action
 * slot, flat body. Dark tone is reserved for AI surfaces.
 */
export function DataCard({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClassName,
  tone = 'light',
  chamfer = false,
  padded = true,
}: DataCardProps) {
  const dark = tone === 'dark';

  return (
    <section
      className={cn(
        // min-w-0: as a flex/grid child the card would otherwise take
        // min-width:auto and refuse to shrink below its widest content,
        // pushing the page sideways on narrow screens.
        'flex min-w-0 flex-col border',
        dark
          ? 'border-white/10 bg-[#1A1C1E] text-white'
          : 'border-[rgba(43,48,51,0.12)] bg-white',
        chamfer && 'dt-chamfer-sm',
        className,
      )}
    >
      {(title || action) && (
        <header
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4',
            dark ? 'border-white/10' : 'border-[rgba(43,48,51,0.1)]',
          )}
        >
          <div className="min-w-0">
            {eyebrow && (
              <div
                className={cn(
                  'mb-1 text-[9px] font-bold uppercase tracking-[0.18em]',
                  dark ? 'text-white/40' : 'text-[#6B6F72]',
                )}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h2
                className={cn(
                  'truncate text-[13px] font-bold uppercase tracking-[0.12em]',
                  dark ? 'text-white' : 'text-[#2B3033]',
                )}
              >
                {title}
              </h2>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}

      {/* min-w-0 lets the body shrink below its content width: without it a flex
          item defaults to min-width:auto, so a wide child (a min-w table) widens
          the whole card and pushes the page into horizontal scroll on mobile. */}
      <div className={cn('min-w-0 flex-1', padded && 'p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
