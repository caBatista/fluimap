import JobMeaningClient from '@/app/questionnaire/jobMeaning/JobMeaningClient';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense
      fallback={<main className="flex min-h-screen items-center justify-center">Carregando…</main>}
    >
      <JobMeaningClient />
    </Suspense>
  );
}
