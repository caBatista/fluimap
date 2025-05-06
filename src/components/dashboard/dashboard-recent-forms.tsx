"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const forms = [
  {
    title: "Engenharia Q1 Colaboração",
    status: "Ativo",
    responses: 0,
    progress: 0,
    expires: "Expira em 5 dias",
  },
  {
    title: "Feedback de Engenharia DevOps",
    status: "Rascunho",
    responses: 0,
    progress: 0,
    expires: "Fechado em 15 de julho",
  },
  {
    title: "Validação do Roteiro do Produto",
    status: "Ativo",
    responses: 0,
    progress: 0,
    expires: "Expira em 5 dias",
  },
];

export function DashboardRecentForms() {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Formulários Recentes</h2>

      <div className="space-y-4">
        {forms.map((form, index) => (
          <div key={index} className="rounded-lg border p-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">{form.title}</h3>
              <Badge
                variant="outline"
                className={
                  form.status === "Ativo"
                    ? "bg-green-100 text-green-700 dark:bg-green-300/20 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }
              >
                {form.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{form.responses} respostas</p>

            <div className="mt-1 w-full h-2 bg-muted rounded-full">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${form.progress}%` }}
              />
            </div>

            <div className="mt-1 flex justify-between text-sm text-muted-foreground">
              <Link href="#" className="text-blue-600 hover:underline dark:text-blue-400">
                Exibir resultados
              </Link>
              <span>{form.expires}</span>
            </div>
          </div>
        ))}
      </div>

      <Link href="/fluimap/surveys" className="block mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400">
        Ver todos os formulários →
      </Link>
    </div>
  );
}
