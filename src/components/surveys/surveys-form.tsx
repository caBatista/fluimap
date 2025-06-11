'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const surveyFormSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  description: z.string(),
  teamId: z.string().min(1, 'Selecione um time.'),
  dateClosing: z.string().nonempty('Insira a data de fechamento'),
});

export type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  onSuccess?: () => void;
}

export function SurveyForm({ onSuccess }: SurveyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery<{ _id: string; name: string }[]>({
    queryKey: ['teams'],
    queryFn: async (): Promise<{ _id: string; name: string }[]> => {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Falha ao buscar times');
      }

      const json: unknown = await response.json();
      if (
        typeof json !== 'object' ||
        json === null ||
        !Array.isArray((json as { teams?: unknown }).teams)
      ) {
        throw new Error('Resposta da API em formato inválido');
      }
      return (json as { teams: { _id: string; name: string }[] }).teams;
    },
  });

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      teamId: '',
      dateClosing: '',
    },
  });

  async function onSubmit(data: SurveyFormValues): Promise<void> {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'ativo' }),
      });

      if (!response.ok) {
        const err: unknown = await response.json();
        const errorMessage =
          typeof err === 'object' &&
          err !== null &&
          'error' in err &&
          typeof (err as { error: unknown }).error === 'string'
            ? (err as { error: string }).error
            : JSON.stringify(err) || 'Erro ao criar formulário';

        throw new Error(errorMessage);
      }

      const result: unknown = await response.json();
      const newSurveyId =
        typeof result === 'object' &&
        result !== null &&
        'survey' in result &&
        typeof (result as { survey?: { _id?: string } }).survey?._id === 'string'
          ? (result as { survey: { _id: string } }).survey._id
          : null;

      toast('Os e-mails estão sendo enviados para os participantes...');
      if (onSuccess) {
        onSuccess();
      }
      router.push(`/surveys${newSurveyId ? `#${newSurveyId}` : ''}`);

      fetch('/api/surveys/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: data.teamId, surveyId: newSurveyId }),
      })
        .then(async (runResponse) => {
          if (!runResponse.ok) {
            const runErr: unknown = await runResponse.json();
            const runErrorMsg =
              typeof runErr === 'object' &&
              runErr !== null &&
              'error' in runErr &&
              typeof (runErr as { error: unknown }).error === 'string'
                ? (runErr as { error: string }).error
                : JSON.stringify(runErr) || 'Erro ao iniciar o envio dos questionários';
            toast.error('Erro ao enviar e-mails: ' + runErrorMsg);
          } else {
            void queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
            toast.success('E-mails enviados com sucesso!');
          }
        })
        .catch((runError) => {
          console.error(runError);
          toast.error('Erro inesperado ao enviar e-mails.');
        });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error('Falha ao criar formulário: ' + error.message);
      } else {
        console.error(error);
        toast.error('Falha ao criar formulário. Ver console.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full space-y-6 p-6">
        <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Cadastrar Formulário
            </CardTitle>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Crie uma pesquisa para avaliar a dinâmica e os relacionamentos da equipe
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--muted-foreground))]">
                    Título do Formulário
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do formulário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--muted-foreground))]">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição do objetivo do formulário"
                      className="min-h-[71px] resize-y"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col items-end gap-4 sm:flex-row">
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem className="w-full flex-1">
                    <FormLabel className="text-[hsl(var(--muted-foreground))]">Time</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-[40px] w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <SelectValue placeholder="Selecione um time" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateClosing"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col sm:w-auto">
                    <FormLabel className="text-[hsl(var(--muted-foreground))]">
                      Término em
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal sm:w-[240px]',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), 'dd/MM/yyyy')
                            : 'Selecione uma data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date.toISOString());
                            }
                          }}
                          disabled={(date) => {
                            const now = new Date();
                            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                            return date < tomorrow;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row">
            <Button
              variant="outline"
              type="button"
              className="h-[40px] w-full border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] sm:w-auto"
              onClick={() => router.push('/surveys')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-[40px] w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Pesquisa'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
