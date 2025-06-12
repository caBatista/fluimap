'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Users, BarChart2, Layers } from 'lucide-react';

interface DashboardCardsProps {
  activeSurveys: number;
  closedSurveys: number;
  responsesCount: number;
  surveyId?: string;
  totalTeams: number;
}

export function DashboardCards({
  activeSurveys,
  closedSurveys,
  responsesCount,
  totalTeams,
}: DashboardCardsProps) {
  const cards = [
    {
      title: 'Formulários Ativos',
      value: activeSurveys,
      icon: <ClipboardList className="text-blue-500" />,
    },
    {
      title: 'Formulários Fechados',
      value: closedSurveys,
      icon: <Users className="text-green-500" />,
    },
    {
      title: 'Número de Respostas',
      value: responsesCount,
      icon: <BarChart2 className="text-indigo-400" />,
    },
    {
      title: 'Times',
      value: totalTeams,
      icon: <Layers className="text-orange-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="rounded-2xl shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
