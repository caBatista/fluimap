'use client';

import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/nextjs';

export interface NotificationsData {
  emailSurveys: boolean;
  emailReports: boolean;
}

export function NotificationsCard({ initial }: { initial: NotificationsData }) {
  const { user } = useUser();

  const { register, handleSubmit, formState } = useForm<NotificationsData>({
    defaultValues: initial,
  });

  async function onSubmit(values: NotificationsData) {
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Configurações de notificação</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <span>Notificar sobre novos formulários</span>
            <Switch {...register('emailSurveys')} />
          </div>
          <div className="flex items-center justify-between">
            <span>Notificar sobre novos relatórios</span>
            <Switch {...register('emailReports')} />
          </div>
        </CardContent>

        <CardFooter>
          <Button disabled={formState.isSubmitting}>Salvar</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
