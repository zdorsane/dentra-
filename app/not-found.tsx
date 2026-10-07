import Link from 'next/link';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { LogoMark } from '@/components/ui/Logo';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#F2F1F0] px-5 text-center">
      <Link href="/" className="mb-10 inline-flex items-center gap-3">
        <LogoMark size={34} />
        <span
          className="font-normal leading-none tracking-[-0.5px] text-[#1A1C1E]"
          style={{ fontSize: 26 }}
        >
          DENTRA
        </span>
      </Link>

      <p className="dt-mono text-[11px] font-bold tracking-[0.2em] text-[#15BCDF]">
        ERROR / 404
      </p>

      <h1
        className="dt-stair mt-5 text-[#2B3033]"
        style={{ fontSize: 'clamp(38px, 7vw, 76px)' }}
      >
        <span className="block">PAGE</span>
        <span className="block">NOT</span>
        <span className="block text-[#15BCDF]">FOUND</span>
      </h1>

      <p className="mt-7 max-w-[400px] text-[14px] leading-[1.7] text-[#6B6F72]">
        This route doesn&rsquo;t exist. It may have been moved, or the link was
        mistyped.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ChamferButton href="/dashboard">GO TO DASHBOARD</ChamferButton>
        <ChamferButton href="/" variant="secondary">
          BACK TO HOME
        </ChamferButton>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <TechnicalLabel label="SYSTEM" value="ONLINE" dot />
        <TechnicalLabel label="VERSION" value="1.0.0" />
      </div>
    </main>
  );
}
