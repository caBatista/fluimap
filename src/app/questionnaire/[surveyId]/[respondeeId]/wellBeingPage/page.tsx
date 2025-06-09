import { Suspense } from 'react';
import WellBeingClient from './WellBeingClient';

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
      <WellBeingClient surveyId={surveyId} respondeeId={respondeeId} />
    </Suspense>
  );
}
