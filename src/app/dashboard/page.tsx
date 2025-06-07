'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { DashboardNetworkGraph } from '@/components/dashboard/dashboard-network-graph';
import { DashboardRecentForms } from '@/components/dashboard/dashboard-recent-forms';
import { DashboardEngagement } from '@/components/dashboard/dashboard-engagement';

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
    })
  ),
});

export default function CreateDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      return parsed.data.surveys;
    },
  });

  const surveyId = searchParams.get('surveyId') ?? allSurveys[0]?._id;

  const handleSurveyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('surveyId', selectedId);
    router.push(`?${params.toString()}`);
  };

  const recentSurveys = [...allSurveys]
    .filter((survey) => survey.dateClosing)
    .sort((a, b) => new Date(b.dateClosing!).getTime() - new Date(a.dateClosing!).getTime())
    .slice(0, 3);

  const recentSurvey = 0;

  function isTeam(item: unknown): item is EditTeamType {
    return (
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      typeof (item as Record<string, unknown>).name === 'string'
    );
  }

  function isApiTeamResponse(data: unknown): data is { teams: unknown[] } {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray((data as { teams?: unknown }).teams)
    );
  }

  const { data: teams = [] } = useQuery<EditTeamType[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Erro ao buscar times');
      const json: unknown = await res.json();
      if (!isApiTeamResponse(json)) {
        throw new Error('Formato inválido da resposta da API');
      }
      return json.teams.filter(isTeam);
    },
  });

  const totalActiveSurveys = allSurveys.filter((s) => s.status === 'ativo').length;
  const totalTeams = teams.length;

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <DashboardHeader />

      {}
      {allSurveys.length > 0 && (
        <div className="mb-0.2 max-w-xs">
          <label
            htmlFor="survey-select"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <h2 className="mb-2.5 text-lg font-semibold">Selecionar Formulário</h2>
          </label>
          <select
            id="survey-select"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={surveyId}
            onChange={handleSurveyChange}
          >
            {allSurveys.map((survey) => (
              <option key={survey._id} value={survey._id}>
                {survey.title} {survey.status === 'fechado' ? '(Fechado)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <DashboardCards
        activeTab={totalActiveSurveys}
        totalTeams={totalTeams}
        recentSurvey={recentSurvey}
      />

      <DashboardNetworkGraph surveyId={surveyId} />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardRecentForms surveys={recentSurveys} />
        <DashboardEngagement />
      </div>
    </div>
  );
}
