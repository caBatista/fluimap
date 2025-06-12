'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GenericModal } from '@/components/modal/genericModal';

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
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir usuário');
      return res.json() as Promise<{ message: string }>;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const { data: users = [] } = useQuery<UserManagement[]>({
    queryKey: ['users'],
    queryFn: async (): Promise<UserManagement[]> => {
      const res = await fetch('/api/userManagement');
      if (!res.ok) throw new Error('Erro ao buscar usuários');
      return res.json() as Promise<UserManagement[]>;
    },
  });

  const {
    data: surveys = [],
    isLoading,
    error,
  } = useQuery<Survey[]>({
    queryKey: ['surveys-all'],
    queryFn: async (): Promise<Survey[]> => {
      const res = await fetch('/api/administration');
      if (!res.ok) throw new Error('Erro ao buscar formulários');
      return res.json() as Promise<Survey[]>;
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados.</div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-4">
          <h2 className="mb-4 text-xl font-semibold">Gestão de Usuários</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-fixed overflow-hidden rounded-lg border border-gray-200 text-left text-sm">
              <thead>
                <tr>
                  <th className="w-[50%] bg-gray-100 px-4 py-2 font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="w-[50%] bg-gray-100 px-4 py-2 font-semibold text-gray-700">
                    Créditos
                  </th>
                  <th className="w-[50%] bg-gray-100 px-4 py-2 font-semibold text-gray-700">
                    Data de Expiração
                  </th>
                  <th className="w-[15%] bg-gray-100 px-4 py-2 font-semibold text-gray-700">
                    Ação
                  </th>
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
                        className="rounded-md bg-red-100 px-3 py-1 text-red-700 transition hover:bg-red-200"
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
          <button className="rounded-md px-4 py-2" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </button>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
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
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-4">
          <h2 className="mb-4 text-xl font-semibold">Administração</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg border border-gray-200 text-left text-sm">
              <thead>
                <tr>
                  <th className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Formulário</th>
                  <th className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Times</th>
                  <th className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.surveyId} className="border-t">
                    <td className="px-4 py-2">{survey.surveyTitle}</td>
                    <td className="px-4 py-2">{survey.teamName}</td>
                    <td
                      className={`px-4 py-2 ${survey.status === 'ativo' ? 'text-green-600' : ''}`}
                    >
                      {survey.status}
                    </td>
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
