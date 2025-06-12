'use client';

// import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Info } from 'lucide-react';

interface TeamAnalysis {
  analysis: string;
}

interface DashboardEngagementProps {
  surveyId?: string;
}

export function DashboardEngagement({ surveyId }: DashboardEngagementProps) {
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseType[]>([]);

  useEffect(() => {
    setAnalysis(null);
  }, [surveyId]);

  // Automatically analyze when responses are loaded and analysis is not set
  useEffect(() => {
    if (!loading && responses.length > 0 && !analysis) {
      void analyzeWithGemini();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, analysis, loading]);

  interface ResponseType {
    surveyId: string;
    questionnaireId: string;
    email: string;
    answersByUser: Array<{
      name: string;
      answers: Record<string, string>;
    }>;
    createdAt?: string;
    updatedAt?: string;
  }

  const fetchResponses = useCallback(async (surveyId?: string) => {
    if (!surveyId) {
      setResponses([]);
      return;
    }
    try {
      const res = await fetch(`/api/responses?surveyId=${surveyId}`);
      if (res.ok) {
        const data = (await res.json()) as unknown;

        if (
          typeof data === 'object' &&
          data !== null &&
          'responses' in data &&
          Array.isArray((data as { responses?: unknown[] }).responses)
        ) {
          setResponses((data as { responses: ResponseType[] }).responses);
        } else {
          setResponses([]);
        }
      } else {
        setResponses([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar respostas');
      setResponses([]);
    }
  }, []);

  const analyzeWithGemini = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/team-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
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
    void fetchResponses(surveyId);
  }, [surveyId, fetchResponses]);

  return (
    <div className="flex max-h-[560px] min-h-[560px] flex-col rounded-xl border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Tendências de engajamento da equipe</h2>
      </div>
      {/* Analysis is now automatic, no button needed */}

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <Info className="mb-4 h-10 w-10 animate-spin text-blue-400" />
          <p className="mb-2 text-lg font-semibold text-muted-foreground">
            Analisando dados com IA...
          </p>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto processamos as respostas para gerar o resumo de engajamento.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border bg-red-50 p-3">
          <p className="text-sm text-red-600">Erro: {error}</p>
        </div>
      )}

      {responses.length === 0 && !loading && !error && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Info className="mb-4 h-10 w-10 text-blue-400" />
          <p className="text-lg font-semibold">Nenhuma resposta recebida ainda</p>
          <p className="text-sm">
            Assim que as respostas forem recebidas, a análise de engajamento da equipe será exibida
            aqui.
          </p>
        </div>
      )}

      {responses.length > 0 && analysis?.analysis && (
        <div className="markdown flex-1 overflow-y-auto pr-2">
          <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
        </div>
      )}
      {/* Removed invalid useEffect from render */}
    </div>
  );
}
