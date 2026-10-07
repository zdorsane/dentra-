'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { Logo } from '@/components/ui/Logo';


const NAV_LINKS = [
  { label: 'PLATFORM', href: '#platform' },
  { label: 'AI', href: '#ai' },
  { label: 'FEATURES', href: '#features' },
  { label: 'PRICING', href: '#pricing' },
  { label: 'CONTACT', href: '#contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header
      className="relative z-50 w-full"
      style={{
        padding: 'clamp(20px,3vw,38px) clamp(20px,4vw,48px) 0',
      }}
    >
      <nav
        className="flex h-[80px] items-center justify-between gap-6"
        aria-label="Primary"
      >
        <Logo />

        {/* Desktop navigation */}
        <ul className="hidden items-center lg:flex" style={{ gap: 34 }}>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-bold uppercase tracking-[0.06em] text-[#3A3A3A] transition-colors hover:text-black"
                style={{ fontSize: 'clamp(12px,2.4vw,15px)' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden font-bold uppercase tracking-[0.06em] text-[#3A3A3A] transition-colors hover:text-black sm:inline"
            style={{ fontSize: 'clamp(12px,2.4vw,15px)' }}
          >
            LOGIN
          </Link>

          <ChamferButton
            href="/register"
            size="sm"
            className="hidden sm:inline-flex"
          >
            GET STARTED
          </ChamferButton>

          {/* Hamburger — 3 bars, 22 × 2, 5px gap */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="dt-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center lg:hidden"
          >
            <span className="flex flex-col" style={{ gap: 5 }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block bg-[#1A1C1E]"
                  style={{ width: 22, height: 2 }}
                  animate={
                    open
                      ? i === 0
                        ? { rotate: 45, y: 7 }
                        : i === 1
                          ? { opacity: 0 }
                          : { rotate: -45, y: -7 }
                      : { rotate: 0, y: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="dt-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-[clamp(20px,4vw,48px)] top-[calc(100%-8px)] z-50 border border-[rgba(43,48,51,0.14)] bg-[#F2F1F0]/97 backdrop-blur-md lg:hidden"
          >
            <ul className="flex flex-col divide-y divide-[rgba(43,48,51,0.08)]">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[#2B3033]"
                  >
                    {link.label}
                    <span
                      className="h-[5px] w-[5px] bg-[#15BCDF]"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-2.5 border-t border-[rgba(43,48,51,0.12)] p-5">
              <ChamferButton href="/register" size="sm" fullWidth>
                GET STARTED
              </ChamferButton>
              <ChamferButton href="/login" variant="secondary" size="sm" fullWidth>
                LOGIN
              </ChamferButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
