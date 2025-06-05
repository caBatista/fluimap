'use client';

import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Respondee = {
  _id: string;
  name: string;
  email: string;
  role: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
};

interface ApiError {
  error: string;
}

interface TeamResponse {
  team: {
    _id: string;
    name: string;
    description?: string;
    ownerId: string;
  };
  respondees: Respondee[];
}

interface RespondeeListProps {
  teamId: string;
}

async function fetchRespondees(teamId: string): Promise<Respondee[]> {
  const response = await fetch(`/api/respondees?teamId=${teamId}`);

  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
    throw new Error(errorData.error || 'Falha ao buscar membros da equipe');
  }

  const data = (await response.json()) as TeamResponse;
  return data.respondees;
}

export function RespondeeList({ teamId }: RespondeeListProps) {
  const queryClient = useQueryClient();

  const {
    data: respondees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['respondees', teamId],
    queryFn: () => fetchRespondees(teamId),
  });

  if (error instanceof Error) {
    toast.error(error.message);
  }

  async function deleteRespondee(respondeeId: string) {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) {
      return;
    }

    console.log('Deleting respondee', respondeeId);

    try {
      const response = await fetch(`/api/respondees/${respondeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || 'Falha ao remover membro da equipe');
      }

      toast.success('Membro removido com sucesso');
      
      void queryClient.invalidateQueries({ queryKey: ['respondees', teamId] });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocorreu um erro desconhecido');
      }
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando membros da equipe...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Membros</CardTitle>
      </CardHeader>
      <CardContent>
        {respondees.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhum membro encontrado. Adicione membros para começar.
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {respondees.map((respondee) => (
                <Card key={respondee._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{respondee.name}</h3>
                      <p className="text-sm">{respondee.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Cargo: {respondee.role}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void deleteRespondee(respondee._id)}
                    >
                      Remover
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
