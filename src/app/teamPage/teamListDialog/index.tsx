"use client";

import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Cards } from "@/components/cards";
import { MemberModal } from "@/components/modal/memberModal";
import { type EditTeamType } from "@/models/Team";

interface Team {
  name: string;
  description: string;
}

interface TeamListProps {
  teams: EditTeamType[];
  onDelete?: (team: EditTeamType) => void;
  onEdit?: (team: EditTeamType) => void;
}

export default function TeamList({ teams, onDelete, onEdit }: TeamListProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<EditTeamType | null>(null);

  function handleAddMember(
    memberName: string,
    memberEmail: string,
    memberPosition: string,
  ) {
    console.log("Adicionando membro:", memberName, memberEmail, memberPosition);
  }

  function openModal(team: EditTeamType) {
    setSelectedTeam(team);
    setIsMemberModalOpen(true);
  }

  function closeModal() {
    setIsMemberModalOpen(false);
  }

  return (
    <div className="bg-white p-6 text-black dark:bg-black dark:text-white">
      <div className="grid max-h-[500px] grid-cols-1 justify-center gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team, index) => (
          <div
            key={index}
            className="justify-center rounded-none bg-white p-4 shadow-none dark:bg-black dark:shadow-lg"
          >
            <div className="mb-2 flex items-center">
              <Cards
                name={team.name}
                description={team.description}
                button1="Ver Membros"
                icon1={Users}
                button2="Adicionar Membros"
                icon2={UserPlus}
                onOpenModal={() => openModal(team)}
                onDelete={() => onDelete?.(team)} // 🔥 integração com exclusão
                onEdit={() => onEdit?.(team)}
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
