'use client';

import { useState, useEffect } from 'react';
import { GenericModal } from './genericModal';
import { DownloadIcon } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { type EditTeamType } from '@/models/Team';
import Papa from 'papaparse';
import { toast } from 'sonner';

type MemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberName: string, memberEmail: string, memberPosition: string) => void;
  selectedTeam?: EditTeamType | null; // Adiciona o time selecionado
};

export function MemberModal({ isOpen, onClose, onSubmit, selectedTeam }: MemberModalProps) {
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberPosition, setMemberPosition] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMemberName(''); // Limpa o nome do membro
      setMemberEmail(''); // Limpa o e-mail do membro
      setMemberPosition(''); // Limpa o cargo do membro
    }
  }, [isOpen]);

  // Função para lidar com o envio do formulário
  function handleSubmit() {
    onSubmit(memberName, memberEmail, memberPosition); // Passa os dados de membro
  }

  function handleTitle(selectedTeam: EditTeamType | null | undefined): string {
    // Se selectedTeam for nulo ou o nome for vazio, retorna uma string vazia
    if (!selectedTeam?.name) {
      return 'Adicione um novo membro a equipe';
    }
    // Caso contrário, retorna a string concatenada
    return `Adicione um novo membro a equipe ${selectedTeam.name}`;
  }

  async function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedTeam?._id) {
      toast.error('Selecione um time antes de importar CSV.');
      return;
    }
    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      complete: async (
        results: Papa.ParseResult<{ name: string; email: string; role: string }>
      ) => {
        try {
          // Expect columns: name, email, role
          const respondees = results.data
            .map((row) => ({
              name: row.name?.trim() || '',
              email: row.email?.trim() || '',
              role: row.role?.trim() || '',
            }))
            .filter((r) => r.name && r.email && r.role);
          if (respondees.length === 0) {
            toast.error('O arquivo CSV não contém dados válidos.');
            setIsUploading(false);
            return;
          }
          const response = await fetch('/api/respondees', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ respondees, teamId: selectedTeam._id }),
          });
          if (!response.ok) {
            const errorData = (await response.json()) as { error?: string };
            throw new Error(errorData.error ?? 'Erro ao importar membros.');
          }
          toast.success(`Importação de ${respondees.length} membros realizada com sucesso!`);
          onClose();
        } catch (err: unknown) {
          toast.error((err as Error).message ?? 'Erro desconhecido ao importar CSV.');
        } finally {
          setIsUploading(false);
        }
      },
      error: (_err: Error) => {
        toast.error('Erro ao ler o arquivo CSV.');
        setIsUploading(false);
      },
    });
  }

  function handleDownloadExampleCsv() {
    const exampleRows = [
      ['name', 'email', 'role'],
      ['João Silva', 'joao@email.com', 'Desenvolvedor'],
      ['Maria Souza', 'maria@email.com', 'Designer'],
    ];
    const csvContent = exampleRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exemplo_membros.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={handleTitle(selectedTeam)}
      description="Crie e adicione um membro a um time"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Campo para o nome do membro */}
        <div className="mb-4">
          <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">
            Nome do Membro
          </label>
          <input
            type="text"
            id="memberName"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
            placeholder="Digite o nome do membro"
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Campo para o e-mail do membro */}
        <div className="mb-4">
          <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700">
            E-mail do Membro
          </label>
          <input
            type="email"
            id="memberEmail"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
            placeholder="Digite o e-mail do membro"
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Campo opcional para o cargo */}
        <div className="mb-4">
          <label htmlFor="memberPosition" className="block text-sm font-medium text-gray-700">
            Cargo (Opcional)
          </label>
          <input
            type="text"
            id="memberPosition"
            value={memberPosition}
            onChange={(e) => setMemberPosition(e.target.value)}
            placeholder="Digite o cargo do membro"
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <DialogFooter>
          <div className="mt-4 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full gap-2 md:w-auto">
              <label
                htmlFor="csv-upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-black bg-white px-4 py-2 text-black md:w-auto"
              >
                <DownloadIcon className="h-5 w-5" />
                Arq. CSV
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                  disabled={isUploading || !selectedTeam?._id}
                />
              </label>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-black bg-white px-4 py-2 text-black md:w-auto"
                onClick={handleDownloadExampleCsv}
              >
                <DownloadIcon className="h-5 w-5" />
                Exemplo CSV
              </button>
            </div>

            <div className="mt-2 flex w-full justify-end gap-2 md:mt-0 md:w-auto">
              <Button
                variant="outline"
                size="lg"
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-black bg-white px-4 py-2 text-black md:w-auto"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                size="lg"
                type="submit"
                className="w-full justify-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 md:w-auto"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </GenericModal>
  );
}
