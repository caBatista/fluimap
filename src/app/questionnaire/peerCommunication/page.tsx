"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function PeerCommunicationPage() {
  const searchParams = useSearchParams();
  const users = searchParams.getAll("users");
  const router = useRouter();

  const [data, setData] = useState<QuestionnaireData | null>(null);

  useEffect(() => {
    fetch("/peer-communication.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const handleContinue = () => {
    router.push(`/questionnaire/wellBeingPage`);
  };

  if (!data) return null;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>
      <h2 className="text-2xl text-center font-semibold mb-4">{data?.titulo}</h2>
      <p className="max-w-2xl text-sm text-center mb-8">{data.instrucoes}</p>

      {users.map((user, userIndex) => (
        <div key={userIndex} className="w-full max-w-4xl mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-primary">{user}</h3>

          {data.questoes.map((q, qIndex) => (
            <div key={qIndex} className="mb-6 border p-4 rounded-xl shadow-sm bg-secondary">
              <p className="font-semibold mb-3">
                {q.question.replace("{nome}", user)}
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`user-${userIndex}-q${qIndex}`}
                      value={option}
                      className="accent-[hsl(var(--primary))]"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {userIndex === users.length - 1 && (
            <div className="flex justify-between w-full mt-10">
              <Button
                className="px-8 py-4 text-base h-auto"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="px-8 py-4 text-base h-auto"
                onClick={handleContinue}
              >
                Continuar
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}