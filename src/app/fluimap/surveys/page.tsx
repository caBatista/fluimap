"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SurveyList } from "@/components/surveys/survey-list";
import { SurveysHeader } from "@/components/surveys/surveys-header";
import { SurveysTablist } from "@/components/surveys/surveys-tablist";
import { SearchAndFilter } from "@/components/surveys/search-and-filter";

export default function CreateSurveyPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState<"todos" | "ativo" | "fechado">("todos");

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const response = await fetch('/api/surveys');
      const json = await response.json();
      return json.surveys;
    },
  });

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <SurveysHeader />
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <SurveysTablist
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setStatusFilter={setStatusFilter}
      />
      <div className="mt-6">
        <SurveyList
          surveys={surveys}
          search={search}
          statusFilter={statusFilter}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
