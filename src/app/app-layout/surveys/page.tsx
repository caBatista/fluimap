"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SurveysHeader } from "@/components/surveys/surveys-header";
import { SearchAndFilter } from "@/components/surveys/search-and-filter";
import { SurveysTablist } from "@/components/surveys/surveys-tablist";
import { SurveyList } from "@/components/surveys/survey-list";

interface SurveyResponse {
  _id: string;
  title: string;
  description?: string;
  status?: "rascunho" | "ativo" | "fechado";
  progress?: number;
}

interface SurveysApiResponse {
  surveys: SurveyResponse[];
}

async function fetchSurveys(): Promise<SurveyResponse[]> {
  const res = await fetch("http://localhost:3000/api/surveys", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch surveys");
  const data = (await res.json()) as SurveysApiResponse;
  return data.surveys;
}

type TabType = "todos" | "ativos" | "rascunho" | "fechados";

export default function SurveysPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState<TabType>("todos");

  const { data, error, isLoading } = useQuery<SurveyResponse[], Error>({
    queryKey: ["surveys"],
    queryFn: fetchSurveys,
  });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erro: {error.message}</p>
      </div>
    );
  }

  const surveys = data ?? [];

  const filteredSurveys = surveys.filter((survey) => {
    if (activeTab === "todos") return true;
    if (activeTab === "ativos") return survey.status === "ativo";
    if (activeTab === "rascunho") return survey.status === "rascunho";
    if (activeTab === "fechados") return survey.status === "fechado";
    return true;
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="ml-[32px] mr-[76px] mt-[32px]">
        {/* Cabeçalho */}
        <SurveysHeader />

        {/* Barra de pesquisa e select de status */}
        <SearchAndFilter
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Tablist */}
        <SurveysTablist activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Lista de surveys com overflow caso tenha muitos */}
        <div className="overflow-h-auto mt-4 max-h-[calc(100vh-200px)]">
          <SurveyList
            surveys={filteredSurveys}
            search={search}
            statusFilter={statusFilter}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
}
