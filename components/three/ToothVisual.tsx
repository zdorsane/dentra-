'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Three.js is heavy, so the scene is code-split and only fetched once this
 * component mounts — nothing 3D touches the initial landing-page bundle.
 */
const ToothScene = dynamic(() => import('./ToothScene'), {
  ssr: false,
  loading: () => <ToothFallback />,
});

/* ============================================================
   CAPABILITY DETECTION
   ============================================================ */

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    return context !== null;
  } catch {
    return false;
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/* ============================================================
   FALLBACK
   ============================================================ */

/**
 * Flat vector stand-in shown while the scene loads and permanently when WebGL
 * is unavailable. It carries the same silhouette and cyan accents, so the
 * composition holds either way.
 */
export function ToothFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 380"
        className="h-full w-full max-h-[86%] max-w-[86%]"
        fill="none"
      >
        <defs>
          <linearGradient id="dt-tooth-body" x1="80" y1="30" x2="250" y2="350">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#EDF1F2" />
            <stop offset="100%" stopColor="#D7DEE1" />
          </linearGradient>
          <linearGradient id="dt-tooth-edge" x1="60" y1="0" x2="260" y2="380">
            <stop offset="0%" stopColor="#15BCDF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0FA3C2" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Scanning rings */}
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx="160"
            cy={150 + i * 62}
            rx={122 - i * 6}
            ry={26 - i * 3}
            stroke="#15BCDF"
            strokeOpacity={0.3 - i * 0.07}
            strokeWidth="1"
          />
        ))}

        {/* Tooth silhouette */}
        <path
          d="M92 96c0-30 23-52 50-52 18 0 28 7 46 7s28-7 46-7c27 0 50 22 50 52 0 33-11 54-18 84-6 24-7 46-10 73-2 24-5 53-22 53-15 0-20-16-25-40-4-19-8-50-27-50s-23 31-27 50c-5 24-10 40-25 40-17 0-20-29-22-53-3-27-4-49-10-73-7-30-18-51-18-84Z"
          fill="url(#dt-tooth-body)"
          stroke="url(#dt-tooth-edge)"
          strokeWidth="1.5"
        />

        {/* Inner technical wireframe */}
        <path
          d="M160 110v150M120 140h80M126 180h68M132 220h56"
          stroke="#15BCDF"
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* Data points */}
        {[
          [64, 150],
          [256, 132],
          [72, 232],
          [250, 244],
          [160, 62],
        ].map(([x, y], i) => (
          <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill="#15BCDF" />
        ))}
      </svg>
    </div>
  );
}

/* ============================================================
   PUBLIC COMPONENT
   ============================================================ */

interface ToothVisualProps {
  className?: string;
}

export function ToothVisual({ className }: ToothVisualProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  // Before detection resolves, render the fallback so there is no empty frame.
  if (supported === null) {
    return (
      <div className={cn('h-full w-full', className)}>
        <ToothFallback />
      </div>
    );
  }

  if (!supported) {
    return (
      <div className={cn('h-full w-full', className)}>
        <ToothFallback />
        <p className="dt-sr-only">
          A 3D rendering of a tooth is shown here when supported by your browser.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('h-full w-full', className)}>
      <ToothScene reducedMotion={reducedMotion} />
    </div>
  );
}
