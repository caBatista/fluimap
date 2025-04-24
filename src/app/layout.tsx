import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import { ptBR } from '@clerk/localizations';

import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { Toaster } from '@/components/ui/sonner';

import RootLayoutClient from './RootLayoutClient';
import '@/styles/globals.css';

import { type Metadata } from 'next';

export const metadata: Metadata = {
  description: 'generate your team analytics',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html className={`${GeistSans.variable}`} lang="pt" suppressHydrationWarning>
        <body className="h-screen w-screen overflow-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <RootLayoutClient>{children}</RootLayoutClient>
            </QueryProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
