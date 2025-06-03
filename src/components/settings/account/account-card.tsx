'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

export interface AccountData {
  name: string;
  email: string;
}

export function AccountCard({ initialData }: { initialData: AccountData }) {
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountData>({ defaultValues: initialData });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  async function onSubmit(values: AccountData) {
    if (values.name.trim().length < 2) {
      setError('name', { message: 'Nome muito curto' });
      return;
    }
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    res.ok ? toast.success('Conta atualizada!') : toast.error('Erro ao salvar');
  }

  return (
    <Card className="w-full px-2 py-2">
      <CardHeader>
        <CardTitle className="h-[32px] w-[141px] text-2xl font-bold">Perfil</CardTitle>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Atualize as informacoes do seu perfil
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="mt-[16px] grid gap-y-4 lg:grid-cols-[auto_1fr_1fr] lg:gap-x-8">
          <div className="flex items-center justify-center">
            <Avatar className="h-20 w-20 border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-[hsl(var(--sidebar-avatar-bg))]" />
              )}
            </Avatar>
          </div>

          <div className="grid h-[40px] items-center">
            <Label>Nome do Usuario</Label>
            <Input
              className="mt-[7px] text-sm text-[hsl(var(--muted-foreground))]"
              {...register('name', { required: true })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid h-[40px] items-center">
            <Label>E-mail</Label>
            <Input
              className="mt-[7px] text-sm text-[hsl(var(--muted-foreground))]"
              {...register('email')}
              disabled
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
