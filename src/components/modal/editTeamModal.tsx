'use client';

import { useState, useEffect } from 'react';
import { GenericModal } from '../modal/genericModal';
import { DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { type EditTeamType } from '@/models/Team';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, teamName: string, teamDescription: string) => void;
  team: EditTeamType | null;
}

export function EditTeamModal({ isOpen, onClose, onSubmit, team }: TeamModalProps) {
  const [teamName, setTeamName] = useState<string>('');
  const [teamDescription, setTeamDescription] = useState<string | undefined>('');
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    if (isOpen && team) {
      setTeamId(team._id);
      setTeamName(team.name); // Limpa o nome da equipe
      setTeamDescription(team.description); // Limpa a descrição da equipe
    }
  }, [isOpen, team]);

  const handleEdit = () => {
    const validDescription = teamDescription ?? ''; // Se for undefined, usa uma string vazia

    onSubmit(teamId, teamName, validDescription);
    onClose();
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Time"
      description="Crie um novo time para a qual você gerenciará pesquisas"
    >
      {/* Campo para o nome da equipe */}
      <div className="mb-4">
        <label
          htmlFor="teamName"
          className="block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          Nome da Equipe
        </label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          placeholder="Digite o nome da equipe"
          className="mt-1 block w-full rounded-md border border-[hsl(var(--border))] px-4 py-2 shadow-sm focus:outline-none focus:ring-2"
        />
      </div>

      {/* Campo para descrição */}
      <div className="mb-4">
        <label
          htmlFor="teamDescription"
          className="block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          Descrição da Equipe
        </label>
        <textarea
          id="teamDescription"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          required
          placeholder="Digite uma breve descrição da equipe"
          className="mt-1 block w-full rounded-md border border-[hsl(var(--border))] px-4 py-2 shadow-sm focus:outline-none focus:ring-2"
          rows={4}
          maxLength={131}
        />
      </div>

      <DialogFooter>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="lg"
            type="button"
            className="flex h-[40px] w-[78px] items-center justify-center gap-1 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/90"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="lg"
            type="submit"
            className="flex h-[40px] w-[105px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            onClick={handleEdit}
          >
            Salvar
          </Button>
        </div>
      </DialogFooter>
    </GenericModal>
  );
}
