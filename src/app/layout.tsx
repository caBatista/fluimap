import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/globals.css';
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import Sidebar from '@/components/sidebar';
import { QueryProvider } from '@/components/query-provider';

export const metadata: Metadata = {
  title: 'FluiMap',
  description: 'generate your team analytics',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
        <body className="h-screen w-screen overflow-hidden">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <SignedOut>
                <div className="flex h-full flex-row items-center justify-center gap-8">
                  <SignInButton />
                  <SignUpButton />
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
