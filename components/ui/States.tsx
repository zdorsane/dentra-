'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


import { ChamferButton } from './ChamferButton';
import { cn } from '@/lib/utils';

/* ============================================================
   EMPTY STATE
   ============================================================ */

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  actionHref,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
    >
      {Icon && (
        <span
          className="dt-chamfer-xs mb-5 flex h-12 w-12 items-center justify-center border border-[rgba(43,48,51,0.14)] bg-[#F7F6F8]"
          aria-hidden="true"
        >
          <Icon size={19} strokeWidth={1.4} className="text-[#6B6F72]" />
        </span>
      )}

      <h3 className="text-[15px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-[340px] text-[13px] leading-[1.65] text-[#6B6F72]">
        {description}
      </p>

      {actionLabel && (onAction || actionHref) && (
        <ChamferButton
          size="sm"
          className="mt-6"
          onClick={onAction}
          href={actionHref}
        >
          {actionLabel}
        </ChamferButton>
      )}
    </div>
  );
}

/* ============================================================
   ERROR STATE
   ============================================================ */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  detail?: string;
}

export function ErrorState({
  title = 'SOMETHING WENT WRONG',
  description = 'Unable to load clinic data.',
  onRetry,
  className,
  detail,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      <span
        className="dt-chamfer-xs mb-5 flex h-12 w-12 items-center justify-center border border-[rgba(176,58,52,0.3)] bg-[rgba(176,58,52,0.07)]"
        aria-hidden="true"
      >
        <AlertTriangle size={19} strokeWidth={1.5} className="text-[#B03A34]" />
      </span>

      <h3 className="text-[15px] font-bold uppercase tracking-[0.12em] text-[#2B3033]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-[360px] text-[13px] leading-[1.65] text-[#6B6F72]">
        {description}
      </p>

      {detail && (
        <p className="mt-3 max-w-[420px] break-words font-mono text-[11px] leading-[1.6] text-[#9AA0A4]">
          {detail}
        </p>
      )}

      {onRetry && (
        <ChamferButton size="sm" className="mt-6" onClick={onRetry}>
          <RotateCw size={13} strokeWidth={2} aria-hidden="true" />
          TRY AGAIN
        </ChamferButton>
      )}
    </div>
  );
}

/* ============================================================
   SKELETONS
   ============================================================ */

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('dt-skeleton block', className)}
      style={style}
    />
  );
}

interface LoadingSkeletonProps {
  variant?: 'dashboard' | 'table' | 'cards' | 'profile' | 'chart' | 'chat';
  rows?: number;
  className?: string;
  label?: string;
}

/**
 * Skeletons mirror the real layout closely enough that content lands without
 * a visual jump. A single polite live region announces the loading state.
 */
export function LoadingSkeleton({
  variant = 'table',
  rows = 6,
  className,
  label = 'Loading',
}: LoadingSkeletonProps) {
  return (
    <div className={cn('w-full', className)} role="status" aria-live="polite">
      <span className="dt-sr-only">{label}…</span>

      {variant === 'dashboard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[150px] border border-[rgba(43,48,51,0.12)] bg-white p-[22px]"
              >
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-8 h-8 w-24" />
                <Skeleton className="mt-4 h-2.5 w-16" />
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="border border-[rgba(43,48,51,0.12)] bg-white p-5">
              <Skeleton className="h-3 w-32" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
            <div className="border border-white/10 bg-[#1A1C1E] p-5">
              <Skeleton className="h-3 w-24 opacity-20" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full opacity-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === 'table' && (
        <div className="border border-[rgba(43,48,51,0.12)] bg-white">
          <div className="border-b border-[rgba(43,48,51,0.1)] px-5 py-4">
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="divide-y divide-[rgba(43,48,51,0.08)]">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-8 w-8 shrink-0" />
                <Skeleton className="h-3 flex-1" style={{ maxWidth: 180 }} />
                <Skeleton className="hidden h-3 w-28 sm:block" />
                <Skeleton className="hidden h-3 w-24 md:block" />
                <Skeleton className="h-5 w-20 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'cards' && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="border border-[rgba(43,48,51,0.12)] bg-white p-5"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-5 w-40" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {variant === 'profile' && (
        <div className="space-y-3">
          <div className="border border-[rgba(43,48,51,0.12)] bg-white p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16" />
              <div className="flex-1">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="mt-3 h-3 w-40" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-[rgba(43,48,51,0.12)] bg-white p-5"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-4 h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'chart' && (
        <div className="border border-[rgba(43,48,51,0.12)] bg-white p-5">
          <Skeleton className="h-3 w-32" />
          <div className="mt-6 flex h-[220px] items-end gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${30 + ((i * 37) % 60)}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {variant === 'chat' && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}
            >
              <Skeleton
                className="h-16 opacity-20"
                style={{ width: i % 2 === 0 ? '46%' : '72%' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
