'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { DashboardNetworkGraph } from '@/components/dashboard/dashboard-network-graph';
import { DashboardRecentForms } from '@/components/dashboard/dashboard-recent-forms';
import { DashboardEngagement } from '@/components/dashboard/dashboard-engagement';
import { DashboardAdminHeader } from '@/components/dashboard/dashboard-admin-header';

import { type EditTeamType } from '@/models/Team';
import { DashboardAdminSections } from '@/components/dashboard/dashboard-admin-sections';

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
  const { data: activeSurveys = [] } = useQuery<Survey[]>({
    queryKey: ['activeSurveys'],
    queryFn: async () => {
      const response = await fetch('/api/surveys');
      const json: unknown = await response.json();

      const parsed = surveysSchema.safeParse(json);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new Error('Invalid response structure');
      }

      return parsed.data.surveys.filter((survey) => survey.status === 'ativo');
    },
  });

  const totalActiveSurveys = activeSurveys.length;

  const recentSurveys = [...activeSurveys]
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

  const totalTeams = teams.length;
  const isGestor = true; //VALIDAR GESTOR, EXIBINDO SOMENTE DASH-ADMIN

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

          <DashboardCards
            activeTab={totalActiveSurveys}
            totalTeams={totalTeams}
            recentSurvey={recentSurvey}
          />

          <DashboardNetworkGraph />

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardRecentForms surveys={recentSurveys} />
            <DashboardEngagement />
          </div>
        </>
      )}
    </div>
  );
}
