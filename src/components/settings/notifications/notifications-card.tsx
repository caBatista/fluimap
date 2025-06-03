'use client';

import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

export interface NotificationsData {
  emailSurveys: boolean;
  emailReports: boolean;
}

export function NotificationsCard({ initial }: { initial: NotificationsData }) {
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotificationsData>({
    defaultValues: initial,
  });

  async function onSubmit(values: NotificationsData) {
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    res.ok ? toast.success('Preferências salvas!') : toast.error('Erro ao salvar');
  }

  return (
    <Card className="w-full px-2 py-2">
      <CardHeader className="h-[32px] w-[141px] text-2xl font-bold">
        <CardTitle>Configurações de notificação</CardTitle>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Configure como você recebe notificações
        </p>
      </CardHeader>

      <h2 className="text-1xl mt-1 font-semibold"> Notificações por e-mail </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <span>Pesquisa criada</span>
            <Switch {...register('emailSurveys')} />
          </div>
          <div className="flex items-center justify-between">
            <span>Pesquisa Concluída</span>
            <Switch {...register('emailReports')} />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            disabled={isSubmitting}
            className="mb-[29px] ml-[136px] flex h-[40px] w-[145px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          >
            Salvar Alterações
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
