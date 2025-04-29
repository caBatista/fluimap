'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Questionnaire {
  titulo: string;
  instrucoes: string;
  escala: Record<string, string>;
  pergunta: string;
  itens: string[];
}

export default function WellBeingPage() {
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

  const handleAnswer = (questionIndex: number, value: string) => {
    const key = `question-${questionIndex}`;
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
