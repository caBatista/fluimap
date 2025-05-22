'use client';

import { Button } from '@/components/ui/button';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Questionnaire {
  titulo: string;
  instrucoes: string;
  escala: Record<string, string>;
  pergunta: string;
  itens: string[];
}

export default function WellBeingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawSurveyId = params.surveyId as string;
  const respondeeId = params.respondeeId as string;
  const rawEmail = searchParams.get('email');

  if (!rawSurveyId || rawSurveyId === 'null' || !rawEmail || rawEmail === 'null') {
    throw new Error('Parâmetros surveyId/email não definidos');
  }

  const surveyId = rawSurveyId;
  const email = rawEmail;
  const router = useRouter();
  const { data, isLoading, error } = useQuery<Questionnaire>({
    queryKey: ['well-being'],
    queryFn: async () => {
      const res = await fetch('/well-being.json');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json() as Promise<Questionnaire>;
    },
  });

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
        `/questionnaire/${surveyId}/${respondeeId}/jobMeaning?surveyId=${encodeURIComponent(surveyId)}&email=${encodeURIComponent(email)}`
      );
    },
  });

  const handleAnswer = (idx: number, value: string) => {
    const key = `question-${idx}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  //   const totalQuestions = data?.itens.length || 0;
  //   const allAnswered = Object.keys(answers).length === totalQuestions;

  //   const handleContinue = () => {
  //     if (!allAnswered) {
  //       alert('Por favor, responda todas as perguntas antes de continuar.');
  //       return;
  //     }
  //     router.push(`/questionnaire/jobMeaning`);
  //   };

  const handleContinue = () => {
    router.push(`/questionnaire/jobMeaning`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      {/* Loading and error states */}
      {isLoading && <div>Carregando...</div>}
      {error && <div>Erro ao carregar dados.</div>}
      {/* Only render the rest if data is available */}
      {data && (
        <>
          <h1 className="mb-6 text-4xl font-bold">
            <span className="text-[hsl(var(--primary))]">FluiMap</span>
          </h1>
          <h2 className="mb-4 text-center text-2xl font-semibold">{data.titulo}</h2>
          <p className="mb-8 max-w-2xl text-center text-sm">{data.instrucoes}</p>
          <h3 className="mb-6 text-xl font-semibold text-[hsl(var(--primary))]">{data.pergunta}</h3>

          <div className="w-full max-w-4xl space-y-6">
            {data.itens.map((item, index) => (
              <div key={index} className="rounded-xl border bg-secondary p-4 shadow-sm">
                <p className="mb-3 font-medium">{item}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {Object.entries(data.escala).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={key}
                        className="accent-[hsl(var(--primary))] hover:cursor-pointer"
                        checked={answers[`question-${index}`] === key}
                        onChange={() => handleAnswer(index, key)}
                      />
                      <span className="text-sm">
                        {key} - {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex w-full max-w-4xl justify-between">
            <Button
              className="h-auto px-8 py-4 text-base"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="h-auto px-8 py-4 text-base"
              onClick={handleContinue}
              // disabled={!allAnswered}
            >
              Continuar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
