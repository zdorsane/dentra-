'use client';

import { useEffect, useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { Modal } from '@/components/ui/Modal';
import { SelectInput, TextInput } from '@/components/ui/Form';
import { clinic, suppliers } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { createId } from '@/lib/utils';
import type { InventoryCategory, InventoryItem } from '@/types';

const CATEGORIES: InventoryCategory[] = [
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

const UNITS = [
  'unit',
  'box of 100',
  'box of 50',
  'box of 20',
  'bag of 100',
  'syringe',
  'cartridge',
  'bottle',
  'pack of 10',
  'set',
];

interface InventoryFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When present the modal edits this item rather than creating one. */
  item: InventoryItem | null;
  onSaved: (item: InventoryItem, created: boolean) => void;
}

interface FormState {
  name: string;
  sku: string;
  category: InventoryCategory;
  quantity: string;
  minimumQuantity: string;
  unit: string;
  unitPrice: string;
  supplierId: string;
  expirationDate: string;
  batchNumber: string;
  dailyUsage: string;
  location: string;
}

const EMPTY: FormState = {
  name: '',
  sku: '',
  category: 'CONSUMABLES',
  quantity: '0',
  minimumQuantity: '0',
  unit: 'unit',
  unitPrice: '0',
  supplierId: suppliers[0]?.id ?? '',
  expirationDate: '',
  batchNumber: '',
  dailyUsage: '0',
  location: 'Storeroom — bay 1',
};

export function InventoryFormModal({
  open,
  onClose,
  item,
  onSaved,
}: InventoryFormModalProps) {
  const { addInventoryItem, updateInventoryItem, today } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const editing = item !== null;

  // Load the selected item into the form whenever the modal opens.
  useEffect(() => {
    if (!open) return;

    if (item) {
      setForm({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: String(item.quantity),
        minimumQuantity: String(item.minimumQuantity),
        unit: item.unit,
        unitPrice: String(item.unitPrice),
        supplierId: item.supplierId,
        expirationDate: item.expirationDate ?? '',
        batchNumber: item.batchNumber,
        dailyUsage: String(item.dailyUsage),
        location: item.location,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [open, item]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) next.name = 'Required';
    if (!form.sku.trim()) next.sku = 'Required';
    if (Number(form.quantity) < 0 || Number.isNaN(Number(form.quantity))) {
      next.quantity = 'Must be zero or more';
    }
    if (Number(form.minimumQuantity) < 0) next.minimumQuantity = 'Must be zero or more';
    if (Number(form.unitPrice) < 0) next.unitPrice = 'Must be zero or more';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const supplier = suppliers.find((s) => s.id === form.supplierId);

    const next: InventoryItem = {
      id: item?.id ?? createId('inv'),
      clinicId: clinic.id,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      quantity: Number(form.quantity),
      minimumQuantity: Number(form.minimumQuantity),
      unit: form.unit,
      unitPrice: Number(form.unitPrice),
      supplierId: form.supplierId,
      supplierName: supplier?.name ?? 'Unknown supplier',
      expirationDate: form.expirationDate || null,
      batchNumber: form.batchNumber.trim(),
      dailyUsage: Number(form.dailyUsage),
      lastRestocked: item?.lastRestocked ?? today,
      location: form.location,
    };

    if (editing) updateInventoryItem(next);
    else addInventoryItem(next);

    onSaved(next, !editing);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
      eyebrow="INVENTORY"
      size="lg"
      footer={
        <>
          <ChamferButton variant="secondary" size="sm" onClick={onClose}>
            CANCEL
          </ChamferButton>
          <ChamferButton size="sm" type="submit" form="inventory-form">
            {editing ? 'SAVE CHANGES' : 'ADD PRODUCT'}
          </ChamferButton>
        </>
      }
    >
      <form id="inventory-form" onSubmit={onSubmit} noValidate className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="dt-label mb-3 text-[9px]">PRODUCT</legend>

          <TextInput
            label="PRODUCT NAME"
            required
            placeholder="e.g. Composite resin A2 — universal"
            value={form.name}
            error={errors.name}
            onChange={(event) => set('name', event.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="SKU"
              required
              placeholder="CMP-A2-004"
              value={form.sku}
              error={errors.sku}
              onChange={(event) => set('sku', event.target.value)}
            />
            <SelectInput
              label="CATEGORY"
              value={form.category}
              onChange={(event) =>
                set('category', event.target.value as InventoryCategory)
              }
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[rgba(43,48,51,0.1)] pt-5">
          <legend className="dt-label mb-3 text-[9px]">STOCK</legend>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="QUANTITY"
              type="number"
              min={0}
              required
              value={form.quantity}
              error={errors.quantity}
              onChange={(event) => set('quantity', event.target.value)}
            />
            <TextInput
              label="MINIMUM QUANTITY"
              type="number"
              min={0}
              required
              value={form.minimumQuantity}
              error={errors.minimumQuantity}
              onChange={(event) => set('minimumQuantity', event.target.value)}
            />
            <SelectInput
              label="UNIT"
              value={form.unit}
              onChange={(event) => set('unit', event.target.value)}
              options={UNITS.map((u) => ({ value: u, label: u.toUpperCase() }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="UNIT PRICE (€)"
              type="number"
              min={0}
              step={0.01}
              value={form.unitPrice}
              error={errors.unitPrice}
              onChange={(event) => set('unitPrice', event.target.value)}
            />
            <TextInput
              label="AVERAGE DAILY USAGE"
              type="number"
              min={0}
              step={0.01}
              hint="Drives the AI depletion forecast."
              value={form.dailyUsage}
              onChange={(event) => set('dailyUsage', event.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[rgba(43,48,51,0.1)] pt-5">
          <legend className="dt-label mb-3 text-[9px]">TRACEABILITY</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="SUPPLIER"
              value={form.supplierId}
              onChange={(event) => set('supplierId', event.target.value)}
              options={suppliers.map((s) => ({
                value: s.id,
                label: `${s.name} · ${s.leadTimeDays}D LEAD`,
              }))}
            />
            <TextInput
              label="BATCH NUMBER"
              placeholder="B-26-0001"
              value={form.batchNumber}
              onChange={(event) => set('batchNumber', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="EXPIRATION DATE"
              type="date"
              hint="Leave blank for items that do not expire."
              value={form.expirationDate}
              onChange={(event) => set('expirationDate', event.target.value)}
            />
            <TextInput
              label="STORAGE LOCATION"
              value={form.location}
              onChange={(event) => set('location', event.target.value)}
            />
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">STOCK VALUE</span>
          <span className="dt-mono text-[15px] font-bold text-[#1A1C1E]">
            €
            {(Number(form.quantity) * Number(form.unitPrice) || 0).toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}
          </span>
        </div>
      </form>
    </Modal>
  );
}
