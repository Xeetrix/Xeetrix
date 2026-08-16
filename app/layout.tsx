import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = 'https://xeetrix.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Xeetrix — Elite AI Agents & Workflow Automation',
    template: '%s | Xeetrix',
  },
  description:
    'Xeetrix engineers elite AI agents, custom APIs, and intelligent workflow automations for global enterprises looking to 10x their efficiency.',
  keywords: [
    'AI automation agency',
    'AI agents',
    'workflow automation',
    'custom API development',
    'CRM optimization',
    'business process automation',
  ],
  authors: [{ name: 'Xeetrix' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Xeetrix',
    title: 'Xeetrix — Elite AI Agents & Workflow Automation',
    description:
      'Elite AI agents, custom APIs, and intelligent workflow automations for global enterprises looking to 10x their efficiency.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xeetrix — Elite AI Agents & Workflow Automation',
    description:
      'Elite AI agents, custom APIs, and intelligent workflow automations for global enterprises looking to 10x their efficiency.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="bg-background font-sans text-white antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
