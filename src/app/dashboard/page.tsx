'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
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

      return parsed.data.surveys;
    },
  });

  useEffect(() => {
    if (!selectedSurveyId && allSurveys.length > 0) {
      setSelectedSurveyId(searchParams.get('surveyId') ?? (allSurveys[0]?._id ?? ''));
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

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
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
            <SelectTrigger className="w-full rounded-md border border-muted-background bg-background px-3 py-2 text-sm shadow-sm text-foreground">
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
        surveyId={selectedSurveyId}
      />

      <DashboardNetworkGraph surveyId={selectedSurveyId} />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardRecentForms surveys={recentSurveys} />

        <DashboardEngagement
          activeSurveys={totalActiveSurveys}
          closedSurveys={totalClosedSurveys}
        />
      </div>
    </div>
  );
}
