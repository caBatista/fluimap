"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Questionnaire {
  titulo: string;
  instrucoes: string;
  escala: { [key: string]: string };
  pergunta: string;
  itens: string[];
}

export default function JobMeaningPage() {
  const router = useRouter();
  const [data, setData] = useState<Questionnaire | null>(null);

  useEffect(() => {
    fetch("/job-meaning.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const handleContinue = () => {
    router.push(`/questionnaire/success`);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
    <h1 className="text-4xl font-bold mb-6">
      <span className="text-[hsl(var(--primary))]">FluiMap</span>
    </h1>
    <h2 className="text-2xl text-center font-semibold mb-4">{data?.titulo}</h2>
    <p className="max-w-2xl text-sm text-center mb-8">{data?.instrucoes}</p>
      <h3 className="text-xl font-semibold mb-6 text-[hsl(var(--primary))]">{data?.pergunta}</h3>

      <div className="w-full max-w-4xl space-y-6">
        {data?.itens.map((item, index) => (
          <div
            key={index}
            className="border p-4 rounded-xl shadow-sm bg-secondary"
          >
            <p className="font-medium mb-3">{item}</p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {Object.entries(data.escala).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={key}
                    className="accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm">{key} - {label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between w-full max-w-4xl mt-10">
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
    </div>
  );
}