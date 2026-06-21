import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Terraprint — Your Carbon Footprint, Tracked',
  description:
    'Terraprint automatically tracks your carbon footprint via bank transactions, gives you an AI-powered coach grounded in your real data, and connects you to one-tap actions to reduce your impact. Equity-aware. Non-shaming.',
  keywords: ['carbon footprint', 'climate', 'sustainability', 'CO2', 'carbon tracker'],
  openGraph: {
    title: 'Terraprint — Your Carbon Footprint, Tracked',
    description: 'Automatically track, understand, and reduce your carbon footprint.',
    type: 'website',
  },
};

import AuthProvider from '@/components/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface text-white antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
