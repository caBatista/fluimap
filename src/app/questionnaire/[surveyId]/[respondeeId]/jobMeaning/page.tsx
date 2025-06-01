import JobMeaningClient from './JobMeaningClient';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ surveyId: string; respondeeId: string }>;
}) {
  const { surveyId, respondeeId } = await params;

  return (
    <Suspense
      fallback={<main className="flex min-h-screen items-center justify-center">Carregando…</main>}
    >
      <JobMeaningClient surveyId={surveyId} respondeeId={respondeeId} />
    </Suspense>
  );
}
