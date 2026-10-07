'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ChamferVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
export type ChamferSize = 'lg' | 'sm' | 'xs';

const VARIANT_CLASS: Record<ChamferVariant, string> = {
  primary: 'dt-btn-primary',
  secondary: 'dt-btn-secondary',
  ghost: 'dt-btn-ghost',
  dark: 'dt-btn-dark',
};

const SIZE_CLASS: Record<ChamferSize, string> = {
  lg: '',
  sm: 'dt-btn-sm',
  xs: 'dt-btn-xs',
};

interface BaseProps {
  variant?: ChamferVariant;
  size?: ChamferSize;
  className?: string;
  children: ReactNode;
  /** Renders a Next link styled as a button. */
  href?: string;
  fullWidth?: boolean;
}

export type ChamferButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

/**
 * The product's single button primitive. Chamfered geometry comes from the
 * `.dt-btn-*` classes so the clip-path stays defined in one place.
 */
export const ChamferButton = forwardRef<HTMLButtonElement, ChamferButtonProps>(
  function ChamferButton(
    {
      variant = 'primary',
      size = 'lg',
      className,
      children,
      href,
      fullWidth,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const classes = cn(
      'dt-btn',
      VARIANT_CLASS[variant],
      SIZE_CLASS[size],
      // Ghost buttons opt out of the chamfer; everything else keeps it.
      variant === 'ghost' && size === 'lg' && 'px-6 py-4 text-[13px]',
      fullWidth && 'w-full',
      className,
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {children}
      </button>
    );
  },
);
