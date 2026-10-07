'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { NotificationPanel } from './NotificationPanel';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  onOpenSidebar: () => void;
}

/** Global search across patients, appointments and inventory. */
function GlobalSearch() {
  const router = useRouter();
  const { patients, inventory } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const patientHits = patients
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.fileNumber.toLowerCase().includes(q) ||
          p.phone.includes(q),
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        label: p.fullName,
        meta: `PATIENT · ${p.fileNumber}`,
        href: `/dashboard/patients/${p.id}`,
      }));

    const itemHits = inventory
      .filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        label: i.name,
        meta: `INVENTORY · ${i.sku}`,
        href: '/dashboard/inventory',
      }));

    return [...patientHits, ...itemHits];
  }, [query, patients, inventory]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative hidden w-[240px] md:block lg:w-[300px]">
      <label htmlFor="dt-global-search" className="dt-sr-only">
        Search patients and inventory
      </label>
      <Search
        size={14}
        strokeWidth={1.6}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6F72]"
      />
      <input
        id="dt-global-search"
        type="search"
        value={query}
        placeholder="SEARCH"
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="dt-input h-9 border-[rgba(43,48,51,0.14)] bg-[#F7F6F8] py-0 pl-8.5 pr-3 text-[11px] font-bold uppercase tracking-[0.08em] placeholder:tracking-[0.14em]"
        style={{ paddingLeft: 32 }}
      />

      {open && results.length > 0 && (
        <ul className="absolute left-0 top-[calc(100%+6px)] z-[60] w-full border border-[rgba(43,48,51,0.14)] bg-white shadow-[0_20px_40px_-26px_rgba(26,28,30,0.4)]">
          {results.map((result) => (
            <li key={`${result.meta}-${result.id}`}>
              <button
                type="button"
                onClick={() => {
                  router.push(result.href);
                  setQuery('');
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start gap-0.5 px-3.5 py-2.5 text-left transition-colors hover:bg-[rgba(21,188,223,0.07)]"
              >
                <span className="text-[12px] font-bold text-[#2B3033]">
                  {result.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]">
                  {result.meta}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Topbar({ title, onOpenSidebar }: TopbarProps) {
  const { session, unreadCount } = useStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header
      className="dt-no-print sticky top-0 z-50 flex h-[72px] items-center justify-between gap-4 border-b border-[rgba(43,48,51,0.1)] bg-[#F2F1F0]/92 px-4 backdrop-blur-md sm:px-6"
      style={{ height: 72 }}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="-ml-1 shrink-0 p-2 text-[#2B3033] min-[900px]:hidden"
        >
          <Menu size={19} strokeWidth={1.6} />
        </button>

        <h1 className="truncate text-[14px] font-bold uppercase tracking-[0.12em] text-[#2B3033] sm:text-[16px]">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <GlobalSearch />

        <span className="hidden lg:block">
          <TechnicalLabel label="CLINIC STATUS" value="ONLINE" dot />
        </span>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((value) => !value)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notificationsOpen}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center border transition-colors',
              notificationsOpen
                ? 'border-[#15BCDF] bg-[rgba(21,188,223,0.1)]'
                : 'border-[rgba(43,48,51,0.14)] bg-white hover:border-[#15BCDF]',
            )}
          >
            <Bell size={15} strokeWidth={1.6} className="text-[#2B3033]" />
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center bg-[#15BCDF] px-1 text-[9px] font-bold text-[#1A1C1E]"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* Avatar */}
        <span
          className="dt-chamfer-xs flex h-9 w-9 shrink-0 items-center justify-center bg-[#1A1C1E] text-[11px] font-bold text-white"
          title={session?.fullName ?? 'Dr. Amel Bensaïd'}
        >
          {session?.avatarInitials ?? 'AB'}
        </span>
      </div>
    </header>
  );
}
