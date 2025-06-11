'use client';

import {
  Download,
  AlertTriangle,
  Zap,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface TeamAnalysis {
  analysis: string;
  trends: Array<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
  }>;
}

interface RModelData {
  nodes: Array<{
    Pessoa: string;
    Papel: string;
    Frequencia: string | number;
    Direcao?: string;
    Clareza?: number;
    Objetividade?: number;
    Efetividade?: number;
    Comunicacao?: string;
  }>;
  edges: Array<{
    Pessoa: string;
    Pessoa2: string;
    Equipe: string;
    weight: number;
  }>;
}

const getTrendIcon = (type: 'success' | 'warning' | 'info') => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-green-600" />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" />;
    case 'info':
      return <Zap className="text-blue-600" />;
    default:
      return null; // Evita erro de retorno ausente
  }
};

function stripMarkdown(text: string): string {
  return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/\*(.*?)\*/g, '$1') // italics
      .replace(/\#\s?(.*)/g, '$1') // headings
      .replace(/\n{2,}/g, '\n') // múltiplas quebras de linha
      .replace(/\n- /g, '\n• ') // listas
      .replace(/\d+\. /g, (match) => `\n${match}`) // listas numeradas
      .trim();
}

export function DashboardEngagement() {
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rModelData, setRModelData] = useState<RModelData | null>(null);

  const fetchRModelData = async () => {
    try {
      const response = await fetch('/api/r-model', { method: 'GET' });

      if (!response.ok) {
        throw new Error('Failed to fetch R model data');
      }

      const data = (await response.json()) as RModelData;
      setRModelData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const analyzeWithGemini = async () => {
    if (!rModelData) {
      setError('No R model data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/team-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rModelData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze with Gemini');
      }

      const data = (await response.json()) as TeamAnalysis;
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRModelData();
  }, []);

  return (
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Tendências de engajamento da equipe
          </h2>
          <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchRModelData()}
                disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Dados
            </Button>
            <Button
                variant="default"
                size="sm"
                onClick={() => void analyzeWithGemini()}
                disabled={loading || !rModelData}
            >
              Analisar com IA
            </Button>
          </div>
        </div>

        {loading && (
            <div className="mb-4 rounded-lg border bg-muted/50 p-3">
              <p className="text-sm">Analisando dados com IA...</p>
            </div>
        )}

        {error && (
            <div className="mb-4 rounded-lg border bg-red-50 p-3">
              <p className="text-sm text-red-600">Erro: {error}</p>
            </div>
        )}

        {analysis?.analysis && (
            <div className="mb-4 rounded-lg border bg-muted/70 p-5">
              <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
                {stripMarkdown(analysis.analysis)}
              </p>
            </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:gap-2">
          {analysis?.trends.map((item, index) => (
              <div
                  key={index}
                  className="flex flex-1 items-start gap-2 rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="mt-1">{getTrendIcon(item.type)}</div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
          ))}
        </div>

        <Button variant="outline" className="mt-6 w-full md:w-auto">
          Baixe o Relatório Completo <Download className="ml-2 h-4 w-4" />
        </Button>
      </div>
  );
}
