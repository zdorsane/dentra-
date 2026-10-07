'use client';

import { ArrowUpDown, Pencil } from 'lucide-react';

import { StatusPill } from '@/components/ui/StatusPill';
import {
  cn,
  daysBetween,
  daysUntilMinimum,
  formatCurrency,
  formatDate,
  inventoryStatus,
  inventoryTone,
} from '@/lib/utils';
import type { InventoryItem } from '@/types';

export type InventorySortKey =
  | 'name'
  | 'category'
  | 'quantity'
  | 'expirationDate'
  | 'supplierName';

interface InventoryTableProps {
  items: InventoryItem[];
  today: string;
  sortKey: InventorySortKey;
  sortDirection: 'asc' | 'desc';
  onSort: (key: InventorySortKey) => void;
  onEdit: (item: InventoryItem) => void;
}

const COLUMNS: {
  key: InventorySortKey | 'minimum' | 'status' | 'actions';
  label: string;
  sortable: boolean;
  className?: string;
}[] = [
  { key: 'name', label: 'PRODUCT', sortable: true },
  { key: 'category', label: 'CATEGORY', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'quantity', label: 'QUANTITY', sortable: true },
  { key: 'minimum', label: 'MINIMUM', sortable: false, className: 'hidden md:table-cell' },
  {
    key: 'expirationDate',
    label: 'EXPIRATION',
    sortable: true,
    className: 'hidden xl:table-cell',
  },
  {
    key: 'supplierName',
    label: 'SUPPLIER',
    sortable: true,
    className: 'hidden xl:table-cell',
  },
  { key: 'status', label: 'STATUS', sortable: false },
  { key: 'actions', label: '', sortable: false, className: 'text-right' },
];

export function InventoryTable({
  items,
  today,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
}: InventoryTableProps) {
  return (
    <>
      {/* ---------------- desktop table ---------------- */}
      <div className="hidden min-[700px]:block">
        <table className="w-full border-collapse">
          <caption className="dt-sr-only">Inventory, sorted by {sortKey}</caption>

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
                        onClick={() => onSort(column.key as InventorySortKey)}
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
            {items.map((item) => {
              const status = inventoryStatus(item, today);
              const forecast = daysUntilMinimum(item);
              const low = item.quantity <= item.minimumQuantity;

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[rgba(21,188,223,0.04)]"
                >
                  <td className="max-w-[260px] px-4 py-3.5">
                    <span className="block truncate text-[12px] font-bold text-[#2B3033]">
                      {item.name}
                    </span>
                    <span className="dt-mono mt-0.5 block text-[10px] text-[#6B6F72]">
                      {item.sku} · {item.location}
                    </span>
                  </td>

                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'dt-mono text-[13px] font-bold',
                        low ? 'text-[#B03A34]' : 'text-[#1A1C1E]',
                      )}
                    >
                      {item.quantity}
                    </span>
                    <span className="ml-1.5 text-[10px] text-[#6B6F72]">
                      {item.unit}
                    </span>
                    {forecast !== null && forecast <= 21 && forecast > 0 && (
                      <span className="dt-mono mt-0.5 block text-[9.5px] font-bold text-[#C4841A]">
                        ~{forecast}D TO MINIMUM
                      </span>
                    )}
                  </td>

                  <td className="dt-mono hidden px-4 py-3.5 text-[12px] text-[#6B6F72] md:table-cell">
                    {item.minimumQuantity}
                  </td>

                  <td className="hidden px-4 py-3.5 xl:table-cell">
                    {item.expirationDate ? (
                      <>
                        <span className="dt-mono block text-[11px] text-[#2B3033]">
                          {formatDate(item.expirationDate)}
                        </span>
                        <span
                          className={cn(
                            'dt-mono mt-0.5 block text-[9.5px] font-bold',
                            daysBetween(today, item.expirationDate) <= 30
                              ? 'text-[#C4841A]'
                              : 'text-[#6B6F72]',
                          )}
                        >
                          {daysBetween(today, item.expirationDate)}D
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#6B6F72]">—</span>
                    )}
                  </td>

                  <td className="hidden max-w-[150px] px-4 py-3.5 xl:table-cell">
                    <span className="block truncate text-[11px] text-[#6B6F72]">
                      {item.supplierName}
                    </span>
                    <span className="dt-mono mt-0.5 block text-[10px] text-[#9AA0A4]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusPill label={status} tone={inventoryTone(status)} size="xs" />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center border border-transparent text-[#6B6F72] transition-colors hover:border-[rgba(43,48,51,0.16)] hover:text-[#2B3033]"
                    >
                      <Pencil size={13} strokeWidth={1.6} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- mobile cards ---------------- */}
      <ul className="divide-y divide-[rgba(43,48,51,0.07)] min-[700px]:hidden">
        {items.map((item) => {
          const status = inventoryStatus(item, today);
          const low = item.quantity <= item.minimumQuantity;

          return (
            <li key={item.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block truncate text-[13px] font-bold text-[#2B3033]">
                    {item.name}
                  </span>
                  <span className="dt-mono mt-0.5 block text-[10px] text-[#6B6F72]">
                    {item.sku} · {item.category}
                  </span>
                </div>
                <StatusPill label={status} tone={inventoryTone(status)} size="xs" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[rgba(43,48,51,0.07)] pt-3">
                <div>
                  <div className="dt-label text-[8.5px]">QUANTITY</div>
                  <div
                    className={cn(
                      'dt-mono mt-0.5 text-[13px] font-bold',
                      low ? 'text-[#B03A34]' : 'text-[#1A1C1E]',
                    )}
                  >
                    {item.quantity}
                  </div>
                </div>
                <div>
                  <div className="dt-label text-[8.5px]">MINIMUM</div>
                  <div className="dt-mono mt-0.5 text-[13px] text-[#6B6F72]">
                    {item.minimumQuantity}
                  </div>
                </div>
                <div>
                  <div className="dt-label text-[8.5px]">EXPIRES</div>
                  <div className="dt-mono mt-0.5 text-[11px] text-[#6B6F72]">
                    {item.expirationDate ? formatDate(item.expirationDate) : '—'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="dt-chamfer-xs mt-3 w-full border border-[rgba(43,48,51,0.16)] py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B3033]"
              >
                EDIT PRODUCT
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
