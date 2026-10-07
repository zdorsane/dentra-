'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MAIN_NAV } from './navigation';
import { useStore } from '@/lib/store';
import { can, cn } from '@/lib/utils';

interface MobileNavProps {
  onOpenMore: () => void;
}

/**
 * Bottom navigation for small screens: HOME, PATIENTS, APPOINTMENTS, AI and a
 * MORE affordance that opens the full sidebar drawer.
 */
export function MobileNav({ onOpenMore }: MobileNavProps) {
  const pathname = usePathname();
  const { session } = useStore();
  const role = session?.role ?? 'OWNER';

  const items = MAIN_NAV.filter(
    (item) => item.primary && can(role, item.permission),
  ).slice(0, 4);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="dt-no-print fixed inset-x-0 bottom-0 z-[60] grid border-t border-[rgba(43,48,51,0.12)] bg-white min-[900px]:hidden"
      style={{
        gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        // Shorten the label so five cells fit on a 320px screen.
        const label = item.label === 'APPOINTMENTS' ? 'SCHEDULE' : item.label;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors',
              active ? 'text-[#0FA3C2]' : 'text-[#6B6F72]',
            )}
          >
            {active && (
              <span
                className="absolute inset-x-3 top-0 h-[2px] bg-[#15BCDF]"
                aria-hidden="true"
              />
            )}
            <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
            <span className="text-[8.5px] font-bold uppercase tracking-[0.1em]">
              {label === 'OVERVIEW' ? 'HOME' : label}
            </span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#6B6F72]"
      >
        <Menu size={17} strokeWidth={1.6} aria-hidden="true" />
        <span className="text-[8.5px] font-bold uppercase tracking-[0.1em]">MORE</span>
      </button>
    </nav>
  );
}
