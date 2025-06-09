'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SelectUser } from '@/components/select-user';
import { Button } from '@/components/ui/button';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string;
}

interface SelectUsersClientProps {
  surveyId: string;
  respondeeId: string;
}

export default function SelectUsersClient({ surveyId, respondeeId }: SelectUsersClientProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId') ?? '';
  const email = searchParams.get('email') ?? '';

  const {
    data: members,
    isLoading,
    error,
  } = useQuery<Member[]>({
    queryKey: ['team-members', teamId],
    enabled: !!teamId, // só executa se existir teamId
    queryFn: async () => {
      const membersRes = await fetch(`/api/teams/${teamId}`);
      if (!membersRes.ok) throw new Error('Erro ao buscar membros');
      const { members } = (await membersRes.json()) as { members: Member[] };
      return members;
    },
  });

  // Filter out the respondent (person with matching email) from the members list
  const filteredMembers = members?.filter((member) => member.email !== email) ?? [];

  const handleSelect = (name: string, selected: boolean) => {
    setSelectedUsers((prev) => (selected ? [...prev, name] : prev.filter((n) => n !== name)));
  };

  const handleContinue = () => {
    const qs = [
      `surveyId=${surveyId}`,
      `email=${encodeURIComponent(email)}`,
      ...selectedUsers.map((u) => `users=${encodeURIComponent(u)}`),
    ].join('&');

    router.push(`/questionnaire/${surveyId}/${respondeeId}/peerCommunication?${qs}`);
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

  if (error || !members) {
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
          {filteredMembers.map((user) => (
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
