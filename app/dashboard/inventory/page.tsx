'use client';

import { Package, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { InventoryFormModal } from '@/components/inventory/InventoryFormModal';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import type { InventorySortKey } from '@/components/inventory/InventoryTable';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { SearchInput, SelectInput } from '@/components/ui/Form';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { inventoryInsights } from '@/lib/ai';
import { useStore } from '@/lib/store';
import {
  daysBetween,
  formatCurrency,
  inventoryStatus,
  pageCount,
  paginate,
  sortBy,
  sum,
} from '@/lib/utils';
import type { InventoryItem } from '@/types';

const PER_PAGE = 10;

const CATEGORIES = [
  'ALL',
  'COMPOSITE',
  'ANESTHETIC',
  'GLOVES',
  'MASKS',
  'IMPLANTS',
  'INSTRUMENTS',
  'DISINFECTANTS',
  'CONSUMABLES',
  'OTHER',
];

const STATUSES = [
  'ALL',
  'IN STOCK',
  'LOW STOCK',
  'OUT OF STOCK',
  'EXPIRING',
  'EXPIRED',
];

export default function InventoryPage() {
  const { inventory, today, loading, error, reload } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortKey, setSortKey] = useState<InventorySortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  /* ---------------- metrics ---------------- */

  const metrics = useMemo(() => {
    const lowStock = inventory.filter((i) => i.quantity <= i.minimumQuantity);
    const expiring = inventory.filter((i) => {
      if (!i.expirationDate) return false;
      const days = daysBetween(today, i.expirationDate);
      return days >= 0 && days <= 30;
    });

    return {
      total: inventory.length,
      lowStock: lowStock.length,
      expiring: expiring.length,
      value: sum(inventory.map((i) => i.quantity * i.unitPrice)),
    };
  }, [inventory, today]);

  const insights = useMemo(
    () => inventoryInsights(inventory, today),
    [inventory, today],
  );

  /* ---------------- filtering ---------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return inventory.filter((item) => {
      if (category !== 'ALL' && item.category !== category) return false;
      if (status !== 'ALL' && inventoryStatus(item, today) !== status) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q)
      );
    });
  }, [inventory, query, category, status, today]);

  const sorted = useMemo(
    () =>
      sortBy(
        filtered,
        (item) => {
          switch (sortKey) {
            case 'category':
              return item.category;
            case 'quantity':
              return item.quantity;
            case 'expirationDate':
              return item.expirationDate;
            case 'supplierName':
              return item.supplierName;
            default:
              return item.name;
          }
        },
        sortDirection,
      ),
    [filtered, sortKey, sortDirection],
  );

  const totalPages = pageCount(sorted.length, PER_PAGE);
  const safePage = Math.min(page, totalPages);
  const visible = paginate(sorted, safePage, PER_PAGE);

  const onSort = (key: InventorySortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(1);
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="table" rows={8} label="Loading inventory" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            INVENTORY
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            {metrics.total} products tracked · {metrics.lowStock} below minimum
          </p>
        </div>

        <ChamferButton
          size="sm"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          ADD PRODUCT
        </ChamferButton>
      </div>

      {/* ---------------- metrics ---------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="TOTAL PRODUCTS"
          value={String(metrics.total)}
          icon={Package}
          index={0}
        />
        <StatCard
          label="LOW STOCK"
          value={String(metrics.lowStock)}
          caption="at or below minimum"
          highlight={metrics.lowStock > 0}
          index={1}
        />
        <StatCard
          label="EXPIRING"
          value={String(metrics.expiring)}
          caption="within 30 days"
          index={2}
        />
        <StatCard
          label="INVENTORY VALUE"
          value={formatCurrency(metrics.value)}
          caption="at current cost"
          index={3}
        />
      </div>

      {/* ---------------- AI insights ---------------- */}
      <AIInsightPanel
        insights={insights}
        title="AI INVENTORY INSIGHT"
        href="/dashboard/ai"
        hrefLabel="ASK DENTRA AI"
      />

      {/* ---------------- filters ---------------- */}
      <div className="flex flex-wrap items-center gap-3 border border-[rgba(43,48,51,0.12)] bg-white p-3.5">
        <SearchInput
          label="Search inventory"
          placeholder="Search by product, SKU, supplier or batch"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          containerClassName="min-w-[220px] flex-1"
        />

        <SelectInput
          label=""
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: c === 'ALL' ? 'ALL CATEGORIES' : c,
          }))}
          className="w-auto min-w-[160px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />

        <SelectInput
          label=""
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUSES.map((s) => ({
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
            title="NO PRODUCTS FOUND"
            description={
              query || category !== 'ALL' || status !== 'ALL'
                ? 'No products match the current filters.'
                : 'Your inventory is empty. Add the first product to start tracking stock.'
            }
            icon={Package}
            actionLabel="ADD PRODUCT"
            onAction={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <>
            <InventoryTable
              items={visible}
              today={today}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={onSort}
              onEdit={(item) => {
                setEditing(item);
                setModalOpen(true);
              }}
            />

            <Pagination
              page={safePage}
              pageCount={totalPages}
              onChange={setPage}
              total={sorted.length}
              perPage={PER_PAGE}
              label="products"
            />
          </>
        )}
      </div>

      <InventoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editing}
        onSaved={(item, created) =>
          toast({
            title: created ? 'PRODUCT ADDED' : 'INVENTORY UPDATED',
            description: `${item.name} · ${item.quantity} ${item.unit} in stock.`,
          })
        }
      />
    </div>
  );
}
