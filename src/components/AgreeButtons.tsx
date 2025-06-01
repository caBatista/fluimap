'use client';

import { useRouter } from 'next/navigation';

export default function AgreeButtons({
  surveyId,
  respondeeId,
  teamId,
  email,
}: {
  surveyId: string;
  respondeeId: string;
  teamId?: string;
  email?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <button
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        onClick={() =>
          router.push(
            `/questionnaire/${surveyId}/${respondeeId}/selectUsers?teamId=${teamId}&email=${encodeURIComponent(email ?? '')}`
          )
        }
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
