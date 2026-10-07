'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Total rows across all pages, for the summary line. */
  total: number;
  perPage: number;
  className?: string;
  label?: string;
}

/** Builds a compact page list with ellipses: 1 … 4 5 6 … 12 */
function pageWindow(page: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);

  const pages = new Set<number>([1, count, page, page - 1, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b);

  const result: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('gap');
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  total,
  perPage,
  className,
  label = 'rows',
}: PaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const btn =
    'inline-flex h-8 min-w-8 items-center justify-center border px-2 text-[11px] font-bold tracking-[0.06em] transition-colors duration-150 disabled:opacity-35 disabled:cursor-not-allowed';

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(43,48,51,0.1)] px-5 py-3.5',
        className,
      )}
    >
      <p className="text-[11px] tracking-[0.04em] text-[#6B6F72]">
        <span className="dt-mono font-bold text-[#2B3033]">
          {from}–{to}
        </span>{' '}
        of <span className="dt-mono font-bold text-[#2B3033]">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={cn(
            btn,
            'border-[rgba(43,48,51,0.16)] bg-white text-[#2B3033] hover:enabled:border-[#15BCDF]',
          )}
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>

        {pageWindow(page, pageCount).map((entry, i) =>
          entry === 'gap' ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 text-[11px] text-[#6B6F72]"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                btn,
                'dt-mono',
                entry === page
                  ? 'border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E]'
                  : 'border-[rgba(43,48,51,0.16)] bg-white text-[#2B3033] hover:border-[#15BCDF]',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={cn(
            btn,
            'border-[rgba(43,48,51,0.16)] bg-white text-[#2B3033] hover:enabled:border-[#15BCDF]',
          )}
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}
