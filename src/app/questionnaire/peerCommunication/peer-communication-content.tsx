'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';

interface QuestionItem {
  question: string;
  options: string[];
}

interface QuestionnaireRaw {
  _id: string;
  name: string;
  instructions: string;
  section: string;
  questions: Array<{ text: string; options: { value: string; label: string }[] }>;
}
interface QuestionnaireData {
  questionnaireId: string;
  titulo: string;
  instrucoes: string;
  pergunta: string;
  questoes: QuestionItem[];
}

export function PeerCommunicationContent() {
  const searchParams = useSearchParams();
  const users = searchParams.getAll('users');
  const rawSurveyId = searchParams.get('surveyId');
  const rawEmail = searchParams.get('email');

  if (!rawSurveyId || rawSurveyId === 'null' || !rawEmail || rawEmail === 'null') {
    throw new Error('Parâmetros surveyId/email não definidos');
  }

  const surveyId = rawSurveyId;
  const email = rawEmail;

  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery<QuestionnaireData>({
    queryKey: ['peer-communication', surveyId],
    queryFn: async () => {
      const res = await fetch('/api/questionnaires');
      if (!res.ok) throw new Error('Erro ao carregar questionários');

      const body = (await res.json()) as { questionnaires: QuestionnaireRaw[] };
      const qp = body.questionnaires.find((q) => q.section === 'communicationPeers');
      if (!qp) throw new Error('Questionário de comunicação não encontrado');

      return {
        questionnaireId: qp._id,
        titulo: qp.name,
        instrucoes: qp.instructions,
        pergunta: '',
        questoes: qp.questions.map((q) => ({
          question: q.text,
          options: q.options.map((o) => o.label),
        })),
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Dados do questionário ausentes');
      const payload = {
        surveyId,
        questionnaireId: data.questionnaireId,
        email,
        answers,
      };
      console.log('Payload enviado para /api/responses:', payload);
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        type ZodIssue = {
          path: (string | number)[];
          message: string;
          code: string;
        };

        const err = (await res.json()) as { error: ZodIssue[] };
        console.error('Erro de envio:', err);
        throw new Error('Erro ao enviar respostas');
      }
    },
    onSuccess: () => {
      router.push(
        `/questionnaire/wellBeing?surveyId=${encodeURIComponent(surveyId)}&email=${encodeURIComponent(email)}`
      );
    },
  });

  const handleAnswer = (userIndex: number, questionIndex: number, value: string) => {
    const key = `user-${userIndex}-q${questionIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    mutation.mutate();
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
      <h2 className="mb-4 text-center text-2xl font-semibold">{data.titulo}</h2>
      <p className="mb-8 max-w-2xl text-center text-sm">{data.instrucoes}</p>

      {users.map((user, userIndex) => (
        <div key={userIndex} className="mb-12 w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-primary">{user}</h3>

          {data.questoes.map((q, qIndex) => {
            const questionKey = `user-${userIndex}-q${qIndex}`;
            return (
              <div key={qIndex} className="mb-6 rounded-xl border bg-background p-4 shadow-sm">
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
