"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { TeamModal } from "@/components/modal/teamModal";
import TeamListDialog from "./teamListDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Team = {
  _id?: string;
  name: string;
  description: string; // ← agora opcional
};

function isTeam(item: unknown): item is Team {
  return (
    typeof item === "object" &&
    item !== null &&
    "name" in item &&
    typeof (item as Record<string, unknown>).name === "string"
  );
}

function isApiTeamResponse(data: unknown): data is { teams: unknown[] } {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as { teams?: unknown }).teams)
  );
}

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      (team.description?.toLowerCase() ?? "").includes(search.toLowerCase()),
  );

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) throw new Error("Erro ao buscar times");

        const json: unknown = await res.json();
        console.log("Resposta bruta da API:", json); // ← debug

        if (!isApiTeamResponse(json)) {
          throw new Error("Formato inválido da resposta da API");
        }

        const data: Team[] = json.teams.filter(isTeam);
        console.log("Times carregados:", data);
        setTeams(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar os times");
      }
    }
    void fetchTeams();
  }, []);

  async function handleCreateTeam(name: string, description: string) {
    if (!name.trim()) {
      toast.error("O nome do time é obrigatório");
      return;
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) throw new Error("Erro ao criar time");

      const createdJson: unknown = await response.json();
      const created = (createdJson as { team?: unknown }).team;

      if (isTeam(created)) {
        setTeams((prev) => [...prev, created]);
        toast.success("Time criado com sucesso");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar time");
    }
  }

  function confirmDeleteTeam(team: Team) {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeleteTeam() {
    if (!teamToDelete?._id) return;

    try {
      const res = await fetch(`/api/teams/${teamToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir time");

      setTeams((prev) => prev.filter((t) => t._id !== teamToDelete._id));
      toast.success("Time excluído com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir o time");
    } finally {
      setTeamToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-8 mb-4 flex flex-col items-center justify-between sm:flex-row">
        <div>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Times</h1>
          <h2 className="text-sm sm:text-base">
            Gerencie suas equipes e membros de equipe
          </h2>
        </div>

        <button
          type="button"
          className="mt-4 flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white sm:mt-0"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="flex items-center justify-center rounded-full border-2 border-white bg-blue-500 p-1 text-white">
            <PlusIcon className="h-5 w-5" />
          </span>
          Criar Novo Time
        </button>
      </div>

      <div className="mb-2 w-full px-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou descrição"
          className="w-full rounded-md border border-gray-300 px-4 py-2"
        />
      </div>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Time</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja apagar este time? Os dados relacionados ao
            time serão excluídos após a confirmação.
          </p>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleDeleteTeam}
            >
              Excluir Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TeamListDialog teams={filteredTeams} onDelete={confirmDeleteTeam} />
    </div>
  );
}
