'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';

interface QuestionItem {
  question: string;
  options: string[];
}

interface QuestionnaireData {
  titulo: string;
  instrucoes: string;
  pergunta: string;
  questoes: QuestionItem[];
}

export function PeerCommunicationContent() {
  const searchParams = useSearchParams();
  const users = searchParams.getAll('users');
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch questionnaire data with React Query
  const { data, isLoading, error } = useQuery<QuestionnaireData>({
    queryKey: ['peer-communication'],
    queryFn: async () => {
      const res = await fetch('/peer-communication.json');
      if (!res.ok) throw new Error('Erro ao carregar o questionário');
      return res.json() as Promise<QuestionnaireData>;
    },
  });

  // Mutation for submitting answers
  const mutation = useMutation({
    mutationFn: async (payload: { answers: Record<string, string>; users: string[] }) => {
      const res = await fetch('/api/peer-communication-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao enviar respostas');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res.json();
    },
    onSuccess: () => {
      void router.push(`/questionnaire/wellBeingPage`);
    },
  });

  const handleAnswer = (userIndex: number, questionIndex: number, value: string) => {
    const key = `user-${userIndex}-q${questionIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    router.push(`/questionnaire/wellBeingPage`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando questionário...
      </div>
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
      <h2 className="mb-4 text-center text-2xl font-semibold">{data?.titulo}</h2>
      <p className="mb-8 max-w-2xl text-center text-sm">{data.instrucoes}</p>

      {users.map((user, userIndex) => (
        <div key={userIndex} className="mb-12 w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-primary">{user}</h3>

          {data.questoes.map((q, qIndex) => {
            const questionKey = `user-${userIndex}-q${qIndex}`;
            return (
              <div key={qIndex} className="mb-6 rounded-xl border bg-secondary p-4 shadow-sm">
                <p className="mb-3 font-semibold">{q.question.replace('{nome}', user)}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {q.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={questionKey}
                        value={option}
                        className="accent-[hsl(var(--primary))] hover:cursor-pointer"
                        checked={answers[questionKey] === option}
                        onChange={() => handleAnswer(userIndex, qIndex, option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {userIndex === users.length - 1 && (
            <div className="mt-10 flex w-full justify-between">
              <Button
                className="h-auto px-8 py-4 text-base"
                variant="outline"
                onClick={() => router.back()}
                disabled={mutation.status === 'pending'}
              >
                Cancelar
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
          )}
        </div>
      ))}
    </div>
  );
}
