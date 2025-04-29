'use client';

import { useState } from 'react';
import { Cards } from '@/components/cards';
import { MemberModal } from '@/components/modal/memberModal';
import { type EditTeamType } from '@/models/Team';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { RespondeeType } from '@/models/Respondee';

type TeamListProps = {
  teams: EditTeamType[];
  onDelete?: (team: EditTeamType) => void;
  onEdit?: (team: EditTeamType) => void;
};

export default function TeamList({ teams, onDelete, onEdit }: TeamListProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<EditTeamType | null>(null);
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      role,
      teamId,
    }: {
      name: string;
      email: string;
      role: string;
      teamId: string;
    }) => {
      const response = await fetch('/api/respondees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, teamId }),
      });
      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? 'Erro ao adicionar membro');
      }
      return response.json() as Promise<{ respondee: RespondeeType }>;
    },
    onSuccess: (_data, variables) => {
      toast.success('Membro adicionado com sucesso!');
      setIsMemberModalOpen(false);
      // Invalida a lista de membros do time
      if (variables.teamId) {
        void queryClient.invalidateQueries({ queryKey: ['respondees', variables.teamId] });
      }
    },
    onError: (error: unknown) => {
      toast.error(
        (error instanceof Error ? error.message : 'Erro ao adicionar membro') ??
          'Erro ao adicionar membro'
      );
    },
  });

  function handleAddMember(memberName: string, memberEmail: string, memberPosition: string) {
    if (!selectedTeam?._id) {
      toast.error('Selecione um time válido');
      return;
    }
    addMemberMutation.mutate({
      name: memberName,
      email: memberEmail,
      role: memberPosition || 'Membro',
      teamId: selectedTeam._id,
    });
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
            <div className="flex items-center pb-2">
              <Cards
                name={team.name}
                description={team.description}
                onOpenModal={() => openModal(team)}
                onDelete={() => onDelete?.(team)}
                onEdit={() => onEdit?.(team)}
                teamId={team._id}
                team={team}
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
