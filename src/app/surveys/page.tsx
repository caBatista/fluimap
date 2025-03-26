"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, PlusCircle, ChevronDown } from "lucide-react";
import type { SurveyType } from "@/models/Survey";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type SurveyResponse = SurveyType & { _id: string };
interface SurveysApiResponse {
  surveys: SurveyResponse[];
}

async function fetchSurveys(): Promise<SurveyResponse[]> {
  const res = await fetch("http://localhost:3000/api/surveys", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = (await res.json()) as SurveysApiResponse;
  return data.surveys;
}

export default function SurveysPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [activeTab, setActiveTab] = useState<
    "todos" | "ativos" | "rascunho" | "fechados"
  >("todos");

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
      <div className="ml-[32px] mr-[77px] mt-[32px]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h-[32px] w-[141px] text-2xl font-bold">
              Formulário
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Crie, gerencie e analise seus formulários de equipe
            </p>
          </div>
          <div className="mb-[32px] mt-[40px]">
            <Link href="/surveys/create">
              <Button className="flex h-[40px] w-[190px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90">
                <PlusCircle className="h-4 w-4" />
                Criar novo Formulário
              </Button>
            </Link>
          </div>
        </div>

        {/* Barra de pesquisa e filtro */}
        <div className="mt-[24px] flex h-[74px] w-[1147px] items-center gap-[17px] rounded-[8px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-[17px]">
          {/* Input de pesquisa */}
          <div className="relative h-[40px] w-[869px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Pesquisar formulário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 text-sm"
            />
          </div>
          {/* Dropdown de filtro */}
          <div className="relative h-[40px] w-[227px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-full w-full items-center justify-between rounded-[6px] border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-[13px] pr-2 text-sm font-normal text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span>
                      {statusFilter === "todos"
                        ? "Todos os status"
                        : statusFilter}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="z-50 mt-1 min-w-[227px] rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-1 text-sm font-normal text-[hsl(var(--foreground))] shadow-md"
              >
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Todos os status")}
                  className="cursor-pointer rounded-sm px-8 py-2 hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:bg-[hsl(var(--muted))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  Todos os status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Ativo")}
                  className="cursor-pointer rounded-sm px-8 py-2 hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:bg-[hsl(var(--muted))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  Ativo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Fechado")}
                  className="cursor-pointer rounded-sm px-8 py-2 hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:bg-[hsl(var(--muted))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  Fechado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Rascunho")}
                  className="cursor-pointer rounded-sm px-8 py-2 hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:bg-[hsl(var(--muted))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  Rascunho
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Em processo")}
                  className="cursor-pointer rounded-sm px-8 py-2 hover:text-[hsl(var(--foreground))] focus:text-[hsl(var(--foreground))] data-[highlighted]:bg-[hsl(var(--muted))] data-[highlighted]:text-[hsl(var(--foreground))]"
                >
                  Em processo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Abas de filtro */}
        <div className="mt-[24px] h-[40px] w-[325px] rounded-[6px] bg-[hsl(var(--muted))] p-1">
          <ul className="gap-0.4 mt-[12px] flex h-[8px] items-center text-sm text-[hsl(var(--muted-foreground))]">
            <li>
              <button
                onClick={() => setActiveTab("todos")}
                className={cn(
                  "h-[32px] w-[61px] cursor-pointer rounded-[4px] px-2 py-1 leading-none",
                  activeTab === "todos"
                    ? "m-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    : "m-1 bg-transparent",
                )}
              >
                Todos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("ativos")}
                className={cn(
                  "h-[32px] w-[61px] cursor-pointer rounded-[4px] px-2 py-1 leading-none",
                  activeTab === "ativos"
                    ? "m-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    : "m-1 bg-transparent",
                )}
              >
                Ativos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("rascunho")}
                className={cn(
                  "h-[32px] w-[73px] cursor-pointer rounded-[4px] px-2 py-1 leading-none",
                  activeTab === "rascunho"
                    ? "m-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    : "m-1 bg-transparent",
                )}
              >
                Fechado
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("fechados")}
                className={cn(
                  "h-[32px] w-[80px] cursor-pointer rounded-[4px] px-2 py-1 leading-none",
                  activeTab === "fechados"
                    ? "m-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    : "m-1 bg-transparent",
                )}
              >
                Rascunho
              </button>
            </li>
          </ul>
        </div>

        {/* Lista de Cards */}
        <div className="mt-6">
          {isLoading ? (
            <p className="text-[hsl(var(--muted-foreground))]">Carregando...</p>
          ) : filteredSurveys.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))]">
              Nenhum formulário encontrado.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSurveys.map((survey) => (
                <Card
                  key={survey._id}
                  className="rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-4 shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-[hsl(var(--foreground))]">
                      {survey.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-[hsl(var(--muted-foreground))]">
                      {survey.description ?? "Sem descrição"}
                    </p>
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      {survey.status || "Ativo"}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        0%
                      </span>
                      <Link
                        href={`/surveys/${survey._id}`}
                        className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                      >
                        Exibir respostas
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
