"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "./genericModal";
import { DownloadIcon } from "lucide-react";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { type EditTeamType } from "@/models/Team";
interface Team {
  name: string;
  description: string;
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    memberName: string,
    memberEmail: string,
    memberPosition: string,
  ) => void;
  selectedTeam?: EditTeamType | null; // Adiciona o time selecionado
}

export function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  selectedTeam,
}: MemberModalProps) {
  const [memberName, setMemberName] = useState<string>("");
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [memberPosition, setMemberPosition] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setMemberName(""); // Limpa o nome do membro
      setMemberEmail(""); // Limpa o e-mail do membro
      setMemberPosition(""); // Limpa o cargo do membro
    }
  }, [isOpen]);

  // Função para lidar com o envio do formulário
  function handleSubmit() {
    onSubmit(memberName, memberEmail, memberPosition); // Passa os dados de membro
  }

  function handleTitle(selectedTeam: EditTeamType | null | undefined): string {
    // Se selectedTeam for nulo ou o nome for vazio, retorna uma string vazia
    if (!selectedTeam?.name) {
      return "Adicione um novo membro a equipe";
    }
    // Caso contrário, retorna a string concatenada
    return `Adicione um novo membro a equipe ${selectedTeam.name}`;
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={handleTitle(selectedTeam)}
      description="Crie e adicione um membro a um time"
    >
      {/* Campo para o nome do membro */}
      <div className="mb-4">
        <label
          htmlFor="memberName"
          className="block text-sm font-medium text-gray-700"
        >
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
        <label
          htmlFor="memberEmail"
          className="block text-sm font-medium text-gray-700"
        >
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
        <label
          htmlFor="memberPosition"
          className="block text-sm font-medium text-gray-700"
        >
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
        <div className="mt-4 flex items-center justify-between gap-14">
          <div>
            <Button
              variant="outline"
              size="lg"
              type="button"
              className="flex items-center gap-2 rounded-md border border-black bg-white px-4 py-2 text-black"
              // future CSV logic goes here
            >
              <DownloadIcon className="h-5 w-5" />
              Arq. CSV
            </Button>
          </div>

          <div className="ml-auto flex gap-2">
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
              onSubmit={handleSubmit}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogFooter>
    </GenericModal>
  );
}
