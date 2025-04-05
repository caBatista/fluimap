"use client";

import { useState, useEffect } from "react";
import { GenericModal } from "./genericModal";
import { DownloadIcon } from "lucide-react";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

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
  selectedTeam?: Team | null;
}

export function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  selectedTeam,
}: MemberModalProps) {
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPosition, setMemberPosition] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMemberName("");
      setMemberEmail("");
      setMemberPosition("");
    }
  }, [isOpen]);

  const handleTitle = (team: Team | null | undefined): string =>
    team?.name
      ? `Adicione um novo membro à equipe ${team.name}`
      : "Adicione um novo membro à equipe";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(memberName, memberEmail, memberPosition);
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={handleTitle(selectedTeam)}
      description="Crie e adicione um membro a um time"
    >
      <form onSubmit={handleSubmit}>
        {/* Nome */}
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

        {/* E-mail */}
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

        {/* Cargo */}
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

        {/* Rodapé */}
        <DialogFooter>
          <div className="mt-4 flex items-center justify-between gap-14">
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
