'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LogoMark } from '@/components/ui/Logo';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ToothFallback } from '@/components/three/ToothVisual';

const EASE = [0.22, 1, 0.36, 1] as const;

interface AuthLayoutProps {
  /** Staircase headline shown on the branded panel. */
  headline: string[];
  /** Index of the line painted cyan. */
  accentIndex?: number;
  children: ReactNode;
  /** Right-hand form heading. */
  title: string;
  subtitle: string;
}

/**
 * Split layout shared by login, register and password reset: brand panel on
 * the left, form on the right. The brand panel collapses to a compact header
 * below 900px so the form always leads on mobile.
 */
export function AuthLayout({
  headline,
  accentIndex = headline.length - 1,
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-[#F2F1F0] min-[900px]:flex-row">
      {/* ---------------- brand panel ---------------- */}
      <section className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-[#1A1C1E] px-6 py-8 sm:px-10 min-[900px]:w-[46%] min-[900px]:px-12 min-[900px]:py-12">
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFF 1px, transparent 1px), linear-gradient(to bottom, #FFF 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />

        {/* Decorative tooth, desktop only */}
        <div
          className="pointer-events-none absolute -right-16 bottom-0 hidden h-[52%] w-[70%] opacity-[0.16] min-[900px]:block"
          aria-hidden="true"
        >
          <ToothFallback />
        </div>

        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="DENTRA — home"
          >
            <LogoMark size={34} tone="light" />
            <span
              className="font-normal leading-none tracking-[-0.5px] text-white"
              style={{ fontSize: 26 }}
            >
              DENTRA
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative my-10 min-[900px]:my-0"
        >
          <h1
            className="dt-stair text-white"
            style={{ fontSize: 'clamp(32px, 5.2vw, 62px)' }}
          >
            {headline.map((line, i) => (
              <span
                key={line}
                className="block"
                style={{ color: i === accentIndex ? '#15BCDF' : undefined }}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-[400px] text-[13px] leading-[1.75] text-white/50">
            Patients, appointments, clinical charts, inventory and billing —
            connected in one workspace, with an AI copilot that reads your own
            clinic data.
          </p>
        </motion.div>

        <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2">
          <TechnicalLabel label="SYSTEM" value="ONLINE" tone="dark" dot />
          <TechnicalLabel label="UPTIME" value="99.9%" tone="dark" />
          <TechnicalLabel label="VERSION" value="1.0.0" tone="dark" />
        </div>
      </section>

      {/* ---------------- form panel ---------------- */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="w-full max-w-[420px]"
        >
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(24px, 3.4vw, 34px)' }}
          >
            {title}
          </h2>
          <p className="mt-3 text-[13px] leading-[1.65] text-[#6B6F72]">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </section>
    </div>
  );
}
