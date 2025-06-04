'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Users, BarChart2, Star } from 'lucide-react';

interface DashboardCardsProps {
  activeTab: number;
  totalTeams: number;
  recentSurvey: number;
}

export function DashboardCards({ activeTab, totalTeams, recentSurvey }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Formulários Ativos',
      value: activeTab,
      icon: <ClipboardList className="text-blue-500" />,
      trend: '+12%',
      trendDescription: 'do mês passado',
      trendColor: 'text-green-500',
    },
    {
      title: 'Membros da equipe',
      value: totalTeams,
      icon: <Users className="text-green-500" />,
      trend: '+3%',
      trendDescription: 'Novos Membros',
      trendColor: 'text-green-500',
    },
    {
      title: 'Taxa de Resposta',
      value: recentSurvey,
      icon: <BarChart2 className="text-indigo-400" />,
      trend: '+7%',
      trendDescription: 'da pesquisa anterior',
      trendColor: 'text-green-500',
    },
    {
      title: 'Pontuação de engajamento',
      value: '7.8',
      icon: <Star className="text-yellow-500" />,
      trend: '-2%',
      trendDescription: 'do último trimestre',
      trendColor: 'text-red-500',
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
            <p className={`mt-2 text-sm ${card.trendColor}`}>
              {card.trend} <span className="text-muted-foreground">{card.trendDescription}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
