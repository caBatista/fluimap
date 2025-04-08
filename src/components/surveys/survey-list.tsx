"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SurveyResponse = {
  _id: string;
  title: string;
  description?: string;
  status?: "ativo" | "rascunho" | "fechado";
  progress?: number;
  responsesCount?: number;
  expiresInDays?: number;
};

export interface SurveyListProps {
  surveys: SurveyResponse[];
  search: string;
  statusFilter: string;
  isLoading: boolean;
}

function getBadgeClasses(status: SurveyResponse["status"]): string {
  switch (status) {
    case "ativo":
      return "bg-[hsl(var(--badge-active-bg))] text-[hsl(var(--badge-active-text))]";
    case "rascunho":
      return "bg-[hsl(var(--badge-gray-bg))] text-[hsl(var(--badge-gray-text))]";
    case "fechado":
      return "bg-[hsl(var(--badge-gray-bg))] text-[hsl(var(--badge-gray-text))]";
    default:
      return "";
  }
}

function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SurveyList({
  surveys,
  search,
  statusFilter,
  isLoading,
}: SurveyListProps) {
  let finalSurveys = surveys;
  if (!surveys || surveys.length === 0) {
    finalSurveys = [
      {
        _id: "ex1",
        title: "Engenharia Q1 Colaboração",
        status: "ativo",
        progress: 40,
        responsesCount: 0,
        expiresInDays: 5,
      },
      {
        _id: "ex2",
        title: "Feedback de Marketing Q1",
        status: "rascunho",
        progress: 0,
        responsesCount: 0,
        expiresInDays: 10,
      },
      {
        _id: "ex3",
        title: "Validação do Produto",
        status: "fechado",
        progress: 100,
        responsesCount: 12,
        expiresInDays: 0,
      },
    ];
  }

  const filtered = finalSurveys.filter((survey) => {
    const matchesSearch = survey.title
      .toLowerCase()
      .includes(search.toLowerCase());
    if (statusFilter === "todos") return matchesSearch;
    return matchesSearch && survey.status === statusFilter;
  });

  if (isLoading) {
    return <p className="text-[hsl(var(--muted-foreground))]">Carregando...</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="text-[hsl(var(--muted-foreground))]">
        Nenhum formulário encontrado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[29px] md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((survey) => {
        const progressValue = survey.progress ?? 0;
        const statusText: "ativo" | "rascunho" | "fechado" =
          survey.status ?? "ativo";

        return (
          <Card
            key={survey._id}
            // Medidas do card: 364 × 138
            className="relative h-[138px] w-[364px] rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-4 shadow-sm"
          >
            {/* Linha superior: Título e Badge de status */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sml font-semibold text-[hsl(var(--foreground))]">
                  {survey.title}
                </h2>
                {/* 
                  <p className="text-sml text-[hsl(var(--muted-foreground))]">
                    {survey.description ?? "Sem descrição"}
                  </p>
                */}
              </div>
              <Badge
                variant="default"
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  getBadgeClasses(statusText),
                )}
              >
                {capitalize(statusText)}
              </Badge>
            </div>

            {/* Número de respostas */}
            <p className="mt-[5px] text-xs text-[hsl(var(--muted-foreground))]">
              {survey.responsesCount ?? 0} respostas
            </p>

            {/* Barra de progresso + percentual */}
            <div className="mb-[16px] mt-2 flex items-center gap-2">
              <Progress
                value={progressValue}
                className="h-[8px] w-[189px] rounded-full bg-[hsl(var(--input))]"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {progressValue}%
              </span>
            </div>

            {/* Rodapé: Exibir respostas + data de expiração */}
            <div className="mt-2 flex items-center justify-between">
              <Link
                href={`/surveys/${survey._id}`}
                className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
              >
                Exibir respostas
              </Link>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Expira em {survey.expiresInDays ?? 5} dias
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
