"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  question: string;
  options: string[];
}

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const users = searchParams.getAll("users");
  const router = useRouter();
  

  const handleContinue = () => {
    router.push(`/questionnaire/success`);
  };
  
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch("/questions1.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center ">
        <h1 className="text-4xl font-bold mb-6">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
        <h1 className="text-3xl font-bold mb-8 text-[hsl(var(--primary))]">Avaliação de colegas</h1>

        {users.map((user, userIndex) => (
  <div key={userIndex} className="w-full max-w-2xl mb-12">
    <h2 className="text-2xl font-semibold mb-6">{user}</h2>

    {questions.map((q, qIndex) => (
      <div key={qIndex} className="mb-6">
        <p className="font-semibold mb-2">{q.question.replace("{nome}", user)}</p>
        <div className="flex flex-wrap gap-4">
          {q.options.map((option, optIndex) => (
            <label key={optIndex} className="flex items-center gap-2">
              <input type="radio" name={`user-${userIndex}-q${qIndex}`} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    ))}

    {/* Só renderiza os botões no último grupo */}
    {userIndex === users.length - 1 && (
      <div className="flex justify-between w-full mt-8">
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