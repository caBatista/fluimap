'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Questionnaire {
  _id: string;
  name: string;
  instructions: string;
  section: string;
  questions: Array<{
    text: string;
    options: { value: string; label: string }[];
  }>;
}

type PartialResponses = Array<{
  section: string;
  answersByUser: {
    name: string;
    answers: Record<string, string>;
  }[];
}>;

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function JobMeaningClient() {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('surveyId') ?? '';
  const email = searchParams.get('email') ?? '';

  if (!surveyId || !email) {
    throw new Error('Parâmetros surveyId/email não definidos');
  }

  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery<Questionnaire>({
    queryKey: ['jobMeaning', surveyId],
    queryFn: async () => {
      const res = await fetch('/api/questionnaires');
      if (!res.ok) throw new Error('Erro ao carregar questionários');

      const { questionnaires } = (await res.json()) as {
        questionnaires: Questionnaire[];
      };

      const qm = questionnaires.find((q) => q.section === 'jobMeaning');
      if (!qm) throw new Error('Questionário “jobMeaning” não encontrado');

      return qm;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Dados do questionário ausentes');

      const currentAnswers = {
        section: 'jobMeaning',
        answersByUser: [{ name: email, answers }],
      };

      const previousRaw = sessionStorage.getItem('partialResponses');
      const previous = safeJsonParse<PartialResponses>(previousRaw, []);

      const allSections: PartialResponses = [...previous, currentAnswers];

      const payload = {
        surveyId,
        questionnaireId: data._id,
        email,
        answersByUser: allSections.flatMap((entry) => entry.answersByUser),
      };

      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao enviar respostas');

      sessionStorage.removeItem('partialResponses');
    },
    onSuccess: () => {
      router.push('/questionnaire/success');
    },
  });

  const handleAnswer = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [`question-${questionIndex}`]: value }));
  };

  const handleContinue = () => {
    if (!data) return;

    const allAnswered = data.questions.every((_, idx) => answers[`question-${idx}`]);
    if (!allAnswered) {
      alert('Por favor, responda todas as perguntas antes de continuar.');
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">Carregando questionário…</div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Erro ao carregar o questionário
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="mb-6 text-4xl font-bold">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>

      <h2 className="mb-4 text-center text-2xl font-semibold">{data.name}</h2>
      <p className="mb-8 max-w-2xl text-center text-sm">{data.instructions}</p>

      <div className="w-full max-w-4xl space-y-6">
        {data.questions.map((q, idx) => (
          <div key={idx} className="rounded-xl border bg-background p-4 shadow-sm">
            <p className="mb-3 font-medium">{q.text}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {q.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={opt.value}
                    className="accent-[hsl(var(--primary))] hover:cursor-pointer"
                    checked={answers[`question-${idx}`] === opt.value}
                    onChange={() => handleAnswer(idx, opt.value)}
                  />
                  <span className="text-sm">
                    {opt.value} – {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-[80px] mt-10 flex w-full max-w-4xl justify-between pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="outline"
          className="h-auto px-8 py-4 text-base"
          onClick={() => router.back()}
        >
          Voltar
        </Button>

        <Button variant="default" className="h-auto px-8 py-4 text-base" onClick={handleContinue}>
          Finalizar
        </Button>
      </div>
    </div>
  );
}
