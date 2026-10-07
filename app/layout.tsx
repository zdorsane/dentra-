import { Quantico } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import { ToastProvider } from '@/components/ui/Toast';

import './globals.css';

const quantico = Quantico({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-quantico',
  fallback: ['Arial Narrow', 'Arial', 'sans-serif'],
});

const TITLE = 'DENTRA — The Intelligent Operating System for Dental Clinics';
const DESCRIPTION =
  'DENTRA is an AI-powered dental clinic management platform for patients, appointments, inventory and intelligent clinic operations.';

export const metadata: Metadata = {
  metadataBase: new URL('https://dentra.app'),
  title: {
    default: TITLE,
    template: '%s — DENTRA',
  },
  description: DESCRIPTION,
  applicationName: 'DENTRA',
  keywords: [
    'dental clinic software',
    'dental practice management',
    'odontogram',
    'dental inventory',
    'clinic AI assistant',
    'dental SaaS',
  ],
  authors: [{ name: 'DENTRA' }],
  openGraph: {
    type: 'website',
    siteName: 'DENTRA',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#F2F1F0',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={quantico.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
