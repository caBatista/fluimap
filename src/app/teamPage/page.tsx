"use client";

import { useState } from "react";
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
  name: string;
  description: string;
};

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>([
    { name: "Lockman, Hane and Huel", description: "Descrição da Equipe A" },
    {
      name: "Walter, Gottlieb and Conroy",
      description: "Descrição da Equipe B",
    },
    { name: "Reynolds - Johnston", description: "Descrição da Equipe C" },
    { name: "Gulgowski - Olson", description: "Descrição da Equipe D" },
    { name: "Bogisich Inc", description: "Descrição da Equipe E" },
    { name: "Gaylord Inc", description: "Descrição da Equipe F" },
  ]);

  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.description.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreateTeam(name: string, description: string) {
    if (!name.trim()) {
      toast.error("O nome do time é obrigatório");
      return;
    }

    const newTeam: Team = { name, description };
    setTeams((prev) => [...prev, newTeam]);
    toast.success("Time criado com sucesso");
    setIsModalOpen(false);
  }

  function confirmDeleteTeam(team: Team) {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteTeam() {
    if (!teamToDelete) return;

    try {
      setTeams((prev) => prev.filter((t) => t.name !== teamToDelete.name));
      toast.success("Time excluído com sucesso");
    } catch {
      toast.error("Erro ao excluir o time");
    } finally {
      setTeamToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* Cabeçalho */}
      <div className="mx-8 mb-4 flex flex-col items-center justify-between sm:flex-row">
        <div>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Times</h1>
          <h2 className="text-sm sm:text-base">
            Gerencie suas equipes e membros de equipe
          </h2>
        </div>

        <button
          className="mt-4 flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white sm:mt-0"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="flex items-center justify-center rounded-full border-2 border-white bg-blue-500 p-1 text-white">
            <PlusIcon className="h-5 w-5" />
          </span>
          Criar Novo Time
        </button>
      </div>

      {/* Campo de busca */}
      <div className="mb-2 w-full px-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou descrição"
          className="w-full rounded-md border border-gray-300 px-4 py-2"
        />
      </div>

      {/* Modal de criação de time */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      {/* Modal de confirmação de exclusão */}
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

      {/* Lista de times */}
      <TeamListDialog teams={filteredTeams} onDelete={confirmDeleteTeam} />
    </div>
  );
}
