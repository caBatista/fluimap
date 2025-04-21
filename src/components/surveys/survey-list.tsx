'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useTransition } from 'react';

export type SurveyResponse = {
  _id: string;
  title: string;
  description?: string;
  status?: 'ativo' | 'rascunho' | 'fechado';
  progress?: number;
  responsesCount?: number;
  expiresInDays?: number;
  dateClosing?: string;
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
      return 'bg-[hsl(var(--badge-gray-bg))] text-[hsl(var(--badge-gray-text))]';
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
  const finalSurveys = Array.isArray(surveys) ? surveys : [];

  const [confirmAction, setConfirmAction] = useState<null | {
    id: string;
    nextStatus: 'ativo' | 'fechado';
  }>(null);
  const [isPending, startTransition] = useTransition();

  console.log('SurveyList: surveys recebidos =', surveys);
  console.log('SurveyList: filtro =', statusFilter, '| search =', search);

  const filtered = finalSurveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'todos') return matchesSearch;
    return (
      matchesSearch && survey.status && survey.status.toLowerCase() === statusFilter.toLowerCase()
    );
  });

  if (isLoading) {
    return <p className="text-[hsl(var(--muted-foreground))]">Carregando...</p>;
  }

  console.log('SurveyList: recebidos', surveys);
  console.log('SurveyList: filtro status =', statusFilter);

  if (filtered.length === 0) {
    return <p className="text-[hsl(var(--muted-foreground))]">Nenhum formulário encontrado.</p>;
  }

  console.log('SurveyList: surveys filtrados =', filtered.length);

  return (
    <>
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-md bg-white p-6 shadow-md">
            <p className="mb-4 text-sm text-gray-700">
              Deseja realmente {confirmAction.nextStatus === 'fechado' ? 'fechar' : 'abrir'} este
              formulário?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                onClick={() => setConfirmAction(null)}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      const response = await fetch(`/api/surveys/${confirmAction.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: confirmAction.nextStatus }),
                      });

                      if (!response.ok) {
                        throw new Error('Erro ao atualizar status');
                      }

                      const updatedSurveys = surveys.map((survey) =>
                        survey._id === confirmAction.id
                          ? { ...survey, status: confirmAction.nextStatus }
                          : survey
                      );
                      (surveys as any).splice(0, surveys.length, ...updatedSurveys);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setConfirmAction(null);
                    }
                  });
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-[29px] md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((survey) => {
          const adjustedStatus: 'ativo' | 'rascunho' | 'fechado' = survey.status ?? 'ativo';

          const progressValue = survey.progress ?? 0;
          const statusText = adjustedStatus;

          return (
            <Card
              key={survey._id}
              className="relative h-[138px] w-[364px] rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sml font-semibold text-[hsl(var(--foreground))]">
                    {survey.title}
                  </h2>
                </div>
                <button
                  onClick={() =>
                    setConfirmAction({
                      id: survey._id,
                      nextStatus: statusText === 'ativo' ? 'fechado' : 'ativo',
                    })
                  }
                >
                  <Badge
                    variant="default"
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      getBadgeClasses(statusText),
                      statusText === 'fechado' ? 'bg-red-500 text-white' : ''
                    )}
                  >
                    {capitalize(statusText)}
                  </Badge>
                </button>
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
                <Link
                  href={`/surveys/${survey._id}`}
                  className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  Exibir respostas
                </Link>
                <span
                  className={cn(
                    'text-xs',
                    survey.dateClosing && new Date(survey.dateClosing).getTime() < Date.now()
                      ? 'text-red-500'
                      : 'text-[hsl(var(--muted-foreground))]'
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
          );
        })}
      </div>
    </>
  );
}
