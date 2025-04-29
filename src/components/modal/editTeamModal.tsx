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
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
          Nome da Equipe
        </label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          placeholder="Digite o nome da equipe"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo para descrição */}
      <div className="mb-4">
        <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
          Descrição da Equipe
        </label>
        <textarea
          id="teamDescription"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          required
          placeholder="Digite uma breve descrição da equipe"
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      <DialogFooter>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="lg"
            type="button"
            className="flex items-center gap-2 rounded-md border border-black bg-white px-4 py-2 text-black"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="lg"
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={handleEdit}
          >
            Salvar
          </Button>
        </div>
      </DialogFooter>
    </GenericModal>
  );
}
