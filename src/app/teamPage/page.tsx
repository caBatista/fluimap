"use client";

import { TeamModal } from "@/components/modal/teamModal";
import { useState } from "react";
import TeamListDialog from "./teamListDialog";
import { PlusIcon } from "lucide-react";

export default function TeamPage() {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [teams] = useState([
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

  function handleCreateTeam(teamName: string, teamDescription: string) {
    console.log("Criando time:", teamName, teamDescription);
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Cabeçalho */}
      <div className="mx-2 mb-4 flex flex-col items-center justify-between sm:flex-row">
        <div>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Times</h1>
          <h2 className="text-sm sm:text-base">
            Gerencie suas equipes e membros de equipe
          </h2>
        </div>

        {/* Botão Criar Novo Time */}
        <button
          className="mt-4 flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white sm:mt-0"
          onClick={() => setIsTeamModalOpen(true)}
        >
          <span className="flex items-center justify-center rounded-full border-2 border-white bg-blue-500 p-1 text-white">
            <PlusIcon className="h-5 w-5" />
          </span>
          Criar Novo Time
        </button>
      </div>

      {/* Campo de busca */}
      <div className="mb-4 ml-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome ou descrição"
          className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2"
        />
      </div>

      {/* Modal para criar novo time */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      {/* Lista de times */}
      <TeamListDialog teams={filteredTeams}></TeamListDialog>
    </div>
  );
}
