'use client';

import { Plus, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { SearchInput, SelectInput, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { clinic } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import {
  addDays,
  cn,
  createId,
  daysBetween,
  formatCurrency,
  formatDate,
  invoiceTone,
  pageCount,
  paginate,
  sum,
} from '@/lib/utils';
import type { Invoice, InvoiceLine, PaymentMethod } from '@/types';

const PER_PAGE = 10;

const METHODS: PaymentMethod[] = ['CARD', 'CASH', 'TRANSFER', 'INSURANCE'];

export default function BillingPage() {
  const {
    invoices,
    patients,
    treatments,
    today,
    loading,
    error,
    reload,
    addInvoice,
    markInvoicePaid,
  } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);

  /* ---------------- create form ---------------- */

  const [form, setForm] = useState({
    patientId: '',
    treatmentId: '',
    description: '',
    quantity: '1',
    unitPrice: '',
    dueDate: addDays(today, 30),
  });

  /* ---------------- metrics ---------------- */

  const metrics = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'PAID');
    const pending = invoices.filter((i) => i.status === 'PENDING');
    const overdue = invoices.filter((i) => i.status === 'OVERDUE');

    return {
      total: sum(invoices.map((i) => i.amount)),
      paid: sum(paid.map((i) => i.amount)),
      pending: sum(pending.map((i) => i.amount)),
      overdue: sum(overdue.map((i) => i.amount)),
      overdueCount: overdue.length,
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== 'ALL' && invoice.status !== status) return false;
      if (!q) return true;
      return (
        invoice.number.includes(q) ||
        invoice.patientName.toLowerCase().includes(q) ||
        invoice.treatment.toLowerCase().includes(q)
      );
    });
  }, [invoices, query, status]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.issuedDate.localeCompare(a.issuedDate)),
    [filtered],
  );

  const totalPages = pageCount(sorted.length, PER_PAGE);
  const safePage = Math.min(page, totalPages);
  const visible = paginate(sorted, safePage, PER_PAGE);

  /* ---------------- actions ---------------- */

  const onCreate = (event: React.FormEvent) => {
    event.preventDefault();

    const patient = patients.find((p) => p.id === form.patientId) ?? patients[0];
    if (!patient || !form.description.trim()) return;

    const quantity = Math.max(1, Number(form.quantity) || 1);
    const unitPrice = Number(form.unitPrice) || 0;

    const lines: InvoiceLine[] = [
      {
        id: createId('line'),
        label: form.description.trim(),
        quantity,
        unitPrice,
      },
    ];

    const treatment = treatments.find((t) => t.id === form.treatmentId);
    const nextNumber = String(
      Math.max(...invoices.map((i) => Number(i.number) || 1000)) + 1,
    );

    const invoice: Invoice = {
      id: createId('inv_doc'),
      clinicId: clinic.id,
      number: nextNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      treatmentId: treatment?.id ?? null,
      treatment: treatment?.type ?? form.description.trim(),
      lines,
      amount: quantity * unitPrice,
      taxRate: 0,
      issuedDate: today,
      dueDate: form.dueDate,
      status: 'PENDING',
      paymentMethod: 'UNPAID',
    };

    addInvoice(invoice);
    setCreateOpen(false);
    setForm((current) => ({ ...current, description: '', unitPrice: '' }));
    toast({
      title: 'INVOICE GENERATED',
      description: `Invoice #${invoice.number} for ${formatCurrency(invoice.amount)}.`,
    });
  };

  const onMarkPaid = (invoice: Invoice, method: PaymentMethod) => {
    markInvoicePaid(invoice.id, method);
    setDetail(null);
    toast({
      title: 'PAYMENT RECORDED',
      description: `Invoice #${invoice.number} settled by ${method.toLowerCase()}.`,
    });
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="table" rows={8} label="Loading billing" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            BILLING
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            {invoices.length} invoices · {metrics.overdueCount} overdue
          </p>
        </div>

        <ChamferButton
          size="sm"
          onClick={() => {
            setForm((current) => ({
              ...current,
              patientId: current.patientId || patients[0]?.id || '',
            }));
            setCreateOpen(true);
          }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          CREATE INVOICE
        </ChamferButton>
      </div>

      {/* ---------------- metrics ---------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="TOTAL REVENUE"
          value={formatCurrency(metrics.total)}
          icon={Receipt}
          caption="invoiced to date"
          highlight
          index={0}
        />
        <StatCard label="PAID" value={formatCurrency(metrics.paid)} index={1} />
        <StatCard label="PENDING" value={formatCurrency(metrics.pending)} index={2} />
        <StatCard
          label="OVERDUE"
          value={formatCurrency(metrics.overdue)}
          caption={`${metrics.overdueCount} invoices`}
          index={3}
        />
      </div>

      {/* ---------------- filters ---------------- */}
      <div className="flex flex-wrap items-center gap-3 border border-[rgba(43,48,51,0.12)] bg-white p-3.5">
        <SearchInput
          label="Search invoices"
          placeholder="Search by invoice number, patient or treatment"
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
          options={['ALL', 'PAID', 'PENDING', 'OVERDUE'].map((s) => ({
            value: s,
            label: s === 'ALL' ? 'ALL STATUSES' : s,
          }))}
          className="w-auto min-w-[150px] text-[11px] font-bold uppercase tracking-[0.08em]"
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
            title="NO INVOICES"
            description={
              query || status !== 'ALL'
                ? 'No invoices match the current filters.'
                : 'Nothing has been billed yet.'
            }
            icon={Receipt}
            actionLabel="CREATE INVOICE"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden min-[700px]:block">
              <table className="w-full border-collapse">
                <caption className="dt-sr-only">Invoice register</caption>
                <thead>
                  <tr className="border-b border-[rgba(43,48,51,0.12)]">
                    {[
                      'INVOICE',
                      'PATIENT',
                      'TREATMENT',
                      'AMOUNT',
                      'DATE',
                      'STATUS',
                      'PAYMENT',
                    ].map((label, i) => (
                      <th
                        key={label}
                        scope="col"
                        className={cn(
                          'px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]',
                          i === 2 && 'hidden lg:table-cell',
                          i === 4 && 'hidden xl:table-cell',
                        )}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[rgba(43,48,51,0.07)]">
                  {visible.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-[rgba(21,188,223,0.04)]"
                    >
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setDetail(invoice)}
                          className="dt-mono text-[12px] font-bold text-[#1A1C1E] hover:text-[#0FA3C2]"
                        >
                          #{invoice.number}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <Link
                          href={`/dashboard/patients/${invoice.patientId}`}
                          className="text-[12px] font-bold text-[#2B3033] hover:text-[#0FA3C2]"
                        >
                          {invoice.patientName}
                        </Link>
                      </td>

                      <td className="hidden max-w-[220px] px-4 py-3.5 lg:table-cell">
                        <span className="block truncate text-[11px] text-[#6B6F72]">
                          {invoice.treatment}
                        </span>
                      </td>

                      <td className="dt-mono px-4 py-3.5 text-[13px] font-bold text-[#1A1C1E]">
                        {formatCurrency(invoice.amount)}
                      </td>

                      <td className="hidden px-4 py-3.5 xl:table-cell">
                        <span className="dt-mono block text-[11px] text-[#6B6F72]">
                          {formatDate(invoice.issuedDate)}
                        </span>
                        {invoice.status === 'OVERDUE' && (
                          <span className="dt-mono mt-0.5 block text-[9.5px] font-bold text-[#B03A34]">
                            {daysBetween(invoice.dueDate, today)}D LATE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusPill
                          label={invoice.status}
                          tone={invoiceTone(invoice.status)}
                          size="xs"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        {invoice.status === 'PAID' ? (
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
                            {invoice.paymentMethod}
                          </span>
                        ) : (
                          <ChamferButton
                            size="xs"
                            variant="secondary"
                            onClick={() => setDetail(invoice)}
                          >
                            RECORD
                          </ChamferButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-[rgba(43,48,51,0.07)] min-[700px]:hidden">
              {visible.map((invoice) => (
                <li key={invoice.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="dt-mono block text-[12px] font-bold text-[#1A1C1E]">
                        #{invoice.number}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] font-bold text-[#2B3033]">
                        {invoice.patientName}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#6B6F72]">
                        {invoice.treatment}
                      </span>
                    </div>
                    <StatusPill
                      label={invoice.status}
                      tone={invoiceTone(invoice.status)}
                      size="xs"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-[rgba(43,48,51,0.07)] pt-3">
                    <span className="dt-mono text-[15px] font-bold text-[#1A1C1E]">
                      {formatCurrency(invoice.amount)}
                    </span>
                    <ChamferButton
                      size="xs"
                      variant="secondary"
                      onClick={() => setDetail(invoice)}
                    >
                      VIEW
                    </ChamferButton>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={safePage}
              pageCount={totalPages}
              onChange={setPage}
              total={sorted.length}
              perPage={PER_PAGE}
              label="invoices"
            />
          </>
        )}
      </div>

      {/* ---------------- create modal ---------------- */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="CREATE INVOICE"
        eyebrow="BILLING"
        size="md"
        footer={
          <>
            <ChamferButton
              variant="secondary"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              CANCEL
            </ChamferButton>
            <ChamferButton size="sm" type="submit" form="invoice-form">
              GENERATE INVOICE
            </ChamferButton>
          </>
        }
      >
        <form id="invoice-form" onSubmit={onCreate} className="space-y-4">
          <SelectInput
            label="PATIENT"
            value={form.patientId}
            onChange={(event) =>
              setForm({ ...form, patientId: event.target.value, treatmentId: '' })
            }
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.fullName} · ${p.fileNumber}`,
            }))}
          />

          <SelectInput
            label="LINK TO TREATMENT"
            value={form.treatmentId}
            onChange={(event) =>
              setForm({ ...form, treatmentId: event.target.value })
            }
            options={[
              { value: '', label: 'NONE' },
              ...treatments
                .filter((t) => t.patientId === form.patientId)
                .map((t) => ({ value: t.id, label: t.type })),
            ]}
          />

          <TextInput
            label="DESCRIPTION"
            required
            placeholder="e.g. Crown preparation"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="QUANTITY"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            />
            <TextInput
              label="UNIT PRICE (€)"
              type="number"
              min={0}
              step={0.01}
              required
              value={form.unitPrice}
              onChange={(event) =>
                setForm({ ...form, unitPrice: event.target.value })
              }
            />
            <TextInput
              label="DUE DATE"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
            <span className="dt-label text-[9px]">TOTAL</span>
            <span className="dt-mono text-[17px] font-bold text-[#1A1C1E]">
              {formatCurrency(
                (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0),
              )}
            </span>
          </div>
        </form>
      </Modal>

      {/* ---------------- detail modal ---------------- */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={`INVOICE #${detail?.number ?? ''}`}
        eyebrow={detail?.patientName ?? ''}
        size="md"
      >
        {detail && (
          <div className="space-y-5">
            {/* Lines */}
            <table className="w-full border-collapse">
              <caption className="dt-sr-only">Invoice lines</caption>
              <thead>
                <tr className="border-b border-[rgba(43,48,51,0.12)]">
                  {['DESCRIPTION', 'QTY', 'UNIT', 'TOTAL'].map((label, i) => (
                    <th
                      key={label}
                      scope="col"
                      className={cn(
                        'py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]',
                        i === 0 ? 'text-left' : 'text-right',
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(43,48,51,0.07)]">
                {detail.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-3 text-[12px] text-[#2B3033]">{line.label}</td>
                    <td className="dt-mono py-3 text-right text-[12px] text-[#6B6F72]">
                      {line.quantity}
                    </td>
                    <td className="dt-mono py-3 text-right text-[12px] text-[#6B6F72]">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="dt-mono py-3 text-right text-[12px] font-bold text-[#1A1C1E]">
                      {formatCurrency(line.quantity * line.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[rgba(43,48,51,0.12)]">
                  <td colSpan={3} className="py-3.5 text-right">
                    <span className="dt-label text-[9px]">TOTAL DUE</span>
                  </td>
                  <td className="dt-mono py-3.5 text-right text-[17px] font-bold text-[#1A1C1E]">
                    {formatCurrency(detail.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Meta */}
            <dl className="grid grid-cols-2 gap-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
              {[
                { label: 'ISSUED', value: formatDate(detail.issuedDate) },
                { label: 'DUE', value: formatDate(detail.dueDate) },
                { label: 'STATUS', value: detail.status },
                { label: 'METHOD', value: detail.paymentMethod },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="dt-label text-[9px]">{row.label}</dt>
                  <dd className="mt-1 text-[12px] font-bold text-[#2B3033]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            {detail.status !== 'PAID' && (
              <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
                <span className="dt-field-label">RECORD PAYMENT</span>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => onMarkPaid(detail, method)}
                      className="dt-chamfer-xs border border-[rgba(43,48,51,0.16)] bg-white px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2B3033] transition-colors hover:border-[#15BCDF] hover:bg-[rgba(21,188,223,0.08)]"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
