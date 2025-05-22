'use client';

import { useRouter } from 'next/navigation';

export default function AgreeButtons({
  surveyId,
  respondeeId,
}: {
  surveyId: string;
  respondeeId: string;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <button
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        onClick={() => router.push(`/questionnaire/${surveyId}/${respondeeId}/selectUsers`)}
      >
        Sim, quero participar
      </button>
      <button
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        onClick={() => router.push(`/questionnaire/declined`)}
      >
        Não quero participar
      </button>
    </div>
  );
}
