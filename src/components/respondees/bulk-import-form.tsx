'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ApiError {
  error: string;
}

interface BulkImportFormProps {
  teamId: string;
  onSuccess?: () => void;
}

export function BulkImportForm({ teamId, onSuccess }: BulkImportFormProps) {
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleImport = async () => {
    try {
      setIsLoading(true);

      const rows = csvData
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row.length > 0);

      const respondees = rows.map((row) => {
        const [name, email, role] = row.split(',').map((item) => item.trim());
        return { name, email, role };
      });

      const invalidRows = respondees.filter(
        (row) => !row.name || !row.email || !row.email.includes('@') || !row.role
      );

      if (invalidRows.length > 0) {
        throw new Error(`Dados inválidos no CSV. Cada linha deve conter nome, e-mail e cargo.`);
      }

      const response = await fetch('/api/respondees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respondees,
          teamId,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || 'Falha ao importar membros da equipe');
      }

      toast.success(`Importação de ${respondees.length} membros realizada com sucesso`);
      setCsvData('');

      void queryClient.invalidateQueries({ queryKey: ['respondees', teamId] });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocorreu um erro desconhecido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importação em Massa de Membros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Insira os dados em CSV no formato:{' '}
              <span className="font-mono">nome, e-mail, cargo</span>
              <br />
              Uma entrada por linha.
            </p>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="João Silva, joao@email.com, Desenvolvedor\nMaria Souza, maria@email.com, Gestora"
              className="h-[150px] font-mono"
            />
          </div>
          <Button onClick={() => void handleImport()} disabled={isLoading || !csvData.trim()}>
            {isLoading ? 'Importando...' : 'Importar Membros'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
