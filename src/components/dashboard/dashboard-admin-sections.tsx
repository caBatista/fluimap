"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GenericModal } from "@/components/modal/genericModal";

interface Survey {
  surveyId: string;
  surveyTitle: string;
  teamName: string;
  status: string;
  dateClosing: string;
}

interface UserManagement {
  id: string;
  name: string;
  credits: string;
  expirationDate: string;
}

export function DashboardAdminSections() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const res = await fetch(`/api/userManagement/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir usuário");
      return res.json() as Promise<{ message: string }>;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { data: users = [] } = useQuery<UserManagement[]>({
    queryKey: ["users"],
    queryFn: async (): Promise<UserManagement[]> => {
      const res = await fetch("/api/userManagement");
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json() as Promise<UserManagement[]>;
    },
  });

  const {
    data: surveys = [],
    isLoading,
    error,
  } = useQuery<Survey[]>({
    queryKey: ["surveys-all"],
    queryFn: async (): Promise<Survey[]> => {
      const res = await fetch("/api/administration");
      if (!res.ok) throw new Error("Erro ao buscar formulários");
      return res.json() as Promise<Survey[]>;
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados.</div>;

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Gestão de Usuários</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full table-fixed text-sm text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2 w-[85%]">Nome</th>
                  <th className="px-4 py-2 w-[85%]">Créditos</th>
                  <th className="px-4 py-2 w-[85%]">Data de Expiração</th>
                  <th className="px-4 py-2 w-[15%]">Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.credits}</td>
                    <td className="px-4 py-2">{user.expirationDate}</td>
                    <td className="px-4 py-2">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedUserName(user.name);
                          setIsModalOpen(true);
                        }}
                      >
                        Desativar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar desativação"
        description={`Tem certeza que deseja desativar o usuário ${selectedUserName}?`}
      >
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => {
              if (selectedUserId) {
                deleteUserMutation.mutate(selectedUserId);
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </GenericModal>
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Administração</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">Formulário</th>
                  <th className="px-4 py-2">Times</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.surveyId} className="border-t">
                    <td className="px-4 py-2">{survey.surveyTitle}</td>
                    <td className="px-4 py-2">{survey.teamName}</td>
                    <td className="px-4 py-2">{survey.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}