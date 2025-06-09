'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Users, BarChart2, Star } from 'lucide-react';

interface DashboardCardsProps {
  activeSurveys: number;
  closedSurveys: number;
  surveyId?: string;
}

export function DashboardCards({ activeSurveys, closedSurveys, surveyId }: DashboardCardsProps) {
  const [responseCount, setResponseCount] = useState<number>(0);

  useEffect(() => {
    async function fetchResponseCount() {
      if (!surveyId) return;

      try {
        const responsesResponse = await fetch(`/api/responses?surveyId=${surveyId}`);
        const responsesData = await responsesResponse.json();

        if (responsesData.count !== undefined) {
          setResponseCount(responsesData.count);
        }
      } catch (error) {
        console.error('Erro ao buscar taxa de resposta:', error);
      }
    }

    fetchResponseCount();
  }, [surveyId]);

  const cards = [
    {
      title: 'Formulários Ativos',
      value: activeSurveys,
      icon: <ClipboardList className="text-blue-500" />,
      // trend: '+12%',
      // trendDescription: 'do mês passado',
      // trendColor: 'text-green-500',
    },
    {
      title: 'Formulários Fechados',
      value: closedSurveys,
      icon: <Users className="text-green-500" />,
      // trend: '+3%',
      // trendDescription: 'novos times',
      // trendColor: 'text-green-500',
    },
    {
      title: 'Número de Respostas',
      value: responseCount,
      icon: <BarChart2 className="text-indigo-400" />,
      // trend: '+7%',
      // trendDescription: 'da pesquisa anterior',
      // trendColor: 'text-green-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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
            {/* <p className={`mt-2 text-sm ${card.trendColor}`}>
              {card.trend} <span className="text-muted-foreground">{card.trendDescription}</span>
            </p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
