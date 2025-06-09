'use client';

import { Download, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardEngagementProps {
  activeSurveys: number;
  closedSurveys: number;
}

const calculateIndicators = (activeSurveys: number, closedSurveys: number) => {
  const totalSurveys = activeSurveys + closedSurveys;
  const completionRate = totalSurveys > 0 ? ((closedSurveys / totalSurveys) * 100).toFixed(1) : '0';

  return [
    {
      icon: <CheckCircle className="text-green-600" />,
      title: 'Taxa de Conclusão',
      description: `A equipe concluiu ${completionRate}% das pesquisas.`,
    },
    {
      icon: <Zap className="text-blue-600" />,
      title: 'Atividade Total',
      description: `Um total de ${totalSurveys} pesquisas foram criadas.`,
    },
  ];
};

export function DashboardEngagement({ activeSurveys, closedSurveys }: DashboardEngagementProps) {
  const indicators = calculateIndicators(activeSurveys, closedSurveys);

  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tendências de engajamento da equipe</h2>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-2">
        {indicators.map((item, index) => (
          <div
            key={index}
            className="flex flex-1 items-start gap-2 rounded-lg border p-3 shadow-sm"
          >
            <div className="mt-1">{item.icon}</div>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
