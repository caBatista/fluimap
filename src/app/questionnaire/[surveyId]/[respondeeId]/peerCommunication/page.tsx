import { Suspense } from 'react';
import { PeerCommunicationContent } from './peer-communication-content';

export default async function PeerCommunicationPage({
  params,
}: {
  params: Promise<{ surveyId: string; respondeeId: string }>;
}) {
  const { surveyId, respondeeId } = await params;

  return (
    <Suspense fallback={<div className="p-6">Carregando questionário...</div>}>
      <PeerCommunicationContent surveyId={surveyId} respondeeId={respondeeId} />
    </Suspense>
  );
}
