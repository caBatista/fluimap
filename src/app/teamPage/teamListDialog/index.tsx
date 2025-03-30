"use client";

import { Cards } from "@/components/cards";
//import { MemberModal } from "@/components/modal/memberModal";
import { MemberModal } from "@/components/modal/memberModal";
import { useState } from "react";
//import { type ITeam } from "@/models/Team";

interface Team {
  name: string;
  description: string;
}

interface TeamListProps {
  teams: Team[];
}

export default function TeamlistProps({ teams }: TeamListProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  /**
    const [teamsState, setTeamsState] = useState<Team[]>(teams); // Gerenciar os times no estado local
    const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null); // Controla qual time está sendo editado
    const [newTeamName, setNewTeamName] = useState(""); // Armazena o novo nome do time
   */
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null); // Armazena o time selecionado

  function handleAddMember(
    memberName: string,
    memberEmail: string,
    memberPosition: string,
  ) {
    console.log("Adicionando membro:", memberName, memberEmail, memberPosition);
  }
  /**
    function handleSetTeamName(index: number) {
    if (newTeamName.trim() !== "") {
      const updatedTeams = [...teamsState];
      updatedTeams[index].name = newTeamName; // Atualiza o nome do time no índice correspondente
      setTeamsState(updatedTeams);
      setEditingTeamIndex(null); // Fecha o campo de edição
      setNewTeamName(""); // Limpa o campo de nome do time
    }
  }

  function handleDeleteTeam(index: number) {
    const updatedTeams = teamsState.filter((_, i) => i !== index); // Filtra o time a ser excluído
    setTeamsState(updatedTeams); // Atualiza o estado com a lista de times filtrada
  }
 
 */

  const openModal = (team: Team) => {
    setSelectedTeam(team); // Define o time selecionado
    setIsMemberModalOpen(true); // Abre a modal
  };

  const closeModal = () => {
    setIsMemberModalOpen(false); // Fecha a modal
  };

  return (
    <div className="bg-white p-6 text-black dark:bg-black dark:text-white">
      <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team, index) => (
          <div
            key={index}
            className="justify-center rounded-none bg-white p-4 shadow-none dark:bg-black dark:shadow-lg"
          >
            <div className="mb-4 flex items-center">
              <Cards
                name={team.name}
                description={team.description}
                button1="Ver Membros"
                button2="Adicionar Membros"
                onOpenModal={() => openModal(team)}
              ></Cards>

              <MemberModal
                isOpen={isMemberModalOpen}
                onClose={closeModal}
                onSubmit={handleAddMember}
                selectedTeam={selectedTeam}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
