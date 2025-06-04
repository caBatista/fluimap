import SelectUsersClient from './SelectUsersClient';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ surveyId: string; respondeeId: string }>;
}) {
  const { surveyId, respondeeId } = await params;

  return (
    <Suspense
      fallback={
        <main className="p-6 text-center">
          <span>Carregando…</span>
        </main>
      }
    >
      <SelectUsersClient surveyId={surveyId} respondeeId={respondeeId} />
    </Suspense>
  );
}
