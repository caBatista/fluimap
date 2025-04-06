import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/globals.css';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import Sidebar from '@/components/sidebar';
import { QueryProvider } from '@/components/query-provider';
import "@/styles/globals.css";

import Auth from "./auth/page";
import { ptBR } from '@clerk/localizations'

export const metadata: Metadata = {
  title: 'FluiMap',
  description: 'generate your team analytics',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider 
      localization={ptBR}
    >
      <html
        className={`${GeistSans.variable}`}
        suppressHydrationWarning
      >
        <body className="h-screen w-screen overflow-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <SignedOut>
                <div className="flex h-full flex-row items-center justify-center gap-8">
                  <Auth></Auth>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex h-full">
                  <Sidebar />
                  <div className="flex-1 overflow-auto">{children}</div>
                </div>
            </SignedIn>
            </QueryProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
