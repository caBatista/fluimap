'use client';

import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

export interface NotificationsData {
  emailSurveys: boolean;
  emailReports: boolean;
}

export function NotificationsCard({ initial }: { initial: NotificationsData }) {
  const { formState } = useForm<NotificationsData>({
    defaultValues: initial,
  });

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
