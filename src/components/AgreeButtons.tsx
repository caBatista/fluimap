'use client';

import { Button } from '@/components/ui/button';
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
      <Button
        onClick={() =>
          router.push(
            `/questionnaire/${surveyId}/${respondeeId}/selectUsers?teamId=${teamId}&email=${encodeURIComponent(email ?? '')}`
          )
        }
      >
        Sim, quero participar
      </Button>
      <Button variant="destructive" onClick={() => router.push(`/questionnaire/declined`)}>
        Não quero participar
      </Button>
    </div>
  );
}
