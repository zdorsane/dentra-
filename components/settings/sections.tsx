'use client';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { DataCard } from '@/components/ui/DataCard';
import { Checkbox, SelectInput, TextInput } from '@/components/ui/Form';
import { StatusPill } from '@/components/ui/StatusPill';
import { AI_DISCLAIMER } from '@/lib/ai';
import { MIGRATION_SQL, SCHEMA, repositoryInfo } from '@/lib/database';
import { DEMO_CREDENTIALS, suppliers } from '@/lib/mock-data';
import { describeDataMode } from '@/lib/supabase';
import type { Clinic, StaffMember } from '@/types';

/**
 * Settings panels.
 *
 * Each section is its own component rather than a branch of one large tree:
 * it keeps the page readable, and it stops the TypeScript checker from having
 * to infer a single enormous JSX expression.
 */

/* ============================================================
   SHARED STATE
   ============================================================ */

export interface ClinicForm {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  taxId: string;
  timezone: string;
  currency: string;
}

export interface Preferences {
  emailReminders: boolean;
  smsReminders: boolean;
  lowStockAlerts: boolean;
  overdueAlerts: boolean;
  aiDigest: boolean;
  defaultDuration: string;
  slotInterval: string;
  bufferMinutes: string;
  invoicePrefix: string;
  paymentTerms: string;
  taxRate: string;
  reorderLeadDays: string;
  expiryWarningDays: string;
  aiEnabled: boolean;
  aiForecasting: boolean;
  twoFactor: boolean;
  sessionTimeout: string;
}

export const DEFAULT_PREFERENCES: Preferences = {
  emailReminders: true,
  smsReminders: false,
  lowStockAlerts: true,
  overdueAlerts: true,
  aiDigest: true,
  defaultDuration: '45',
  slotInterval: '15',
  bufferMinutes: '0',
  invoicePrefix: 'AUR',
  paymentTerms: '30',
  taxRate: '0',
  reorderLeadDays: '7',
  expiryWarningDays: '30',
  aiEnabled: true,
  aiForecasting: true,
  twoFactor: false,
  sessionTimeout: '60',
};

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type SetForm = (next: ClinicForm) => void;
type SetPrefs = (next: Preferences) => void;

/* ============================================================
   CLINIC PROFILE
   ============================================================ */

