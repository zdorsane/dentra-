'use client';

import { Search } from 'lucide-react';
import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

/* ============================================================
   FIELD WRAPPER
   ============================================================ */

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  tone?: 'light' | 'dark';
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
  error,
  required,
  className,
  tone = 'light',
}: FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={htmlFor}
        className={cn('dt-field-label', tone === 'dark' && 'text-white/50')}
      >
        {label}
        {required && (
          <span className="ml-1 text-[#15BCDF]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p
          className={cn(
            'mt-1.5 text-[11px] leading-[1.5]',
            tone === 'dark' ? 'text-white/40' : 'text-[#6B6F72]',
          )}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#B03A34]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   INPUT
   ============================================================ */

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  tone?: 'light' | 'dark';
  containerClassName?: string;
}

export function TextInput({
  label,
  hint,
  error,
  tone = 'light',
  className,
  containerClassName,
  id,
  required,
  ...rest
}: TextInputProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  const input = (
    <input
      id={fieldId}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      className={cn(
        'dt-input',
        tone === 'dark' && 'dt-input-dark',
        error && 'border-[#B03A34]',
        className,
      )}
      {...rest}
    />
  );

  if (!label) return input;

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      tone={tone}
      className={containerClassName}
    >
      {input}
    </Field>
  );
}

/* ============================================================
   SELECT
   ============================================================ */

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  tone?: 'light' | 'dark';
  containerClassName?: string;
}

export function SelectInput({
  label,
  hint,
  error,
  options,
  tone = 'light',
  className,
  containerClassName,
  id,
  required,
  ...rest
}: SelectInputProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  const select = (
    <select
      id={fieldId}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      className={cn(
        'dt-select',
        tone === 'dark' && 'dt-input-dark',
        error && 'border-[#B03A34]',
        className,
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      tone={tone}
      className={containerClassName}
    >
      {select}
    </Field>
  );
}

/* ============================================================
   TEXTAREA
   ============================================================ */

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  tone?: 'light' | 'dark';
  containerClassName?: string;
}

export function TextArea({
  label,
  hint,
  error,
  tone = 'light',
  className,
  containerClassName,
  id,
  required,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  const textarea = (
    <textarea
      id={fieldId}
      rows={rows}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      className={cn(
        'dt-textarea resize-y',
        tone === 'dark' && 'dt-input-dark',
        error && 'border-[#B03A34]',
        className,
      )}
      {...rest}
    />
  );

  if (!label) return textarea;

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      tone={tone}
      className={containerClassName}
    >
      {textarea}
    </Field>
  );
}

/* ============================================================
   SEARCH
   ============================================================ */

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

export function SearchInput({
  label,
  containerClassName,
  className,
  id,
  ...rest
}: SearchInputProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className={cn('relative', containerClassName)}>
      <label htmlFor={fieldId} className="dt-sr-only">
        {label}
      </label>
      <Search
        size={14}
        strokeWidth={1.6}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6F72]"
      />
      <input
        id={fieldId}
        type="search"
        className={cn('dt-input !pl-9', className)}
        {...rest}
      />
    </div>
  );
}

/* ============================================================
   CHECKBOX
   ============================================================ */

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  tone?: 'light' | 'dark';
}

export function Checkbox({ label, tone = 'light', className, id, ...rest }: CheckboxProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2.5 text-[12px] leading-none',
        tone === 'dark' ? 'text-white/70' : 'text-[#6B6F72]',
        className,
      )}
    >
      <input
        id={fieldId}
        type="checkbox"
        className={cn(
          'h-[15px] w-[15px] shrink-0 cursor-pointer appearance-none border transition-colors',
          'checked:border-[#0FA3C2] checked:bg-[#15BCDF]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15BCDF]',
          tone === 'dark'
            ? 'border-white/25 bg-white/5'
            : 'border-[rgba(43,48,51,0.28)] bg-white',
          // Checkmark drawn with a background image so no extra element is needed.
          'bg-[length:10px_10px] bg-center bg-no-repeat',
          'checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2%206.3L4.6%209L10%203%27%20stroke=%27%231A1C1E%27%20stroke-width=%271.8%27%20fill=%27none%27%20stroke-linecap=%27square%27/%3E%3C/svg%3E")]',
        )}
        {...rest}
      />
      {label}
    </label>
  );
}
