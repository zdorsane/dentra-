'use client';

import { Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { PatientCardList, PatientTable } from '@/components/patients/PatientTable';
import type { PatientSortKey } from '@/components/patients/PatientTable';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { SearchInput, SelectInput } from '@/components/ui/Form';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/lib/store';
import { pageCount, paginate, sortBy } from '@/lib/utils';
import type { PatientStatus } from '@/types';

const PER_PAGE = 10;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'ALL STATUSES' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'NEW', label: 'NEW' },
  { value: 'IN TREATMENT', label: 'IN TREATMENT' },
  { value: 'FOLLOW-UP', label: 'FOLLOW-UP' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

export default function PatientsPage() {
  const { patients, staff, loading, error, reload } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [dentist, setDentist] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<PatientSortKey>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const dentists = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  /* ---------------- filtering ---------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return patients.filter((patient) => {
      if (status !== 'ALL' && patient.status !== (status as PatientStatus)) {
        return false;
      }
      if (dentist !== 'ALL' && patient.assignedDentistId !== dentist) {
        return false;
      }
      if (!q) return true;

      return (
        patient.fullName.toLowerCase().includes(q) ||
        patient.fileNumber.toLowerCase().includes(q) ||
        patient.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        patient.email.toLowerCase().includes(q) ||
        patient.primaryTreatment.toLowerCase().includes(q)
      );
    });
  }, [patients, query, status, dentist]);

  const sorted = useMemo(
    () =>
      sortBy(
        filtered,
        (patient) => {
          switch (sortKey) {
            case 'lastVisit':
              return patient.lastVisit;
            case 'nextAppointment':
              return patient.nextAppointment;
            case 'primaryTreatment':
              return patient.primaryTreatment;
            case 'status':
              return patient.status;
            default:
              return patient.fullName;
          }
        },
        sortDirection,
      ),
    [filtered, sortKey, sortDirection],
  );

  const totalPages = pageCount(sorted.length, PER_PAGE);
  const safePage = Math.min(page, totalPages);
  const visible = paginate(sorted, safePage, PER_PAGE);

  const onSort = (key: PatientSortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('ALL');
    setDentist('ALL');
    setPage(1);
  };

  /* ---------------- states ---------------- */

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="table" rows={8} label="Loading patients" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            PATIENT REGISTRY
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            {patients.length} records loaded · {filtered.length} matching your filters
          </p>
        </div>

        <ChamferButton size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          ADD PATIENT
        </ChamferButton>
      </div>

      {/* ---------------- filters ---------------- */}
      <div className="flex flex-wrap items-center gap-3 border border-[rgba(43,48,51,0.12)] bg-white p-3.5">
        <SearchInput
          label="Search patients"
          placeholder="Search by name, file number, phone or treatment"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          containerClassName="min-w-[220px] flex-1"
        />

        <SelectInput
          label=""
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          className="w-auto min-w-[150px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />

        <SelectInput
          label=""
          value={dentist}
          onChange={(event) => {
            setDentist(event.target.value);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'ALL DENTISTS' },
            ...dentists.map((d) => ({ value: d.id, label: d.fullName })),
          ]}
          className="w-auto min-w-[160px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />

        <TechnicalLabel
          label="RESULTS"
          value={String(filtered.length)}
          className="ml-auto hidden sm:inline-flex"
        />
      </div>

      {/* ---------------- table ---------------- */}
      <div className="border border-[rgba(43,48,51,0.12)] bg-white">
        {visible.length === 0 ? (
          <EmptyState
            title="NO PATIENTS FOUND"
            description={
              query || status !== 'ALL' || dentist !== 'ALL'
                ? 'No records match the current filters. Try widening your search.'
                : 'Your patient registry is empty. Add the first record to get started.'
            }
            icon={Users}
            actionLabel={
              query || status !== 'ALL' || dentist !== 'ALL'
                ? 'CLEAR FILTERS'
                : 'ADD PATIENT'
            }
            onAction={
              query || status !== 'ALL' || dentist !== 'ALL'
                ? resetFilters
                : () => setModalOpen(true)
            }
          />
        ) : (
          <>
            <PatientTable
              patients={visible}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <PatientCardList patients={visible} />

            <Pagination
              page={safePage}
              pageCount={totalPages}
              onChange={setPage}
              total={sorted.length}
              perPage={PER_PAGE}
              label="patients"
            />
          </>
        )}
      </div>

      <PatientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(patient) =>
          toast({
            title: 'PATIENT CREATED',
            description: `${patient.fullName} has been added to the registry.`,
          })
        }
      />
    </div>
  );
}
