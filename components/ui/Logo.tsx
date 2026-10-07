import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Inverted marks sit on dark surfaces. */
  tone?: 'dark' | 'light';
}

/**
 * The DENTRA mark: a minimal tooth silhouette built from straight tangents and
 * two crown arcs, drawn inside a solid disc. Geometric, never illustrative.
 */
export function LogoMark({ size = 38, className, tone = 'dark' }: LogoMarkProps) {
  const disc = tone === 'dark' ? '#1A1C1E' : '#FFFFFF';
  const glyph = tone === 'dark' ? '#FFFFFF' : '#1A1C1E';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="19" cy="19" r="19" fill={disc} />
      {/* Tooth: two cusps rising to a shared crown, tapering to split roots. */}
      <path
        d="M12.4 12.1c0-2.05 1.62-3.5 3.44-3.5 1.18 0 1.95.42 3.16.42s1.98-.42 3.16-.42c1.82 0 3.44 1.45 3.44 3.5 0 2.2-.72 3.62-1.2 5.6-.38 1.56-.5 3.1-.66 4.9-.14 1.6-.3 3.36-.72 4.94-.28 1.06-.78 1.86-1.62 1.86-.9 0-1.3-.78-1.5-2.06-.2-1.28-.28-2.9-.9-2.9s-.7 1.62-.9 2.9c-.2 1.28-.6 2.06-1.5 2.06-.84 0-1.34-.8-1.62-1.86-.42-1.58-.58-3.34-.72-4.94-.16-1.8-.28-3.34-.66-4.9-.48-1.98-1.2-3.4-1.2-5.6Z"
        fill={glyph}
      />
      {/* Technical accent — the cyan status notch. */}
      <rect x="17.6" y="12.4" width="2.8" height="0.9" fill="#15BCDF" />
    </svg>
  );
}

interface LogoProps {
  href?: string;
  size?: number;
  tone?: 'dark' | 'light';
  className?: string;
  /** Hides the wordmark, leaving only the disc. */
  markOnly?: boolean;
  wordClassName?: string;
}

export function Logo({
  href = '/',
  size = 38,
  tone = 'dark',
  className,
  markOnly = false,
  wordClassName,
}: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark size={size} tone={tone} />
      {!markOnly && (
        <span
          className={cn(
            'font-normal leading-none tracking-[-0.5px]',
            tone === 'dark' ? 'text-[#1A1C1E]' : 'text-white',
            wordClassName,
          )}
          style={{ fontSize: 'clamp(22px, 5vw, 30px)' }}
        >
          DENTRA
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="DENTRA — home" className="inline-flex">
      {content}
    </Link>
  );
}
