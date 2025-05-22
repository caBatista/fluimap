'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

export function DashboardRecentForms({ surveys }: SurveyListProps) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Formulários Recentes</h2>

      <div className="space-y-4">
        {surveys.map((survey) => {
          const isExpired =
            survey.dateClosing && new Date(survey.dateClosing).getTime() < Date.now();
          const statusText: 'ativo' | 'rascunho' | 'fechado' = isExpired
            ? 'fechado'
            : survey.status === 'fechado'
              ? 'ativo'
              : (survey.status ?? 'ativo');
          const progressValue = survey.progress ?? 0;

          const expiresText = survey.dateClosing
            ? (() => {
                const diffDays = Math.ceil(
                  (new Date(survey.dateClosing).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return diffDays < 0
                  ? `Expirado há ${Math.abs(diffDays)} dias`
                  : `Expira em ${diffDays} dias`;
              })()
            : 'Sem data de expiração';

          return (
            <Card
              key={survey._id}
              className="relative h-[138px] w-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-sml font-semibold text-[hsl(var(--foreground))]">
                  {survey.title}
                </h2>
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
                <Link
                  href={`/surveys/${survey._id}`}
                  className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  Exibir respostas
                </Link>
                <span
                  className={cn(
                    'text-xs',
                    isExpired ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'
                  )}
                >
                  {expiresText}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Link href="/fluimap/surveys" className="block mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400">
        Ver todos os formulários →
      </Link>
    </div>
  );
}
