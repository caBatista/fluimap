'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export type SurveyResponse = {
  _id: string;
  title: string;
  description?: string;
  status?: 'ativo' | 'rascunho' | 'fechado';
  progress?: number;
  responsesCount?: number;
  expiresInDays?: number;
  dateClosing?: string;
  email?: string;
  formId?: string;
  teamId?: string;
};

export interface SurveyListProps {
  surveys: SurveyResponse[];
  search: string;
  statusFilter: string;
  isLoading: boolean;
}

function getBadgeClasses(status: SurveyResponse['status']): string {
  switch (status) {
    case 'ativo':
      return 'bg-[hsl(var(--badge-active-bg))] text-[hsl(var(--badge-active-text))]';
    case 'rascunho':
    case 'fechado':
      return 'bg-[hsl(var(--badge-gray-bg))] text-[hsl(var(--badge-gray-text))]';
    default:
      return '';
  }
}

function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SurveyList({ surveys, search, statusFilter, isLoading }: SurveyListProps) {
  const [localSurveys, setLocalSurveys] = useState<SurveyResponse[]>(surveys);
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const localPart = email.split('@')[0] ?? '';
  const displayName = user?.fullName?.trim() ? user.fullName : localPart;

  useEffect(() => {
    setLocalSurveys(surveys);
  }, [surveys]);

  useEffect(() => {
    async function fetchProgress() {
      const updatedSurveys = await Promise.all(
        surveys.map(async (survey) => {
          console.log('Survey recebido:', survey);
          const formId = survey.formId ?? survey._id;
          if (!formId || !survey.teamId) return survey;

          console.log('Chamando /api/progress com:', {
            formId,
            teamId: survey.teamId,
          });
          try {
            const res = await fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ formId, teamId: survey.teamId }),
            });

            if (!res.ok) throw new Error('Erro na API progress');

            const data = await res.json();
            console.log('Resposta da API progress:', data);
            const { totalPeople, totalReplies } = data;
            const progress = totalPeople ? Math.round((totalReplies / totalPeople) * 100) : 0;

            console.log(
              `Formulário ${survey.title} - Total pessoas: ${totalPeople}, Respostas: ${totalReplies}, Progresso: ${progress}%`
            );

            return { ...survey, progress };
          } catch (err) {
            console.error(`Erro ao buscar progresso do formulário ${survey.title}:`, err);
            return survey;
          }
        })
      );
      setLocalSurveys(updatedSurveys);
    }

    fetchProgress();
  }, [surveys]);

  const filtered = localSurveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'todos') return matchesSearch;
    return (
      matchesSearch && survey.status && survey.status.toLowerCase() === statusFilter.toLowerCase()
    );
  });

  if (isLoading) {
    return <p className="text-[hsl(var(--muted-foreground))]">Carregando...</p>;
  }

  if (filtered.length === 0) {
    return <p className="text-[hsl(var(--muted-foreground))]">Nenhum formulário encontrado.</p>;
  }

  return (
    <div className="grid w-full gap-[29px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((survey) => {
        const isExpired = survey.dateClosing && new Date(survey.dateClosing).getTime() < Date.now();
        const statusText: 'ativo' | 'rascunho' | 'fechado' = isExpired
          ? 'fechado'
          : survey.status === 'fechado'
            ? 'ativo'
            : (survey.status ?? 'ativo');
        const progressValue = survey.progress ?? 0;

        return (
          <div key={survey._id} className="block h-full w-full">
            <Card className="relative h-[138px] w-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sml font-semibold text-[hsl(var(--foreground))]">
                    {survey.title}
                  </h2>
                </div>
                <Badge
                  variant="default"
                  className={cn(
                    'pointer-events-none rounded-full px-2 py-1 text-xs font-medium',
                    getBadgeClasses(statusText),
                    statusText === 'fechado' ? 'bg-red-500 text-white' : ''
                  )}
                >
                  {capitalize(statusText)}
                </Badge>
              </div>

              <p className="mt-[5px] text-xs text-[hsl(var(--muted-foreground))]">
                {survey.responsesCount ?? 0} respostas
              </p>

              <div className="mb-[16px] mt-2 flex items-center gap-2">
                <Progress
                  value={progressValue}
                  className="h-[8px] w-[189px] rounded-full bg-[hsl(var(--input))]"
                />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {progressValue}%
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs',
                    isExpired ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'
                  )}
                >
                  {survey.dateClosing
                    ? (() => {
                        const diffDays = Math.ceil(
                          (new Date(survey.dateClosing).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return diffDays < 0
                          ? `Expirado há ${Math.abs(diffDays)} dias`
                          : `Expira em ${diffDays} dias`;
                      })()
                    : 'Sem data de expiração'}
                </span>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
