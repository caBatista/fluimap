'use client';

import { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

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
    <div className="flex min-h-screen flex-col px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-[32px] w-[141px] text-2xl font-bold">Times</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Gerencie suas equipes e membros de equipe
          </p>
        </div>

        <div className="mb-[32px] mt-[40px]">
          <Button
            size="lg"
            className="flex h-[40px] w-[180px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
            Criar Novo Time
          </Button>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="mt-[24px] flex flex-wrap items-center gap-4 rounded-[8px] border-[hsl(var(--input))] bg-[hsl(var(--card))]">
        {/* Barra de pesquisa */}
        <div className="relative h-[40px] min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Pesquisar time..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 text-sm"
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
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Tem certeza que deseja apagar este time? Os dados relacionados ao time serão excluídos
            após a confirmação.
          </p>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              className="flex h-[40px] w-[75px] items-center justify-center gap-1 text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex h-[40px] w-[105px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
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
