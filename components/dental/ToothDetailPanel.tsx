'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ToothShape } from './ToothShape';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { SelectInput, TextArea, TextInput } from '@/components/ui/Form';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { TOOTH_CONDITION_STYLE, formatDate } from '@/lib/utils';
import type { Tooth, ToothCondition, ToothStatus } from '@/types';

const CONDITIONS: ToothCondition[] = [
  'HEALTHY',
  'CARIES',
  'FILLED',
  'CROWN',
  'IMPLANT',
  'ROOT CANAL',
  'MISSING',
  'EXTRACTION',
  'FRACTURE',
];

const STATUSES: ToothStatus[] = [
  'STABLE',
  'MONITOR',
  'TREATMENT REQUIRED',
  'IN TREATMENT',
  'TREATED',
];

interface ToothDetailPanelProps {
  tooth: Tooth | null;
  onClose: () => void;
  onSave: (tooth: Tooth) => void;
  readOnly?: boolean;
}

/**
 * Side panel for a selected tooth. Edits are held locally until saved, so
 * closing without saving discards them.
 */
export function ToothDetailPanel({
  tooth,
  onClose,
  onSave,
  readOnly = false,
}: ToothDetailPanelProps) {
  const [draft, setDraft] = useState<Tooth | null>(tooth);

  // Reset the draft whenever a different tooth is selected.
  useEffect(() => {
    setDraft(tooth);
  }, [tooth]);

  useEffect(() => {
    if (!tooth) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tooth, onClose]);

  const dirty =
    draft !== null &&
    tooth !== null &&
    (draft.condition !== tooth.condition ||
      draft.status !== tooth.status ||
      draft.treatment !== tooth.treatment ||
      draft.notes !== tooth.notes);

  return (
    <AnimatePresence>
      {draft && (
        <>
          {/* Scrim on mobile only — desktop keeps the chart visible. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-[#1A1C1E]/35 lg:hidden"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={`Tooth ${draft.number} details`}
            className="dt-scroll fixed right-0 top-0 z-[100] flex h-full w-full max-w-[400px] flex-col overflow-y-auto border-l border-[rgba(43,48,51,0.14)] bg-white"
          >
            {/* Header */}
            <header className="dt-chamfer-tr sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#1A1C1E] px-5 py-5">
              <div className="flex items-center gap-4">
                <span className="flex h-[62px] w-10 items-center justify-center">
                  <ToothShape
                    number={draft.number}
                    condition={draft.condition}
                    size={38}
                  />
                </span>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                    TOOTH NUMBER
                  </div>
                  <div className="dt-mono mt-1 text-[26px] font-bold leading-none text-white">
                    {draft.number}
                  </div>
                  <div className="mt-1.5 text-[11px] text-white/55">
                    {draft.name} · Q{draft.quadrant} · {draft.arch}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close tooth details"
                className="-mr-1 p-2 text-white/55 transition-colors hover:text-white"
              >
                <X size={17} strokeWidth={1.5} />
              </button>
            </header>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-5 p-5">
              {/* Current condition summary */}
              <div
                className="dt-chamfer-xs flex items-center justify-between gap-3 border p-3.5"
                style={{
                  borderColor: TOOTH_CONDITION_STYLE[draft.condition].stroke,
                  background:
                    draft.condition === 'MISSING'
                      ? 'transparent'
                      : `${TOOTH_CONDITION_STYLE[draft.condition].fill}33`,
                }}
              >
                <div>
                  <div className="dt-label text-[9px]">CURRENT CONDITION</div>
                  <div className="mt-1 text-[13px] font-bold uppercase tracking-[0.08em] text-[#1A1C1E]">
                    {draft.condition}
                  </div>
                </div>
                <TechnicalLabel label="UPDATED" value={formatDate(draft.lastUpdated)} />
              </div>

              <SelectInput
                label="CONDITION"
                value={draft.condition}
                disabled={readOnly}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    condition: event.target.value as ToothCondition,
                  })
                }
                options={CONDITIONS.map((condition) => ({
                  value: condition,
                  label: condition,
                }))}
              />

              <TextInput
                label="TREATMENT"
                value={draft.treatment}
                disabled={readOnly}
                placeholder="e.g. Composite restoration (MO)"
                onChange={(event) =>
                  setDraft({ ...draft, treatment: event.target.value })
                }
              />

              <SelectInput
                label="STATUS"
                value={draft.status}
                disabled={readOnly}
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value as ToothStatus })
                }
                options={STATUSES.map((status) => ({ value: status, label: status }))}
              />

              <TextArea
                label="NOTES"
                value={draft.notes}
                rows={5}
                disabled={readOnly}
                placeholder="Clinical observations for this tooth…"
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              />
            </div>

            {/* Footer */}
            {!readOnly && (
              <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[rgba(43,48,51,0.12)] bg-[#F7F6F8] px-5 py-4">
                <ChamferButton variant="secondary" size="sm" onClick={onClose}>
                  CANCEL
                </ChamferButton>
                <ChamferButton
                  size="sm"
                  disabled={!dirty}
                  onClick={() => onSave(draft)}
                >
                  SAVE TOOTH
                </ChamferButton>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
