import { Suspense } from 'react';
import { PeerCommunicationContent } from './peer-communication-content';

export default function PeerCommunicationPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando questionário...</div>}>
      <PeerCommunicationContent />
    </Suspense>
  );
}
