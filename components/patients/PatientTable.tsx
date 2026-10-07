'use client';

import { ArrowUpDown, ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';

import { StatusPill } from '@/components/ui/StatusPill';
import { cn, formatDate, patientTone } from '@/lib/utils';
import type { Patient } from '@/types';

export type PatientSortKey =
  | 'fullName'
  | 'lastVisit'
  | 'nextAppointment'
  | 'primaryTreatment'
  | 'status';

interface PatientTableProps {
  patients: Patient[];
  sortKey: PatientSortKey;
  sortDirection: 'asc' | 'desc';
  onSort: (key: PatientSortKey) => void;
}

const COLUMNS: {
  key: PatientSortKey | 'contact' | 'actions';
  label: string;
  sortable: boolean;
  className?: string;
}[] = [
  { key: 'fullName', label: 'PATIENT', sortable: true },
  { key: 'contact', label: 'CONTACT', sortable: false, className: 'hidden lg:table-cell' },
  { key: 'lastVisit', label: 'LAST VISIT', sortable: true, className: 'hidden md:table-cell' },
  {
    key: 'nextAppointment',
    label: 'NEXT APPOINTMENT',
    sortable: true,
    className: 'hidden xl:table-cell',
  },
  {
    key: 'primaryTreatment',
    label: 'TREATMENT',
    sortable: true,
    className: 'hidden lg:table-cell',
  },
  { key: 'status', label: 'STATUS', sortable: true },
  { key: 'actions', label: 'ACTIONS', sortable: false, className: 'text-right' },
];

/**
 * Desktop table. On screens under 700px the parent renders `PatientCardList`
 * instead, so this never needs to scroll horizontally.
 */
export function PatientTable({
  patients,
  sortKey,
  sortDirection,
  onSort,
}: PatientTableProps) {
  return (
    <div className="hidden min-[700px]:block">
      <table className="w-full border-collapse">
        <caption className="dt-sr-only">
          Patient register, sorted by {sortKey} {sortDirection}ending
        </caption>

        <thead>
          <tr className="border-b border-[rgba(43,48,51,0.12)]">
            {COLUMNS.map((column) => {
              const active = column.key === sortKey;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]',
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key as PatientSortKey)}
                      className={cn(
                        'inline-flex items-center gap-1.5 transition-colors hover:text-[#2B3033]',
                        active && 'text-[#0FA3C2]',
                      )}
                    >
                      {column.label}
                      <ArrowUpDown size={10} strokeWidth={2} aria-hidden="true" />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-[rgba(43,48,51,0.07)]">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="group transition-colors hover:bg-[rgba(21,188,223,0.04)]"
            >
              {/* Patient */}
              <td className="px-4 py-3.5">
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="dt-chamfer-xs flex h-9 w-9 shrink-0 items-center justify-center bg-[#1A1C1E] text-[10px] font-bold text-white">
                    {patient.avatarInitials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-bold text-[#2B3033] group-hover:text-[#0FA3C2]">
                      {patient.fullName}
                    </span>
                    <span className="dt-mono mt-0.5 block text-[10px] text-[#6B6F72]">
                      {patient.fileNumber} · {patient.age}Y
                    </span>
                  </span>
                </Link>
              </td>

              {/* Contact */}
              <td className="hidden px-4 py-3.5 lg:table-cell">
                <span className="block truncate text-[11px] text-[#2B3033]">
                  {patient.phone}
                </span>
                <span className="mt-0.5 block max-w-[190px] truncate text-[10px] text-[#6B6F72]">
                  {patient.email}
                </span>
              </td>

              {/* Last visit */}
              <td className="hidden px-4 py-3.5 text-[11px] text-[#6B6F72] md:table-cell">
                {formatDate(patient.lastVisit)}
              </td>

              {/* Next appointment */}
              <td className="hidden px-4 py-3.5 xl:table-cell">
                <span
                  className={cn(
                    'text-[11px]',
                    patient.nextAppointment
                      ? 'font-bold text-[#0FA3C2]'
                      : 'text-[#6B6F72]',
                  )}
                >
                  {formatDate(patient.nextAppointment)}
                </span>
              </td>

              {/* Treatment */}
              <td className="hidden max-w-[180px] px-4 py-3.5 lg:table-cell">
                <span className="block truncate text-[11px] text-[#6B6F72]">
                  {patient.primaryTreatment}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3.5">
                <StatusPill
                  label={patient.status}
                  tone={patientTone(patient.status)}
                  size="xs"
                />
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <a
                    href={`tel:${patient.phone.replace(/\s/g, '')}`}
                    aria-label={`Call ${patient.fullName}`}
                    className="flex h-7 w-7 items-center justify-center border border-transparent text-[#6B6F72] transition-colors hover:border-[rgba(43,48,51,0.16)] hover:text-[#2B3033]"
                  >
                    <Phone size={13} strokeWidth={1.6} />
                  </a>
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    aria-label={`Open ${patient.fullName}'s profile`}
                    className="flex h-7 w-7 items-center justify-center border border-transparent text-[#6B6F72] transition-colors hover:border-[rgba(43,48,51,0.16)] hover:text-[#2B3033]"
                  >
                    <ChevronRight size={14} strokeWidth={2} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   MOBILE CARDS
   ============================================================ */

export function PatientCardList({ patients }: { patients: Patient[] }) {
  return (
    <ul className="divide-y divide-[rgba(43,48,51,0.07)] min-[700px]:hidden">
      {patients.map((patient) => (
        <li key={patient.id}>
          <Link
            href={`/dashboard/patients/${patient.id}`}
            className="block px-4 py-4 transition-colors active:bg-[rgba(21,188,223,0.06)]"
          >
            <div className="flex items-start gap-3">
              <span className="dt-chamfer-xs flex h-10 w-10 shrink-0 items-center justify-center bg-[#1A1C1E] text-[11px] font-bold text-white">
                {patient.avatarInitials}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-[#2B3033]">
                    {patient.fullName}
                  </span>
                  <StatusPill
                    label={patient.status}
                    tone={patientTone(patient.status)}
                    size="xs"
                  />
                </div>

                <div className="dt-mono mt-1 text-[10px] text-[#6B6F72]">
                  {patient.fileNumber} · {patient.age}Y · {patient.phone}
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[rgba(43,48,51,0.07)] pt-2.5">
                  <div>
                    <div className="dt-label text-[8.5px]">LAST VISIT</div>
                    <div className="mt-0.5 text-[11px] text-[#2B3033]">
                      {formatDate(patient.lastVisit)}
                    </div>
                  </div>
                  <div>
                    <div className="dt-label text-[8.5px]">NEXT</div>
                    <div
                      className={cn(
                        'mt-0.5 text-[11px]',
                        patient.nextAppointment
                          ? 'font-bold text-[#0FA3C2]'
                          : 'text-[#6B6F72]',
                      )}
                    >
                      {formatDate(patient.nextAppointment)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
