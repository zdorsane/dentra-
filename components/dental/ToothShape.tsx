import { TOOTH_CONDITION_STYLE } from '@/lib/utils';
import type { ToothCondition } from '@/types';

/**
 * Clinical tooth glyphs.
 *
 * Four crown archetypes drawn on a 40 × 62 grid — incisor, canine, premolar
 * and molar — each with anatomically appropriate roots. Deliberately flat and
 * diagrammatic, in the register of a periodontal chart rather than an
 * illustration.
 */

export type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar';

/** FDI position (1–8) → crown archetype. */
export function toothKind(number: number): ToothKind {
  const position = number % 10;
  if (position <= 2) return 'incisor';
  if (position === 3) return 'canine';
  if (position <= 5) return 'premolar';
  return 'molar';
}

/** Crown outlines, drawn crown-up (occlusal surface at y = 0). */
const CROWN: Record<ToothKind, string> = {
  incisor:
    'M11 2h18c1.6 0 2.6 1.1 2.7 2.6l.9 15.3c.1 2.3-1.3 4.1-3.4 4.1H10.8c-2.1 0-3.5-1.8-3.4-4.1l.9-15.3C8.4 3.1 9.4 2 11 2Z',
  canine:
    'M20 2c1.4 0 2.3.7 2.9 2.2l5.4 13.6c.9 2.3-.5 4.4-2.8 4.4H14.5c-2.3 0-3.7-2.1-2.8-4.4l5.4-13.6C17.7 2.7 18.6 2 20 2Z',
  premolar:
    'M10.5 2h19c1.8 0 3 1.3 3.1 3.1l.6 13.8c.1 2.5-1.5 4.3-3.9 4.3H10.7c-2.4 0-4-1.8-3.9-4.3l.6-13.8C7.5 3.3 8.7 2 10.5 2Z',
  molar:
    'M8.5 2h23c2 0 3.3 1.4 3.4 3.4l.6 13.4c.1 2.7-1.7 4.6-4.3 4.6H8.8c-2.6 0-4.4-1.9-4.3-4.6l.6-13.4C5.2 3.4 6.5 2 8.5 2Z',
};

/** Root outlines, extending below the crown. */
const ROOTS: Record<ToothKind, string> = {
  incisor: 'M15.5 24h9l-2.1 28.5c-.1 1.7-.9 2.8-2.4 2.8s-2.3-1.1-2.4-2.8L15.5 24Z',
  canine: 'M15 22h10l-2.4 32c-.1 1.9-1 3.1-2.6 3.1s-2.5-1.2-2.6-3.1L15 22Z',
  premolar:
    'M14 23h12l-1.6 26.4c-.1 1.6-.9 2.6-2.2 2.6h-4.4c-1.3 0-2.1-1-2.2-2.6L14 23Z',
  molar:
    'M8 23h9l-1.8 22.8c-.1 1.5-.9 2.4-2.1 2.4s-2-.9-2.1-2.4L8 23Z M23 23h9l-1.8 22.8c-.1 1.5-.9 2.4-2.1 2.4s-2-.9-2.1-2.4L23 23Z',
};

/** Occlusal detail — fissures on posterior teeth, incisal edge on anterior. */
const SURFACE: Record<ToothKind, string> = {
  incisor: 'M11 8h18',
  canine: 'M16 10h8',
  premolar: 'M11 11h18M20 6v10',
  molar: 'M8 11h24M20 5v14',
};

interface ToothShapeProps {
  number: number;
  condition: ToothCondition;
  selected?: boolean;
  /** Flips the glyph for the lower arch (roots point up). */
  flipped?: boolean;
  size?: number;
}

/**
 * Renders a single tooth. Missing and extraction teeth are drawn as outlines
 * with an overlay mark, so status is never carried by fill colour alone.
 */
export function ToothShape({
  number,
  condition,
  selected = false,
  flipped = false,
  size = 40,
}: ToothShapeProps) {
  const kind = toothKind(number);
  const style = TOOTH_CONDITION_STYLE[condition];
  const missing = condition === 'MISSING';
  const hatchId = `hatch-${number}`;

  const height = (size / 40) * 62;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 40 62"
      fill="none"
      className="overflow-visible"
      style={{ transform: flipped ? 'scaleY(-1)' : undefined }}
      aria-hidden="true"
      focusable="false"
    >
      {style.hatch && (
        <defs>
          <pattern
            id={hatchId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="4" height="4" fill={style.fill} />
            <line x1="0" y1="0" x2="0" y2="4" stroke={style.stroke} strokeWidth="1.1" />
          </pattern>
        </defs>
      )}

      <g
        opacity={missing ? 0.32 : 1}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* Roots */}
        <path
          d={ROOTS[kind]}
          fill={missing ? 'none' : style.fill}
          stroke={style.stroke}
          strokeWidth="1.2"
          strokeDasharray={missing ? '3 3' : undefined}
        />

        {/* Crown */}
        <path
          d={CROWN[kind]}
          fill={
            missing
              ? 'none'
              : style.hatch
                ? `url(#${hatchId})`
                : style.fill
          }
          stroke={style.stroke}
          strokeWidth="1.4"
          strokeDasharray={missing ? '3 3' : undefined}
        />

        {/* Occlusal detail */}
        {!missing && (
          <path
            d={SURFACE[kind]}
            stroke={style.stroke}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        )}
      </g>

      {/* Extraction is marked with a cross, independent of fill. */}
      {condition === 'EXTRACTION' && (
        <path
          d="M9 6 31 26 M31 6 9 26"
          stroke="#B03A34"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {/* Implant screw threads */}
      {condition === 'IMPLANT' && (
        <path
          d="M16 30h8M16 35h8M16 40h8M16 45h8"
          stroke="#15BCDF"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      )}

      {/* Selection ring — drawn outside the glyph so it never obscures state. */}
      {selected && (
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="61"
          fill="none"
          stroke="#15BCDF"
          strokeWidth="2"
          style={{ transform: flipped ? 'scaleY(-1)' : undefined, transformOrigin: 'center' }}
        />
      )}
    </svg>
  );
}
