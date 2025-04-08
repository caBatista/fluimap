'use client';

import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar';
import Auth from './auth/page';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuestionnaire = pathname.startsWith('/questionnaire');

  return (
    <>
      {isQuestionnaire ? (
        <div className="h-screen w-screen overflow-y-auto">{children}</div>
      ) : (
        <>
          <SignedOut>
            <div className="flex h-full flex-row items-center justify-center gap-8">
              <Auth />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-1 overflow-auto">{children}</div>
            </div>
          </SignedIn>
        </>
      )}
    </>
  );
}
