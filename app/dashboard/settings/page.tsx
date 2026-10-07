'use client';

import { useState } from 'react';

import {
  AISettingsSection,
  AppointmentSettingsSection,
  BillingSettingsSection,
  ClinicProfileSection,
  DEFAULT_PREFERENCES,
  DoctorsSection,
  InventorySettingsSection,
  IntegrationsSection,
  MIGRATION_SQL,
  NotificationsSection,
  SecuritySection,
  UsersSection,
} from '@/components/settings/sections';
import type { ClinicForm, Preferences } from '@/components/settings/sections';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { repositoryInfo } from '@/lib/database';
import { useStore } from '@/lib/store';
import { describeDataMode } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'clinic', label: 'CLINIC PROFILE' },
  { id: 'doctors', label: 'DOCTORS' },
  { id: 'users', label: 'USERS' },
  { id: 'notifications', label: 'NOTIFICATIONS' },
  { id: 'appointments', label: 'APPOINTMENTS' },
  { id: 'billing', label: 'BILLING' },
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'ai', label: 'AI SETTINGS' },
  { id: 'security', label: 'SECURITY' },
  { id: 'integrations', label: 'INTEGRATIONS' },
];

export default function SettingsPage() {
  const { clinic, staff, loading, error, reload } = useStore();
  const { toast } = useToast();

  const [section, setSection] = useState('clinic');
  const [form, setForm] = useState<ClinicForm>({
    name: clinic.name,
    legalName: clinic.legalName,
    email: clinic.email,
    phone: clinic.phone,
    addressLine: clinic.addressLine,
    city: clinic.city,
    postalCode: clinic.postalCode,
    country: clinic.country,
    taxId: clinic.taxId,
    timezone: clinic.timezone,
    currency: clinic.currency,
  });
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  const mode = describeDataMode();
  const repo = repositoryInfo();

  const onSave = () => {
    toast({
      title: 'SETTINGS SAVED',
      description:
        mode.mode === 'demo'
          ? 'Changes are held for this session in demo mode.'
          : 'Your clinic configuration has been updated.',
    });
  };

  const onCopyMigration = () => {
    navigator.clipboard
      ?.writeText(MIGRATION_SQL)
      .then(() =>
        toast({
          title: 'MIGRATION COPIED',
          description:
            'Paste it into the Supabase SQL editor to provision the schema.',
        }),
      )
      .catch(() =>
        toast({
          title: 'COPY FAILED',
          description: 'Your browser blocked clipboard access.',
          variant: 'error',
        }),
      );
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="profile" label="Loading settings" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            SETTINGS
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            Clinic configuration, access control and integrations.
          </p>
        </div>

        <ChamferButton size="sm" onClick={onSave}>
          SAVE CHANGES
        </ChamferButton>
      </div>

      <div className="grid gap-3 lg:grid-cols-[210px_1fr]">
        {/* ---------------- section nav ---------------- */}
        <nav
          aria-label="Settings sections"
          className="dt-scroll flex gap-1 overflow-x-auto border border-[rgba(43,48,51,0.12)] bg-white p-2 lg:flex-col lg:gap-0.5 lg:self-start lg:overflow-visible"
        >
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? 'true' : undefined}
              className={cn(
                'shrink-0 whitespace-nowrap px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                section === item.id
                  ? 'dt-chamfer-xs bg-[#15BCDF] text-[#1A1C1E]'
                  : 'text-[#6B6F72] hover:bg-[rgba(21,188,223,0.07)] hover:text-[#2B3033]',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ---------------- active panel ---------------- */}
        <div className="space-y-3">
          {section === 'clinic' && (
            <ClinicProfileSection clinic={clinic} form={form} setForm={setForm} />
          )}
          {section === 'doctors' && <DoctorsSection staff={staff} />}
          {section === 'users' && <UsersSection staff={staff} />}
          {section === 'notifications' && (
            <NotificationsSection prefs={prefs} setPrefs={setPrefs} />
          )}
          {section === 'appointments' && (
            <AppointmentSettingsSection prefs={prefs} setPrefs={setPrefs} />
          )}
          {section === 'billing' && (
            <BillingSettingsSection prefs={prefs} setPrefs={setPrefs} />
          )}
          {section === 'inventory' && (
            <InventorySettingsSection prefs={prefs} setPrefs={setPrefs} />
          )}
          {section === 'ai' && <AISettingsSection prefs={prefs} setPrefs={setPrefs} />}
          {section === 'security' && (
            <SecuritySection prefs={prefs} setPrefs={setPrefs} />
          )}
          {section === 'integrations' && (
            <IntegrationsSection onCopyMigration={onCopyMigration} />
          )}

          {/* Footer strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-[rgba(43,48,51,0.12)] bg-white px-5 py-4">
            <TechnicalLabel label="BACKEND" value={repo.backend.toUpperCase()} dot />
            <TechnicalLabel label="VERSION" value="1.0.0" />
            <TechnicalLabel label="UPTIME" value="99.9%" />
          </div>
        </div>
      </div>
    </div>
  );
}
