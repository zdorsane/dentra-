'use client';

import { Check, Plus, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { DataCard } from '@/components/ui/DataCard';
import { SelectInput, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { clinic } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import {
  ROLE_DESCRIPTION,
  ROLE_PERMISSIONS,
  cn,
  createId,
  formatDate,
  initials,
} from '@/lib/utils';
import type { PermissionKey, StaffMember, StaffRole, StaffStatus } from '@/types';

const ROLES: StaffRole[] = [
  'OWNER',
  'DENTIST',
  'ASSISTANT',
  'RECEPTIONIST',
  'MANAGER',
];

const MODULES: { key: PermissionKey; label: string }[] = [
  { key: 'overview', label: 'OVERVIEW' },
  { key: 'patients', label: 'PATIENTS' },
  { key: 'appointments', label: 'APPOINTMENTS' },
  { key: 'treatments', label: 'TREATMENTS' },
  { key: 'dental-chart', label: 'DENTAL CHART' },
  { key: 'inventory', label: 'INVENTORY' },
  { key: 'billing', label: 'BILLING' },
  { key: 'analytics', label: 'ANALYTICS' },
  { key: 'ai', label: 'AI COPILOT' },
  { key: 'staff', label: 'STAFF' },
  { key: 'settings', label: 'SETTINGS' },
];

function statusTone(status: StaffStatus) {
  if (status === 'ACTIVE') {
    return {
      className: 'text-[#2E6B54] border-[rgba(46,107,84,0.34)] bg-[rgba(46,107,84,0.09)]',
      dot: 'bg-[#2E6B54]',
    };
  }
  if (status === 'ON LEAVE') {
    return {
      className: 'text-[#9A6410] border-[rgba(196,132,26,0.4)] bg-[rgba(214,158,46,0.12)]',
      dot: 'bg-[#C4841A]',
    };
  }
  return {
    className: 'text-[#6B6F72] border-[rgba(43,48,51,0.18)] bg-[rgba(43,48,51,0.04)]',
    dot: 'bg-[#6B6F72]',
  };
}

export default function StaffPage() {
  const { staff, patients, appointments, loading, error, reload, addStaffMember, updateStaffMember } =
    useStore();
  const { toast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'DENTIST' as StaffRole,
    specialty: '',
    licenseNumber: '',
  });

  /** Caseload per practitioner, so the table says something operational. */
  const caseload = useMemo(() => {
    const map = new Map<string, { patients: number; upcoming: number }>();
    staff.forEach((member) => {
      map.set(member.id, {
        patients: patients.filter((p) => p.assignedDentistId === member.id).length,
        upcoming: appointments.filter(
          (a) => a.dentistId === member.id && a.status !== 'COMPLETED',
        ).length,
      });
    });
    return map;
  }, [staff, patients, appointments]);

  const onInvite = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;

    const member: StaffMember = {
      id: createId('staff'),
      clinicId: clinic.id,
      userId: createId('user'),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
      specialty: form.specialty.trim() || ROLE_DESCRIPTION[form.role],
      licenseNumber: form.licenseNumber.trim() || '—',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().slice(0, 10),
      avatarInitials: initials(form.fullName),
      weeklyHours: 35,
      color: '#6B6F72',
    };

    addStaffMember(member);
    setInviteOpen(false);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'DENTIST',
      specialty: '',
      licenseNumber: '',
    });
    toast({
      title: 'STAFF MEMBER ADDED',
      description: `${member.fullName} joined as ${member.role.toLowerCase()}.`,
    });
  };

  const onRoleChange = (member: StaffMember, role: StaffRole) => {
    updateStaffMember({ ...member, role });
    toast({
      title: 'ROLE UPDATED',
      description: `${member.fullName} is now ${role.toLowerCase()}.`,
    });
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="cards" rows={6} label="Loading staff" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            STAFF
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            {staff.length} team members ·{' '}
            {staff.filter((s) => s.status === 'ACTIVE').length} active
          </p>
        </div>

        <ChamferButton size="sm" onClick={() => setInviteOpen(true)}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          ADD STAFF MEMBER
        </ChamferButton>
      </div>

      {/* ---------------- team ---------------- */}
      {staff.length === 0 ? (
        <div className="border border-[rgba(43,48,51,0.12)] bg-white">
          <EmptyState
            title="NO STAFF MEMBERS"
            description="Invite your first team member to get started."
            icon={UserRound}
            actionLabel="ADD STAFF MEMBER"
            onAction={() => setInviteOpen(true)}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => {
            const load = caseload.get(member.id);
            return (
              <article
                key={member.id}
                className="flex flex-col border border-[rgba(43,48,51,0.12)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className="dt-chamfer-xs flex h-12 w-12 shrink-0 items-center justify-center text-[13px] font-bold text-white"
                      style={{ background: member.color }}
                    >
                      {member.avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-bold uppercase tracking-[0.03em] text-[#2B3033]">
                        {member.fullName}
                      </h3>
                      <p className="mt-0.5 truncate text-[11px] text-[#6B6F72]">
                        {member.specialty}
                      </p>
                    </div>
                  </div>

                  <StatusPill
                    label={member.status}
                    tone={statusTone(member.status)}
                    size="xs"
                  />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[rgba(43,48,51,0.08)] pt-4">
                  <div>
                    <dt className="dt-label text-[8.5px]">PATIENTS</dt>
                    <dd className="dt-mono mt-1 text-[16px] font-bold text-[#1A1C1E]">
                      {load?.patients ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="dt-label text-[8.5px]">UPCOMING</dt>
                    <dd className="dt-mono mt-1 text-[16px] font-bold text-[#1A1C1E]">
                      {load?.upcoming ?? 0}
                    </dd>
                  </div>
                </dl>

                <dl className="mt-4 space-y-2 border-t border-[rgba(43,48,51,0.08)] pt-4 text-[11px]">
                  {[
                    { label: 'EMAIL', value: member.email },
                    { label: 'PHONE', value: member.phone },
                    { label: 'LICENCE', value: member.licenseNumber },
                    { label: 'JOINED', value: formatDate(member.joinedAt) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3">
                      <dt className="dt-label text-[8.5px]">{row.label}</dt>
                      <dd className="truncate text-right text-[#6B6F72]">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 border-t border-[rgba(43,48,51,0.08)] pt-4">
                  <SelectInput
                    label="ROLE"
                    value={member.role}
                    onChange={(event) =>
                      onRoleChange(member, event.target.value as StaffRole)
                    }
                    options={ROLES.map((role) => ({ value: role, label: role }))}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ---------------- permission matrix ---------------- */}
      <DataCard
        title="ROLE PERMISSIONS"
        eyebrow="ACCESS CONTROL"
        padded={false}
        action={<TechnicalLabel label="ROLES" value={String(ROLES.length)} dot />}
      >
        <div className="dt-scroll overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <caption className="dt-sr-only">
              Which modules each role can access
            </caption>
            <thead>
              <tr className="border-b border-[rgba(43,48,51,0.12)]">
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]"
                >
                  MODULE
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    scope="col"
                    className="px-3 py-3 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72]"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(43,48,51,0.07)]">
              {MODULES.map((module) => (
                <tr key={module.key}>
                  <th
                    scope="row"
                    className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-[#2B3033]"
                  >
                    {module.label}
                  </th>
                  {ROLES.map((role) => {
                    const allowed = ROLE_PERMISSIONS[role].includes(module.key);
                    return (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex h-5 w-5 items-center justify-center',
                            allowed
                              ? 'bg-[rgba(21,188,223,0.14)] text-[#0FA3C2]'
                              : 'text-[rgba(43,48,51,0.25)]',
                          )}
                        >
                          {allowed ? (
                            <Check size={12} strokeWidth={2.4} />
                          ) : (
                            <X size={12} strokeWidth={2} />
                          )}
                          <span className="dt-sr-only">
                            {allowed ? 'Allowed' : 'Not allowed'}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="space-y-2 border-t border-[rgba(43,48,51,0.1)] px-5 py-4">
          {ROLES.map((role) => (
            <li key={role} className="flex flex-wrap items-baseline gap-2 text-[11px]">
              <span className="font-bold uppercase tracking-[0.1em] text-[#2B3033]">
                {role}
              </span>
              <span className="text-[#6B6F72]">{ROLE_DESCRIPTION[role]}</span>
            </li>
          ))}
        </ul>
      </DataCard>

      {/* ---------------- invite modal ---------------- */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="ADD STAFF MEMBER"
        eyebrow="TEAM"
        size="md"
        footer={
          <>
            <ChamferButton
              variant="secondary"
              size="sm"
              onClick={() => setInviteOpen(false)}
            >
              CANCEL
            </ChamferButton>
            <ChamferButton size="sm" type="submit" form="staff-form">
              ADD MEMBER
            </ChamferButton>
          </>
        }
      >
        <form id="staff-form" onSubmit={onInvite} className="space-y-4">
          <TextInput
            label="FULL NAME"
            required
            placeholder="Dr. Camille Rousseau"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="EMAIL"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <TextInput
              label="PHONE"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </div>

          <SelectInput
            label="ROLE"
            value={form.role}
            hint={ROLE_DESCRIPTION[form.role]}
            onChange={(event) =>
              setForm({ ...form, role: event.target.value as StaffRole })
            }
            options={ROLES.map((role) => ({ value: role, label: role }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="SPECIALTY"
              placeholder="Endodontics"
              value={form.specialty}
              onChange={(event) => setForm({ ...form, specialty: event.target.value })}
            />
            <TextInput
              label="LICENCE NUMBER"
              placeholder="FR-DEN-000000"
              value={form.licenseNumber}
              onChange={(event) =>
                setForm({ ...form, licenseNumber: event.target.value })
              }
            />
          </div>

          <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
            <span className="dt-label text-[9px]">GRANTS ACCESS TO</span>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ROLE_PERMISSIONS[form.role].map((permission) => (
                <span
                  key={permission}
                  className="dt-chamfer-xs border border-[rgba(21,188,223,0.4)] bg-[rgba(21,188,223,0.08)] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0FA3C2]"
                >
                  {permission.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
