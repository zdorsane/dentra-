'use client';

import {
  BrainCircuit,
  CalendarDays,
  Keyboard,
  Package,
  Receipt,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { DataCard } from '@/components/ui/DataCard';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { ToothIcon } from '@/components/ui/ToothIcon';
import { AI_DISCLAIMER } from '@/lib/ai';
import { DEMO_CREDENTIALS } from '@/lib/mock-data';
import { describeDataMode } from '@/lib/supabase';

interface Topic {
  icon: LucideIcon | typeof ToothIcon;
  title: string;
  body: string;
  href: string;
}

const TOPICS: Topic[] = [
  {
    icon: Users,
    title: 'PATIENTS',
    body: 'Search, filter and sort the register. Open a record for medical alerts, chart history, treatments, documents and billing.',
    href: '/dashboard/patients',
  },
  {
    icon: CalendarDays,
    title: 'APPOINTMENTS',
    body: 'Switch between day, week and month. Creating a booking checks the room for overlaps before it saves.',
    href: '/dashboard/appointments',
  },
  {
    icon: ToothIcon,
    title: 'DENTAL CHART',
    body: 'Click any tooth to record its condition, treatment and notes. Arrow keys move between teeth; Enter opens the panel.',
    href: '/dashboard/dental-chart',
  },
  {
    icon: Package,
    title: 'INVENTORY',
    body: 'Track batch, expiry and consumption. Status is derived from quantity and expiry, so badges never go stale.',
    href: '/dashboard/inventory',
  },
  {
    icon: Receipt,
    title: 'BILLING',
    body: 'Issue invoices against a treatment plan and record payments by card, cash, transfer or insurance.',
    href: '/dashboard/billing',
  },
  {
    icon: BrainCircuit,
    title: 'DENTRA AI',
    body: 'Ask about the schedule, recall lists, stock forecasts, revenue or open treatment plans in plain language.',
    href: '/dashboard/ai',
  },
];

const SHORTCUTS = [
  { keys: 'Tab', action: 'Move between controls' },
  { keys: '← →', action: 'Move between teeth in the odontogram' },
  { keys: 'Enter', action: 'Open the selected tooth' },
  { keys: 'Esc', action: 'Close a dialog or side panel' },
  { keys: '← →', action: 'Move between tabs on a patient record' },
];

export default function HelpPage() {
  const mode = describeDataMode();

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div>
        <h2
          className="dt-stair text-[#2B3033]"
          style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
        >
          HELP
        </h2>
        <p className="mt-2 max-w-[560px] text-[13px] leading-[1.6] text-[#6B6F72]">
          A short guide to each module, plus how the demo build behaves.
        </p>
      </div>

      {/* ---------------- topics ---------------- */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <a
              key={topic.title}
              href={topic.href}
              className="group border border-[rgba(43,48,51,0.12)] bg-white p-5 transition-colors hover:border-[#15BCDF]"
            >
              <Icon
                size={18}
                strokeWidth={1.4}
                className="text-[#6B6F72] transition-colors group-hover:text-[#15BCDF]"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[#2B3033]">
                {topic.title}
              </h3>
              <p className="mt-2.5 text-[12px] leading-[1.65] text-[#6B6F72]">
                {topic.body}
              </p>
            </a>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* ---------------- shortcuts ---------------- */}
        <DataCard
          title="KEYBOARD"
          eyebrow="NAVIGATION"
          action={
            <Keyboard
              size={15}
              strokeWidth={1.5}
              className="text-[#6B6F72]"
              aria-hidden="true"
            />
          }
        >
          <ul className="space-y-3">
            {SHORTCUTS.map((shortcut, i) => (
              <li key={i} className="flex items-center justify-between gap-4">
                <span className="text-[12px] text-[#6B6F72]">{shortcut.action}</span>
                <kbd className="dt-chamfer-xs dt-mono shrink-0 border border-[rgba(43,48,51,0.16)] bg-[#F7F6F8] px-2.5 py-1.5 text-[11px] font-bold text-[#2B3033]">
                  {shortcut.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </DataCard>

        {/* ---------------- demo mode ---------------- */}
        <DataCard title="DEMO MODE" eyebrow="HOW THIS BUILD RUNS">
          <p className="text-[12px] leading-[1.7] text-[#6B6F72]">{mode.detail}</p>

          <div className="mt-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
            <span className="dt-label text-[9px]">DEMO CREDENTIALS</span>
            <p className="dt-mono mt-2 text-[12px] text-[#2B3033]">
              {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </p>
          </div>

          <p className="mt-4 border-t border-[rgba(43,48,51,0.1)] pt-4 text-[11px] leading-[1.65] text-[#6B6F72]">
            Records you create — patients, appointments, invoices, chart entries
            — are held in memory for the session and reset on reload. Connect a
            Supabase project to persist them.
          </p>
        </DataCard>
      </div>

      {/* ---------------- AI scope ---------------- */}
      <DataCard title="AI SCOPE" eyebrow="RESPONSIBLE USE" tone="dark">
        <p className="text-[12px] leading-[1.75] text-white/65">{AI_DISCLAIMER}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4">
          <TechnicalLabel label="AI ENGINE" value="ACTIVE" tone="dark" dot />
          <TechnicalLabel label="VERSION" value="1.0.0" tone="dark" />
          <TechnicalLabel label="UPTIME" value="99.9%" tone="dark" />
        </div>
      </DataCard>
    </div>
  );
}
