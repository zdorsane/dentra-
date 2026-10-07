'use client';

import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  /** Optional trailing count badge. */
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  tone?: 'light' | 'dark';
  /** Shared id so multiple tab strips on a page stay distinct. */
  idPrefix?: string;
}

/**
 * Horizontal tab strip with roving focus: arrow keys move between tabs,
 * Home/End jump to the ends, matching the WAI-ARIA tabs pattern.
 */
export function Tabs({
  tabs,
  active,
  onChange,
  className,
  tone = 'light',
  idPrefix = 'tab',
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const index = tabs.findIndex((t) => t.id === active);
      if (index < 0) return;

      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;

      event.preventDefault();
      onChange(tabs[next].id);
      listRef.current
        ?.querySelector<HTMLButtonElement>(`#${idPrefix}-${tabs[next].id}`)
        ?.focus();
    },
    [active, tabs, onChange, idPrefix],
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn(
        'dt-scroll flex gap-0 overflow-x-auto border-b',
        tone === 'dark' ? 'border-white/10' : 'border-[rgba(43,48,51,0.12)]',
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative shrink-0 whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-200',
              selected
                ? tone === 'dark'
                  ? 'text-white'
                  : 'text-[#1A1C1E]'
                : tone === 'dark'
                  ? 'text-white/45 hover:text-white/75'
                  : 'text-[#6B6F72] hover:text-[#2B3033]',
            )}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'dt-mono text-[10px] font-bold',
                    selected ? 'text-[#0FA3C2]' : 'opacity-60',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>

            {selected && (
              <motion.span
                layoutId={`${idPrefix}-underline`}
                className="absolute inset-x-0 -bottom-px h-[2px] bg-[#15BCDF]"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  active: string;
  children: React.ReactNode;
  idPrefix?: string;
  className?: string;
}

export function TabPanel({
  id,
  active,
  children,
  idPrefix = 'tab',
  className,
}: TabPanelProps) {
  if (id !== active) return null;

  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-${id}`}
      tabIndex={0}
      className={cn('focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}
