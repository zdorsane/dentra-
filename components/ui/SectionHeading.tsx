import { Fragment } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export interface StaircaseLine {
  text: string;
  /** Paints this line cyan. */
  accent?: boolean;
  /** Horizontal indent — any CSS length, e.g. `min(160px, 18vw)`. */
  indent?: string;
}

interface SectionHeadingProps {
  lines: StaircaseLine[];
  /** CSS font-size expression. */
  fontSize?: string;
  className?: string;
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
}

/**
 * The staircase headline used across the landing page: stacked uppercase
 * lines, the last of which step inward. Each line is its own block so the
 * indent can differ per line without breaking the tight 0.98 leading.
 */
export function SectionHeading({
  lines,
  fontSize = 'clamp(38px, 6.5vw, 78px)',
  className,
  tone = 'light',
  as: Tag = 'h2',
  id,
}: SectionHeadingProps) {
  return (
    <Tag
      id={id}
      className={cn('dt-stair', className)}
      style={{ fontSize, color: tone === 'dark' ? '#FFFFFF' : undefined }}
    >
      {lines.map((line, i) => (
        <Fragment key={`${line.text}-${i}`}>
          <span
            className="block"
            style={
              {
                marginLeft: line.indent,
                color: line.accent ? '#15BCDF' : undefined,
              } as CSSProperties
            }
          >
            {line.text}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

interface SectionIntroProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  indent?: string;
  tone?: 'light' | 'dark';
}

/** Body copy that sits beneath a staircase heading. */
export function SectionIntro({
  children,
  className,
  maxWidth = '520px',
  indent,
  tone = 'light',
}: SectionIntroProps) {
  return (
    <p
      className={cn(
        'leading-[1.7]',
        tone === 'light' ? 'text-[#6B6F72]' : 'text-white/60',
        className,
      )}
      style={{
        maxWidth,
        marginLeft: indent,
        fontSize: 'clamp(14px, 1.6vw, 17px)',
      }}
    >
      {children}
    </p>
  );
}
