'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface QuestionnaireRaw {
  _id: string;
  name: string;
  instructions: string;
  section: string;
  questions: Array<{
    text: string;
    options: { value: string; label: string }[];
  }>;
}

interface WellBeingData {
  questionnaireId: string;
  titulo: string;
  instrucoes: string;
  escala: Record<string, string>;
  itens: string[];
}

export default function WellBeingPage() {
  const searchParams = useSearchParams();
  const rawSurveyId = searchParams.get('surveyId');
  const rawEmail = searchParams.get('email');

  if (!rawSurveyId || rawSurveyId === 'null' || !rawEmail || rawEmail === 'null') {
    throw new Error('Parâmetros surveyId/email não definidos');
  }

  const surveyId = rawSurveyId;
  const email = rawEmail;
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery<WellBeingData>({
    queryKey: ['well-being', surveyId],
    queryFn: async (): Promise<WellBeingData> => {
      const res = await fetch('/api/questionnaires');
      if (!res.ok) throw new Error('Erro ao carregar questionários');

      const body = (await res.json()) as { questionnaires: QuestionnaireRaw[] };
      const wbRaw = body.questionnaires.find((q) => q.section === 'wellBeing');
      if (!wbRaw) throw new Error('Questionário “wellBeing” não encontrado');

      const questions = wbRaw.questions;
      if (!questions || questions.length === 0)
        throw new Error('Questionário “wellBeing” sem perguntas');

      const escala = questions[0]!.options.reduce<Record<string, string>>((acc, o) => {
        acc[o.value] = o.label;
        return acc;
      }, {});

      const itens = questions.map((q) => q.text);

      return {
        questionnaireId: wbRaw._id,
        titulo: wbRaw.name,
        instrucoes: wbRaw.instructions,
        escala,
        itens,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Dados do questionário ausentes');

      const currentAnswers = {
        section: 'wellBeing',
        answersByUser: [
          {
            name: email,
            answers: answers,
          },
        ],
      };

      const previousRaw = sessionStorage.getItem('partialResponses');
      let previous: { section: string; answersByUser: Record<string, string>[] }[] = [];
      try {
        previous = previousRaw
          ? (JSON.parse(previousRaw) as {
              section: string;
              answersByUser: Record<string, string>[];
            }[])
          : [];
      } catch (e) {
        console.error('Erro ao parsear partialResponses do sessionStorage:', e);
        previous = [];
      }

      const allSections = Array.isArray(previous)
        ? [...previous, currentAnswers]
        : [previous, currentAnswers];

      sessionStorage.setItem('partialResponses', JSON.stringify(allSections));
    },
    onSuccess: () => {
      router.push(
        `/questionnaire/jobMeaning?surveyId=${encodeURIComponent(surveyId)}&email=${encodeURIComponent(email)}`
      );
    },
  });

  const handleAnswer = (idx: number, value: string) => {
    const key = `question-${idx}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    if (!data) return;

    const allAnswered = data.itens.every((_, index) => answers[`question-${index}`]);
    if (!allAnswered) {
      alert('Por favor, responda todas as perguntas antes de continuar.');
      return;
    }

    mutation.mutate();
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }
  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Erro ao carregar dados!
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="mb-6 text-4xl font-bold">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>
      <h2 className="mb-4 text-center text-2xl font-semibold">{data.titulo}</h2>
      <p className="mb-8 max-w-2xl text-center text-sm">{data.instrucoes}</p>

      <div className="w-full max-w-4xl space-y-6">
        {data.itens.map((item, idx) => (
          <div key={idx} className="rounded-xl border bg-background p-4 shadow-sm">
            <p className="mb-3 font-medium">{item}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {Object.entries(data.escala).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={value}
                    className="accent-[hsl(var(--primary))] hover:cursor-pointer"
                    checked={answers[`question-${idx}`] === value}
                    onChange={() => handleAnswer(idx, value)}
                  />
                  <span className="text-sm">
                    {value} – {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex w-full max-w-4xl justify-between">
        <Button
          variant="outline"
          className="h-auto px-8 py-4 text-base"
          onClick={() => router.back()}
          disabled={mutation.status === 'pending'}
        >
          Voltar
        </Button>
        <Button
          variant="default"
          className="h-auto px-8 py-4 text-base"
          onClick={handleContinue}
          disabled={mutation.status === 'pending'}
        >
          {mutation.status === 'pending' ? 'Enviando...' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
