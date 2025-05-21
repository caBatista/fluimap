'use client';

import { useState, useEffect } from 'react';
import { GenericModal } from '../modal/genericModal';
import { DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamName: string, teamDescription: string) => void;
}

export function TeamModal({ isOpen, onClose, onSubmit }: TeamModalProps) {
  const [teamName, setTeamName] = useState<string>('');
  const [teamDescription, setTeamDescription] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTeamName(''); // Limpa o nome da equipe
      setTeamDescription(''); // Limpa a descrição da equipe
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (!teamName.trim()) {
      console.error('O nome do time é obrigatório');
      return; // Se o nome estiver vazio, não faz o envio
    }

    // Chama o callback onSubmit passando os dados para o componente pai
    onSubmit(teamName, teamDescription);
    onClose(); // Fecha o modal após enviar
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Time"
      description="Crie um novo time para a qual você gerenciará pesquisas"
    >
      {/* Campo para o nome da equipe */}
      <div className="mb-4">
        <label htmlFor="teamName" className="block text-[hsl(var(--muted-foreground))]">
          Nome da Equipe
        </label>
        <Input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          placeholder="Digite o nome da equipe"
          className="mt-1 block w-full rounded-md border text-[hsl(var(--primary-foreground))]"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="teamDescription" className="block text-[hsl(var(--muted-foreground))]">
          Descrição da Equipe
        </label>
        <Textarea
          id="teamDescription"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          required
          placeholder="Digite uma breve descrição da equipe"
          className="mt-1 block w-full rounded-md border text-[hsl(var(--primary-foreground))]"
          rows={4}
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
            onClick={handleSubmit}
          >
            Criar Time
          </Button>
        </div>
      </DialogFooter>
    </GenericModal>
  );
}
