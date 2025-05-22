'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { GeistSans } from 'geist/font/sans';

export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={GeistSans.variable}>
        <main className="min-h-screen overflow-y-auto">{children}</main>
      </div>
    </ThemeProvider>
  );
}
