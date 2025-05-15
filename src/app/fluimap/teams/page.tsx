'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { TeamModal } from '@/components/modal/teamModal';
import { EditTeamModal } from '@/components/modal/editTeamModal';
import TeamListDialog from './teamListDialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type EditTeamType } from '@/models/Team';

function isTeam(item: unknown): item is EditTeamType {
  return (
    typeof item === 'object' &&
    item !== null &&
    'name' in item &&
    typeof (item as Record<string, unknown>).name === 'string'
  );
}

function isApiTeamResponse(data: unknown): data is { teams: unknown[] } {
  return (
    typeof data === 'object' && data !== null && Array.isArray((data as { teams?: unknown }).teams)
  );
}

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [teamToDelete, setTeamToDelete] = useState<EditTeamType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<EditTeamType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: teams = [],
    isLoading,
    isError,
  } = useQuery<EditTeamType[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Erro ao buscar times');
      const json: unknown = await res.json();
      if (!isApiTeamResponse(json)) {
        throw new Error('Formato inválido da resposta da API');
      }
      return json.teams.filter(isTeam);
    },
  });

  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) throw new Error('Erro ao criar time');
      const createdJson: unknown = await response.json();
      const created = (createdJson as { team?: unknown }).team;
      if (!isTeam(created)) throw new Error('Time criado inválido');
      return created;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Time criado com sucesso');
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('Erro ao criar time');
    },
  });

  const editTeamMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description?: string;
    }) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) throw new Error('Erro ao editar time');
      const updatedJson: unknown = await response.json();
      const updatedTeam = (updatedJson as { team?: unknown }).team;
      if (!isTeam(updatedTeam)) throw new Error('Time editado inválido');
      return updatedTeam;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Time editado com sucesso');
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error('Erro ao editar time');
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir time');
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Time excluído com sucesso');
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    },
    onError: () => {
      toast.error('Erro ao excluir o time');
    },
  });

  if (isLoading) {
    return <div className="p-8">Carregando times...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Erro ao carregar os times</div>;
  }

  const filteredTeams = teams.filter(
    (team) =>
      (typeof team.name === 'string' && team.name.toLowerCase().includes(search.toLowerCase())) ||
      team.description?.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreateTeam(name: string, description: string) {
    if (!name.trim()) {
      toast.error('O nome do time é obrigatório');
      return;
    }
    void createTeamMutation.mutate({ name, description });
  }

  function handleEditTeam(id: string, name: string, description?: string) {
    if (!name.trim()) {
      toast.error('O nome do time é obrigatório');
      return;
    }
    void editTeamMutation.mutate({ id, name, description });
  }

  function confirmEditTeam(team: EditTeamType) {
    setTeamToEdit(team);
    setIsEditDialogOpen(true);
  }

  function confirmDeleteTeam(team: EditTeamType) {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteTeam() {
    if (!teamToDelete?._id) return;
    void deleteTeamMutation.mutate(teamToDelete._id);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white text-black dark:bg-black dark:text-white">
      <div className="flex w-[100%] flex-col">
        <div className="flex flex-row items-center justify-between px-8 py-4 pb-4 sm:flex-row">
          <div>
            <h1 className="h-[32px] w-[141px] text-2xl font-bold">Times</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Gerencie suas equipes e membros de equipe
            </p>
          </div>

          <Button
            size="lg"
            className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 pt-2 text-white sm:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="flex items-center justify-center rounded-full border-2 border-white bg-blue-500 p-1 text-white">
              <PlusIcon className="h-5 w-5" />
            </span>
            Criar Novo Time
          </Button>
        </div>

        {/* Campo de busca */}
        <div className="w-full px-8 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou descrição"
            className="w-full rounded-md border border-gray-300 px-4 py-2"
          />
        </div>
      </div>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      <EditTeamModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditTeam}
        team={teamToEdit}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Time</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja apagar este time? Os dados relacionados ao time serão excluídos
            após a confirmação.
          </p>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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

      <TeamListDialog teams={filteredTeams} onDelete={confirmDeleteTeam} onEdit={confirmEditTeam} />
    </div>
  );
}
