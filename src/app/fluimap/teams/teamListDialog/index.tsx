'use client';

import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { Cards } from '@/components/cards';
import { MemberModal } from '@/components/modal/memberModal';
import { type EditTeamType } from '@/models/Team';

type TeamListProps = {
  teams: EditTeamType[];
  onDelete?: (team: EditTeamType) => void;
  onEdit?: (team: EditTeamType) => void;
};

export default function TeamList({ teams, onDelete, onEdit }: TeamListProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<EditTeamType | null>(null);

  function handleAddMember(memberName: string, memberEmail: string, memberPosition: string) {
    console.log('Adicionando membro:', memberName, memberEmail, memberPosition);
  }

  function openModal(team: EditTeamType) {
    setSelectedTeam(team);
    setIsMemberModalOpen(true);
  }

  function closeModal() {
    setIsMemberModalOpen(false);
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {teams.map((team, index) => (
          <div key={index} className="flex justify-center">
            <div className="w-full max-w-sm">
              <Cards
                name={team.name}
                description={team.description}
                button1="Ver Membros"
                icon1={Users}
                button2="Adicionar Membros"
                icon2={UserPlus}
                onOpenModal={() => openModal(team)}
                onDelete={() => onDelete?.(team)}
                onEdit={() => onEdit?.(team)}
              />
            </div>
          </div>
        ))}

        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={closeModal}
          onSubmit={handleAddMember}
          selectedTeam={selectedTeam}
        />
      </div>
    </div>
  );
}
