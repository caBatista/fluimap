import SelectUsersClient from '@/app/questionnaire/selectUsers/SelectUsersClient';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="p-6 text-center">
          <span>Carregando…</span>
        </main>
      }
    >
      <SelectUsersClient />
    </Suspense>
  );
}