export function ClinicProfileSection({
  clinic,
  form,
  setForm,
}: {
  clinic: Clinic;
  form: ClinicForm;
  setForm: SetForm;
}) {
  return (
    <DataCard title="CLINIC PROFILE" eyebrow="IDENTITY">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="CLINIC NAME"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="LEGAL NAME"
            value={form.legalName}
            onChange={(e) => setForm({ ...form, legalName: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="EMAIL"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextInput
            label="PHONE"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <TextInput
          label="ADDRESS"
          value={form.addressLine}
          onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            label="CITY"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <TextInput
            label="POSTAL CODE"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
          <TextInput
            label="COUNTRY"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            label="TAX ID"
            value={form.taxId}
            onChange={(e) => setForm({ ...form, taxId: e.target.value })}
          />
          <SelectInput
            label="TIMEZONE"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            options={TIMEZONES}
          />
          <SelectInput
            label="CURRENCY"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            options={CURRENCIES}
          />
        </div>

        <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">OPENING HOURS</span>
          <ul className="mt-3 space-y-1.5">
            {clinic.workingHours.map((hours) => (
              <li
                key={hours.day}
                className="flex items-center justify-between gap-4 text-[12px]"
              >
                <span className="font-bold text-[#2B3033]">
                  {DAY_NAMES[hours.day]}
                </span>
                <span className="dt-mono text-[#6B6F72]">
                  {hours.closed ? 'CLOSED' : `${hours.open} – ${hours.close}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">SERVICES OFFERED</span>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {clinic.services.map((service) => (
              <span
                key={service}
                className="dt-chamfer-xs border border-[rgba(43,48,51,0.14)] bg-[#F7F6F8] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B6F72]"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DataCard>
  );
}

const TIMEZONES = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Madrid',
  'Africa/Algiers',
  'America/New_York',
].map((tz) => ({ value: tz, label: tz }));

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
];

/* ============================================================
   DOCTORS
   ============================================================ */

export function DoctorsSection({ staff }: { staff: StaffMember[] }) {
  const doctors = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  return (
    <DataCard title="DOCTORS" eyebrow="CLINICAL TEAM" padded={false}>
      <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
        {doctors.map((member) => (
          <li key={member.id} className="flex items-center gap-4 px-5 py-4">
            <span
              className="dt-chamfer-xs flex h-10 w-10 shrink-0 items-center justify-center text-[11px] font-bold text-white"
              style={{ background: member.color }}
            >
              {member.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-[#2B3033]">
                {member.fullName}
              </div>
              <div className="truncate text-[11px] text-[#6B6F72]">
                {member.specialty} · {member.licenseNumber}
              </div>
            </div>
            <span className="dt-mono shrink-0 text-[11px] text-[#6B6F72]">
              {member.weeklyHours}H/WK
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-[rgba(43,48,51,0.1)] px-5 py-4">
        <ChamferButton size="xs" variant="secondary" href="/dashboard/staff">
          MANAGE TEAM
        </ChamferButton>
      </div>
    </DataCard>
  );
}

/* ============================================================
   USERS
   ============================================================ */

export function UsersSection({ staff }: { staff: StaffMember[] }) {
  return (
    <DataCard title="USERS" eyebrow="ACCESS" padded={false}>
      <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center gap-4 px-5 py-4">
            <span className="dt-chamfer-xs flex h-9 w-9 shrink-0 items-center justify-center bg-[#1A1C1E] text-[10px] font-bold text-white">
              {member.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-[#2B3033]">
                {member.fullName}
              </div>
              <div className="truncate text-[11px] text-[#6B6F72]">
                {member.email}
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
              {member.role}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-[rgba(43,48,51,0.1)] px-5 py-4 text-[11px] leading-[1.6] text-[#6B6F72]">
        Roles determine which modules a user can open. See Staff for the full
        permission matrix.
      </p>
    </DataCard>
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */

const NOTIFICATION_ROWS: { key: keyof Preferences; label: string }[] = [
  { key: 'emailReminders', label: 'Email appointment reminders to patients' },
  { key: 'smsReminders', label: 'SMS appointment reminders to patients' },
  {
    key: 'lowStockAlerts',
    label: 'Alert me when a product falls below its minimum',
  },
  { key: 'overdueAlerts', label: 'Alert me when an invoice becomes overdue' },
  { key: 'aiDigest', label: 'Send the weekly AI operations digest' },
];

export function NotificationsSection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  return (
    <DataCard title="NOTIFICATIONS" eyebrow="ALERTS">
      <div className="space-y-4">
        {NOTIFICATION_ROWS.map((row) => (
          <div
            key={row.key}
            className="border-b border-[rgba(43,48,51,0.07)] pb-4 last:border-0 last:pb-0"
          >
            <Checkbox
              label={row.label}
              checked={Boolean(prefs[row.key])}
              onChange={(e) =>
                setPrefs({ ...prefs, [row.key]: e.target.checked })
              }
            />
          </div>
        ))}
      </div>
    </DataCard>
  );
}

/* ============================================================
   APPOINTMENTS
   ============================================================ */

const MINUTE_OPTIONS = (values: string[]) =>
  values.map((v) => ({ value: v, label: `${v} MIN` }));

export function AppointmentSettingsSection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  return (
    <DataCard title="APPOINTMENTS" eyebrow="SCHEDULING">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput
          label="DEFAULT DURATION"
          value={prefs.defaultDuration}
          onChange={(e) => setPrefs({ ...prefs, defaultDuration: e.target.value })}
          options={MINUTE_OPTIONS(['15', '30', '45', '60', '90'])}
        />
        <SelectInput
          label="SLOT INTERVAL"
          value={prefs.slotInterval}
          onChange={(e) => setPrefs({ ...prefs, slotInterval: e.target.value })}
          options={MINUTE_OPTIONS(['5', '10', '15', '30'])}
        />
        <SelectInput
          label="BUFFER BETWEEN VISITS"
          value={prefs.bufferMinutes}
          onChange={(e) => setPrefs({ ...prefs, bufferMinutes: e.target.value })}
          options={MINUTE_OPTIONS(['0', '5', '10', '15'])}
        />
      </div>
    </DataCard>
  );
}

/* ============================================================
   BILLING
   ============================================================ */

export function BillingSettingsSection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  return (
    <DataCard title="BILLING" eyebrow="INVOICING">
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput
          label="INVOICE PREFIX"
          value={prefs.invoicePrefix}
          onChange={(e) => setPrefs({ ...prefs, invoicePrefix: e.target.value })}
        />
        <SelectInput
          label="PAYMENT TERMS"
          value={prefs.paymentTerms}
          onChange={(e) => setPrefs({ ...prefs, paymentTerms: e.target.value })}
          options={['7', '14', '30', '60'].map((v) => ({
            value: v,
            label: `${v} DAYS`,
          }))}
        />
        <TextInput
          label="TAX RATE (%)"
          type="number"
          min={0}
          max={100}
          value={prefs.taxRate}
          onChange={(e) => setPrefs({ ...prefs, taxRate: e.target.value })}
        />
      </div>
    </DataCard>
  );
}

/* ============================================================
   INVENTORY
   ============================================================ */

export function InventorySettingsSection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  return (
    <>
      <DataCard title="INVENTORY" eyebrow="THRESHOLDS">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="REORDER LEAD TIME (DAYS)"
            type="number"
            min={0}
            hint="Used to forecast when to place an order."
            value={prefs.reorderLeadDays}
            onChange={(e) =>
              setPrefs({ ...prefs, reorderLeadDays: e.target.value })
            }
          />
          <TextInput
            label="EXPIRY WARNING (DAYS)"
            type="number"
            min={1}
            hint="Products are flagged as expiring within this window."
            value={prefs.expiryWarningDays}
            onChange={(e) =>
              setPrefs({ ...prefs, expiryWarningDays: e.target.value })
            }
          />
        </div>
      </DataCard>

      <DataCard title="SUPPLIERS" eyebrow="PROCUREMENT" padded={false}>
        <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
          {suppliers.map((supplier) => (
            <li key={supplier.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-[12px] font-bold text-[#2B3033]">
                  {supplier.name}
                </span>
                <span className="dt-mono text-[11px] text-[#6B6F72]">
                  {supplier.leadTimeDays}D LEAD · {supplier.country}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#6B6F72]">
                {supplier.contactName} · {supplier.email} · {supplier.phone}
              </div>
            </li>
          ))}
        </ul>
      </DataCard>
    </>
  );
}

/* ============================================================
   AI
   ============================================================ */

export function AISettingsSection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  return (
    <>
      <DataCard title="AI SETTINGS" eyebrow="DENTRA AI">
        <div className="space-y-4">
          <Checkbox
            label="Enable the DENTRA AI copilot"
            checked={prefs.aiEnabled}
            onChange={(e) => setPrefs({ ...prefs, aiEnabled: e.target.checked })}
          />
          <Checkbox
            label="Enable inventory depletion forecasting"
            checked={prefs.aiForecasting}
            onChange={(e) =>
              setPrefs({ ...prefs, aiForecasting: e.target.checked })
            }
          />
        </div>

        <div className="mt-5 border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">MODEL</span>
          <p className="mt-2 text-[12px] leading-[1.65] text-[#6B6F72]">
            DENTRA AI currently runs a local intent engine over your own clinic
            data — no request leaves this browser. The service is structured so a
            hosted model can be connected without any change to the interface.
          </p>
        </div>
      </DataCard>

      <DataCard title="SCOPE & LIMITS" eyebrow="RESPONSIBLE USE" tone="dark">
        <p className="text-[12px] leading-[1.7] text-white/65">{AI_DISCLAIMER}</p>
        <p className="mt-3 text-[12px] leading-[1.7] text-white/50">
          The assistant answers administrative questions about recorded data. It
          will decline to interpret symptoms, offer a diagnosis or recommend
          clinical treatment.
        </p>
      </DataCard>
    </>
  );
}

/* ============================================================
   SECURITY
   ============================================================ */

export function SecuritySection({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: SetPrefs;
}) {
  const repo = repositoryInfo();

  const rows = [
    { label: 'TENANCY MODEL', value: 'clinic_id on every table' },
    { label: 'TABLES', value: `${repo.tables} defined` },
    { label: 'TENANT SCOPED', value: `${repo.tenantScoped} tables` },
    { label: 'RLS', value: repo.rlsEnabled ? 'ENABLED' : 'DISABLED' },
  ];

  return (
    <>
      <DataCard title="SECURITY" eyebrow="ACCESS">
        <div className="space-y-4">
          <Checkbox
            label="Require two-factor authentication for all staff"
            checked={prefs.twoFactor}
            onChange={(e) => setPrefs({ ...prefs, twoFactor: e.target.checked })}
          />
          <SelectInput
            label="SESSION TIMEOUT"
            value={prefs.sessionTimeout}
            onChange={(e) =>
              setPrefs({ ...prefs, sessionTimeout: e.target.value })
            }
            options={['15', '30', '60', '120', '480'].map((v) => ({
              value: v,
              label: `${v} MINUTES`,
            }))}
          />
        </div>
      </DataCard>

      <DataCard title="DATA ISOLATION" eyebrow="ROW LEVEL SECURITY">
        <dl className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <dt className="dt-label text-[9px]">{row.label}</dt>
              <dd className="text-[12px] font-bold text-[#2B3033]">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 border-t border-[rgba(43,48,51,0.1)] pt-4 text-[11px] leading-[1.65] text-[#6B6F72]">
          Every domain table carries <code>clinic_id</code>, and RLS policies
          compare it against the caller&rsquo;s clinic memberships. A query cannot
          cross a tenant boundary even if the client sends an arbitrary filter.
          Only the public anon key is ever exposed to the browser.
        </p>
      </DataCard>
    </>
  );
}

/* ============================================================
   INTEGRATIONS
   ============================================================ */

const CONNECTED_TONE = {
  className: 'text-[#2E6B54] border-[rgba(46,107,84,0.34)] bg-[rgba(46,107,84,0.09)]',
  dot: 'bg-[#2E6B54]',
};

const DEMO_TONE = {
  className: 'text-[#0FA3C2] border-[rgba(21,188,223,0.45)] bg-[rgba(21,188,223,0.10)]',
  dot: 'bg-[#15BCDF]',
};

export function IntegrationsSection({
  onCopyMigration,
}: {
  onCopyMigration: () => void;
}) {
  const mode = describeDataMode();
  const envNames = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  return (
    <>
      <DataCard
        title="DATA BACKEND"
        eyebrow="SUPABASE"
        action={
          <StatusPill
            label={mode.label}
            tone={mode.mode === 'supabase' ? CONNECTED_TONE : DEMO_TONE}
            size="xs"
          />
        }
      >
        <p className="text-[12px] leading-[1.7] text-[#6B6F72]">{mode.detail}</p>

        <div className="mt-4 space-y-2 border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">REQUIRED VARIABLES</span>
          {envNames.map((name) => (
            <div key={name} className="flex items-center justify-between gap-3">
              <code className="dt-mono text-[11px] text-[#2B3033]">{name}</code>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72]">
                {mode.mode === 'supabase' ? 'SET' : 'NOT SET'}
              </span>
            </div>
          ))}
        </div>

        {mode.mode === 'demo' && (
          <div className="mt-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
            <span className="dt-label text-[9px]">DEMO CREDENTIALS</span>
            <div className="dt-mono mt-2 text-[12px] text-[#2B3033]">
              {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </div>
          </div>
        )}
      </DataCard>

      <DataCard
        title="DATABASE SCHEMA"
        eyebrow={`${SCHEMA.length} TABLES`}
        padded={false}
      >
        <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
          {SCHEMA.map((table) => (
            <li key={table.name} className="px-5 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <code className="dt-mono text-[12px] font-bold text-[#2B3033]">
                  {table.name}
                </code>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72]">
                  {table.columns.length} COLUMNS ·{' '}
                  {table.tenantScoped ? 'TENANT SCOPED' : 'TENANT ROOT'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#6B6F72]">{table.description}</p>
            </li>
          ))}
        </ul>

        <div className="border-t border-[rgba(43,48,51,0.1)] px-5 py-4">
          <ChamferButton size="xs" variant="secondary" onClick={onCopyMigration}>
            COPY MIGRATION SQL
          </ChamferButton>
        </div>
      </DataCard>
    </>
  );
}

export { MIGRATION_SQL };
