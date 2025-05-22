'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SelectUser } from '@/components/select-user';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';

interface Survey {
  title: string;
  description?: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export default function SelectUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();
  const [email] = useQueryState('email');
  // teamId is not used, so it is removed to avoid the unused variable warning
  const params = useParams();
  const surveyId = params.surveyId as string;
  const respondeeId = params.respondeeId as string;

  const { data, isLoading, error } = useQuery<{
    survey: Survey;
    members: { _id: string; name: string; email: string; role: string; imageUrl: string }[];
  }>({
    queryKey: ['survey', surveyId],
    queryFn: async (): Promise<{
      survey: Survey;
      members: { _id: string; name: string; email: string; role: string; imageUrl: string }[];
    }> => {
      const surveyResponse = await fetch(`/api/surveys/${surveyId}`);
      if (!surveyResponse.ok) {
        throw new Error('Failed to fetch survey data');
      }
      const surveyData = (await surveyResponse.json()) as { survey: Survey };
      const survey = surveyData.survey;

      const membersResponse = await fetch(`/api/teams/${surveyId}`);
      if (!membersResponse.ok) {
        throw new Error('Failed to fetch team members');
      }
      const membersData = (await membersResponse.json()) as {
        members: { _id: string; name: string; email: string; role: string; imageUrl: string }[];
      };
      const members = membersData.members;
      return { survey, members };
    },
  });

  const handleSelect = (name: string, selected: boolean) => {
    setSelectedUsers((prev) => (selected ? [...prev, name] : prev.filter((n) => n !== name)));
  };

  async function handleContinue() {
    const searchParams = new URLSearchParams();
    searchParams.set('surveyId', surveyId);
    searchParams.set('email', email ?? 'asdfasd@gmail.com');
    selectedUsers.forEach((user) => {
      searchParams.append('users', user);
    });

    router.push(
      `/questionnaire/${surveyId}/${respondeeId}/peerCommunication?${searchParams.toString()}`
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
        <h1 className="items-center p-6 text-4xl font-bold">
          <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
        <p>Loading team members...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
        <h1 className="items-center p-6 text-4xl font-bold">
          <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
        <p className="text-red-600">Failed to load team members. Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-background px-4 pb-12">
      <h1 className="items-center p-6 text-4xl font-bold">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>
      <h1 className="mt-[-10px] text-center text-2xl text-[#6B7280]">
        Selecione colegas no qual você deseja avaliar.
      </h1>

      <div className="flex w-full items-center justify-center">
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data?.members
            ?.filter(Boolean)
            .map((user, index) => (
              <SelectUser
                key={index}
                name={user.name}
                role={user.role}
                imageUrl={user.imageUrl}
                onSelect={handleSelect}
              />
            ))}
        </div>
      </div>

      <div className="mb-[80] mt-8 flex w-full justify-center px-2 sm:justify-end">
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
