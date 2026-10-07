import Link from 'next/link';

import { LogoMark } from '@/components/ui/Logo';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

const LINK_GROUPS = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'PLATFORM', href: '#platform' },
      { label: 'AI', href: '#ai' },
      { label: 'FEATURES', href: '#features' },
      { label: 'PRICING', href: '#pricing' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'CONTACT', href: '#contact' },
      { label: 'LEGAL', href: '#contact' },
      { label: 'PRIVACY', href: '#contact' },
    ],
  },
  {
    title: 'APPLICATION',
    links: [
      { label: 'LOGIN', href: '/login' },
      { label: 'CREATE ACCOUNT', href: '/register' },
      { label: 'DASHBOARD', href: '/dashboard' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="w-full bg-[#F2F1F0]"
      style={{ padding: 'clamp(50px,6vw,80px) clamp(20px,5vw,48px) 36px' }}
    >
      <div className="mx-auto w-full max-w-shell">
        <div className="grid gap-12 border-b border-[rgba(43,48,51,0.12)] pb-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={34} />
              <span
                className="font-normal leading-none tracking-[-0.5px] text-[#1A1C1E]"
                style={{ fontSize: 26 }}
              >
                DENTRA
              </span>
            </div>

            <p className="mt-5 max-w-[320px] text-[11px] font-bold uppercase leading-[1.7] tracking-[0.1em] text-[#6B6F72]">
              The intelligent operating system for dental clinics.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <TechnicalLabel label="SYSTEM" value="ONLINE" dot />
              <TechnicalLabel label="VERSION" value="1.0.0" />
            </div>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2B3033]">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6F72] transition-colors hover:text-[#1A1C1E]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]">
            © 2026 DENTRA
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]">
            LYON · FRANCE
          </p>
        </div>
      </div>
    </footer>
  );
}
