"use client";

import { useState } from "react";
import { Cards } from "@/components/cards";
import { MemberModal } from "@/components/modal/memberModal";

interface Team {
  name: string;
  description: string;
}

interface TeamListProps {
  teams: Team[];
  onDelete?: (team: Team) => void;
}

export default function TeamList({ teams, onDelete }: TeamListProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  function handleAddMember(
    memberName: string,
    memberEmail: string,
    memberPosition: string,
  ) {
    console.log("Adicionando membro:", memberName, memberEmail, memberPosition);
  }

  function openModal(team: Team) {
    setSelectedTeam(team);
    setIsMemberModalOpen(true);
  }

  function closeModal() {
    setIsMemberModalOpen(false);
  }

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
                onDelete={() => onDelete?.(team)} // 🔥 integração com exclusão
              />

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
