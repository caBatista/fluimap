'use client';

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

      <CardFooter>
        <Button disabled={formState.isSubmitting}>Salvar</Button>
      </CardFooter>
    </Card>
  );
}
