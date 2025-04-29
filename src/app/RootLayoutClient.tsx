'use client';

import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar';
import Auth from './auth/page';
import Image from 'next/image';

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
            <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
              {/* LOGO no lugar do título */}
              <Image
                src="/LogoFluiMap.png"
                alt="Logo FluiMap"
                width={10}
                height={10}
                className="mb-4"
              />

              {/* Componente de autenticação */}
              <Auth />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-1 overflow-auto bg-background">{children}</div>
            </div>
          </SignedIn>
        </>
      )}
    </>
  );
}
