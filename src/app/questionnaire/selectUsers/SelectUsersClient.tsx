'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SelectUser } from '@/components/select-user';
import { Button } from '@/components/ui/button';

interface Survey {
  title: string;
  description?: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string;
}

export default function SelectUsersClient() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('surveyId') ?? '';
  const email = searchParams.get('email') ?? '';
  const { data, isLoading, error } = useQuery<{
    survey: Survey;
    members: Member[];
  }>({
    queryKey: ['survey', surveyId],
    enabled: !!surveyId, // só executa se existir surveyId
    queryFn: async () => {
      const surveyRes = await fetch(`/api/surveys/${surveyId}`);
      if (!surveyRes.ok) throw new Error('Erro ao buscar survey');
      const { survey } = (await surveyRes.json()) as { survey: Survey };

      const membersRes = await fetch(`/api/teams/${survey.teamId}`);
      if (!membersRes.ok) throw new Error('Erro ao buscar membros');
      const { members } = (await membersRes.json()) as { members: Member[] };

      return { survey, members };
    },
  });

  const handleSelect = (name: string, selected: boolean) => {
    setSelectedUsers((prev) => (selected ? [...prev, name] : prev.filter((n) => n !== name)));
  };

  const handleContinue = () => {
    const qs = [
      `surveyId=${surveyId}`,
      `email=${encodeURIComponent(email)}`,
      ...selectedUsers.map((u) => `users=${encodeURIComponent(u)}`),
    ].join('&');

    router.push(`/questionnaire/peerCommunication?${qs}`);
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
        <h1 className="p-6 text-4xl font-bold">
          <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
        <p>Carregando membros da equipe…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
        <h1 className="p-6 text-4xl font-bold">
          <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
        <p className="text-red-600">Falha ao carregar dados. Tente novamente mais tarde.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
      <h1 className="p-6 text-4xl font-bold">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>

      <h2 className="mt-[-10px] text-center text-2xl text-[#6B7280]">
        Selecione colegas que você deseja avaliar.
      </h2>

      <div className="flex w-full items-center justify-center">
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data.members.map((user) => (
            <SelectUser
              key={user._id}
              name={user.name}
              role={user.role}
              imageUrl={user.imageUrl}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex w-full justify-center px-2 sm:justify-end">
        <Button
          variant="default"
          className="h-auto w-full px-8 py-4 text-base sm:w-auto"
          onClick={handleContinue}
          disabled={selectedUsers.length === 0}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}
