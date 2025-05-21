import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { UsersIcon, UserPlus } from 'lucide-react';
import { Card, CardFooter } from '@/components/ui/card';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { GenericModal } from '@/components/modal/genericModal';
import { RespondeeList } from '@/components/respondees/respondee-list';
import { type EditTeamType } from '@/models/Team';

// New modal for viewing members, following EditTeamModal structure
interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: EditTeamType | null;
}

function ViewMembersModal({ isOpen, onClose, team }: ViewMembersModalProps) {
  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={team ? `Membros do time: ${team.name}` : 'Membros do time'}
      description="Veja e gerencie os membros deste time."
    >
      {team && <RespondeeList teamId={team._id} />}
    </GenericModal>
  );
}

interface CardsProps {
  name: string;
  description?: string;
  onOpenModal?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  teamId: string;
  team?: EditTeamType; // Add the full team object for modal
}

export function Cards({ name, description, onOpenModal, onDelete, onEdit, team }: CardsProps) {
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);

  return (
    <Card className="relative h-[201px] w-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-4 shadow-sm">
      <div className="ml-4 mt-4 flex items-start justify-between">
        <div>
          <h2 className="text-sml font-semibold text-[hsl(var(--foreground))]">{name}</h2>
        </div>

        <div className="flex gap-[11px]">
          <Button
            variant="ghost"
            className="flex flex-1 items-center gap-1 rounded-md text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            onClick={onEdit}
          >
            <EditIcon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Button>
          <Button
            variant="ghost"
            className="flex flex-1 items-center gap-1 rounded-md text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            onClick={onDelete}
          >
            <Trash2Icon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Button>
        </div>
      </div>

      <p className="mb-7 ml-4 mt-7 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>

      <CardFooter className="flex flex-col justify-center gap-2 px-4 pb-6 sm:flex-row">
        <Button
          variant="outline"
          className="flex h-[40px] w-[190px] items-center justify-center gap-1 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/90"
          onClick={() => setIsViewMembersOpen(true)}
        >
          <UsersIcon className="h-5 w-5 shrink-0" />
          Ver Membros
        </Button>
        <Button
          variant="outline"
          className="flex h-[40px] w-[190px] items-center justify-center gap-1 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/90"
          onClick={onOpenModal}
        >
          <UserPlus className="h-5 w-5 shrink-0" />
          Adicionar Membros
        </Button>
      </CardFooter>
      <ViewMembersModal
        isOpen={isViewMembersOpen}
        onClose={() => setIsViewMembersOpen(false)}
        team={team ?? null}
      />
    </Card>
  );
}
