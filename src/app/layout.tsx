import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(
  process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
),
  title: { default: 'Vitota Technologies', template: '%s | Vitota Technologies' },
  description: 'Premium technology solutions — web development, applications, and digital systems by Vitota Technologies.',
  openGraph: {
    title: 'Vitota Technologies',
    description: 'Premium technology solutions by Vitota Technologies.',
    type: 'website',
    siteName: 'Vitota Technologies',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
