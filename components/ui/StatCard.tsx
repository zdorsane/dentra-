'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change vs. the previous period. */
  delta?: number;
  /** Whether a rising value is good news — drives the arrow's tone. */
  positiveIsUp?: boolean;
  caption?: string;
  href?: string;
  /** Emphasised cards get the chamfer and a cyan corner tick. */
  highlight?: boolean;
  index?: number;
  className?: string;
}

/**
 * The dashboard metric tile: 150px minimum height, flat white, thin border,
 * no drop shadow.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  positiveIsUp = true,
  caption,
  href,
  highlight = false,
  index = 0,
  className,
}: StatCardProps) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const rising = hasDelta && (delta as number) > 0;
  const flat = hasDelta && Math.abs(delta as number) < 0.05;
  const good = flat ? null : rising === positiveIsUp;

  const DeltaIcon = flat ? ArrowRight : rising ? ArrowUpRight : ArrowDownRight;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="dt-label max-w-[70%]">{label}</span>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-[#6B6F72]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-auto">
        <div
          className="dt-mono font-bold leading-none text-[#1A1C1E]"
          style={{ fontSize: 'clamp(28px, 3.4vw, 38px)' }}
        >
          {value}
        </div>

        {(hasDelta || caption) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {hasDelta && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.06em]',
                  good === null
                    ? 'text-[#6B6F72]'
                    : good
                      ? 'text-[#2E6B54]'
                      : 'text-[#B03A34]',
                )}
              >
                <DeltaIcon size={13} strokeWidth={2} aria-hidden="true" />
                {`${(delta as number) > 0 ? '+' : ''}${(delta as number).toFixed(1)}%`}
              </span>
            )}
            {caption && (
              <span className="text-[11px] tracking-[0.04em] text-[#6B6F72]">
                {caption}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  const shell = cn(
    'relative flex min-h-[150px] flex-col bg-white p-[22px] transition-colors duration-200',
    'border border-[rgba(43,48,51,0.12)]',
    highlight && 'dt-chamfer-sm',
    href && 'hover:border-[rgba(21,188,223,0.6)]',
    className,
  );

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={shell}
    >
      {highlight && (
        <span
          className="absolute right-0 top-0 h-[3px] w-8 bg-[#15BCDF]"
          aria-hidden="true"
        />
      )}
      {body}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-offset-4">
        {content}
      </Link>
    );
  }

  return content;
}
