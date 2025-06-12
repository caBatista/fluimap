'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@clerk/nextjs';
const responsesCountSchema = z.object({ count: z.number().optional() });
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { DashboardNetworkGraph } from '@/components/dashboard/dashboard-network-graph';
import { DashboardRecentForms } from '@/components/dashboard/dashboard-recent-forms';
import { DashboardEngagement } from '@/components/dashboard/dashboard-engagement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DashboardAdminHeader } from '@/components/dashboard/dashboard-admin-header';
import { DashboardAdminSections } from '@/components/dashboard/dashboard-admin-sections';
import { type EditTeamType } from '@/models/Team';

type Survey = {
  _id: string;
  title: string;
  description?: string;
  status: 'ativo' | 'fechado';
  teamId: string;
  dateClosing?: string;
};

const surveysSchema = z.object({
  surveys: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['ativo', 'fechado']),
      teamId: z.string(),
      dateClosing: z.string().optional(),
      responsesCount: z.number().optional(),
      progress: z.number().optional(),
    })
  ),
});

export default function CreateDashboardPage() {
  const router = useRouter();

  const { userId } = useAuth();

  // --- Verifica se o usuário é gestor -------------------------------------------------
  const { data: usersData = [] } = useQuery<{ clerkId: string; email: string }[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/userManagement`);
      return (await response.json()) as { clerkId: string; email: string }[];
    },
  });

  const currentUser = usersData.find((u) => u.clerkId === userId);
  const isGestor = currentUser?.email === 'fluimap@gmail.com';

  const searchParams = useSearchParams();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | undefined>(undefined);

  const { data: allSurveys = [] } = useQuery<Survey[]>({
    queryKey: ['surveys'],
    queryFn: async () => {
      const response = await fetch('/api/surveys');
      const json: unknown = await response.json();

      const parsed = surveysSchema.safeParse(json);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new Error('Invalid response structure');
      }

      const surveysWithRespondents: Survey[] = await Promise.all(
        parsed.data.surveys.map(async (surveyBase) => {
          const survey = surveyBase as Survey & { responsesCount?: number };
          let respondents = 0;
          try {
            const res = await fetch(`/api/respondees?teamId=${survey.teamId}`);
            if (res.ok) {
              const data = (await res.json()) as { respondees: unknown[] };
              respondents = Array.isArray(data.respondees) ? data.respondees.length : 0;
            }
          } catch (err) {
            console.error('Error fetching respondees:', err);
            respondents = 0;
          }

          console.log('respondents count:', respondents);
          console.log('responsesCount:', survey.responsesCount);

          const responsesCount = survey.responsesCount ?? 0;
          const progress = respondents > 0 ? Math.round((responsesCount / respondents) * 100) : 0;

          return { ...survey, respondents, responsesCount, progress } as Survey;
        })
      );

      return surveysWithRespondents;
    },
  });

  const { data: responsesCount = 0 } = useQuery<number>({
    queryKey: ['responsesCount'],
    queryFn: async () => {
      const response = await fetch('/api/responses/count');
      if (!response.ok) throw new Error('Failed to fetch responses count');
      const json = (await response.json()) as unknown;
      const parsed = responsesCountSchema.safeParse(json);
      if (!parsed.success) {
        console.error(parsed.error);
        return 0;
      }
      return typeof parsed.data.count === 'number' ? parsed.data.count : 0;
    },
  });

  useEffect(() => {
    if (!selectedSurveyId && allSurveys.length > 0) {
      setSelectedSurveyId(searchParams.get('surveyId') ?? allSurveys[0]?._id ?? '');
    }
  }, [allSurveys, searchParams, selectedSurveyId]);

  const handleSurveyChange = (value: string) => {
    setSelectedSurveyId(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('surveyId', value);
    router.push(`?${params.toString()}`);
  };

  const recentSurveys = [...allSurveys]
    .filter((survey) => survey.dateClosing)
    .sort((a, b) => new Date(b.dateClosing!).getTime() - new Date(a.dateClosing!).getTime())
    .slice(0, 3);

  const totalActiveSurveys = allSurveys.filter((s) => s.status === 'ativo').length;
  const totalClosedSurveys = allSurveys.filter((s) => s.status === 'fechado').length;

  const { data: teams = [] } = useQuery<EditTeamType[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Erro ao buscar times');
      const json = (await res.json()) as { teams: unknown[] };
      return (Array.isArray(json.teams) ? json.teams : []) as EditTeamType[];
    },
  });

  const totalTeams = teams.length;

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      {isGestor ? (
        <>
          <DashboardAdminHeader />

          <div className="mt-8">
            <DashboardAdminSections />
          </div>
        </>
      ) : (
        <>
          <DashboardHeader />

          {allSurveys.length > 0 && (
            <div className="mb-0.2 max-w-xs">
              <label
                htmlFor="survey-select"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <h2 className="mb-2.5 text-lg font-semibold">Selecionar Formulário</h2>
              </label>
              <Select value={selectedSurveyId} onValueChange={handleSurveyChange}>
                <SelectTrigger className="border-muted-background w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                  <SelectValue placeholder="Selecione um formulário" />
                </SelectTrigger>
                <SelectContent className="w-full text-sm">
                  {allSurveys.map((survey) => (
                    <SelectItem key={survey._id} value={survey._id} className="pl-2">
                      {survey.title} {survey.status === 'ativo' ? '(Ativo)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DashboardCards
            activeSurveys={totalActiveSurveys}
            closedSurveys={totalClosedSurveys}
            responsesCount={responsesCount}
            surveyId={selectedSurveyId}
            totalTeams={totalTeams}
          />

          <DashboardNetworkGraph surveyId={selectedSurveyId} />

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardRecentForms surveys={recentSurveys} />

            <DashboardEngagement
              activeSurveys={totalActiveSurveys}
              closedSurveys={totalClosedSurveys}
            />
          </div>
        </>
      )}
    </div>
  );
}
