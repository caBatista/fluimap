'use client';

import { Download, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trends = [
  {
    icon: <Zap className="text-blue-600" />,
    title: 'Maior Crescimento',
    description: 'A colaboração da equipe aumentou em 13%',
  },
  {
    icon: <AlertTriangle className="text-yellow-500" />,
    title: 'Atenção necessária',
    description: 'O equilíbrio entre vida profissional e pessoal diminuiu 4%',
  },
  {
    icon: <CheckCircle className="text-muted-foreground" />,
    title: 'Métrica de Sucesso',
    description: 'Pontuação de confiança acima da meta por 3 meses',
  },
];

export function DashboardEngagement() {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tendências de engajamento da equipe</h2>
        <select className="rounded-md border bg-transparent px-2 py-1 text-sm">
          <option>Últimos 6 meses</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-2">
        {trends.map((item, index) => (
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

      <Button variant="outline" className="mt-4">
        Baixe o Relatório Completo <Download className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
