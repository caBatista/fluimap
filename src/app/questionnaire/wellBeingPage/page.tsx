import { Suspense } from 'react';
import WellBeingClient from './WellBeingClient';

export default function Page() {
  return (
    <Suspense
      fallback={<main className="flex min-h-screen items-center justify-center">Carregando…</main>}
    >
      <WellBeingClient />
    </Suspense>
  );
}
