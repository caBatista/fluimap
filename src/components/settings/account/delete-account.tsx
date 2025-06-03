'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useUser, useClerk } from '@clerk/nextjs';

export function DeleteAccount() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      toast.success('Conta excluída. Até logo!');
      await signOut();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Card className="w-full px-4 py-4">
        <CardHeader>
          <h1 className="text-2xl font-bold">Configuracao da Conta</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Gerencie as preferencias da sua conta
          </p>
        </CardHeader>

        <CardFooter className="items-between flex justify-between px-[25px] py-[20px] sm:justify-between">
          <div>
            <h2 className="text-2sm font-bold">Excluir Conta</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Exclua permanentemente sua conta e todos os seus dados.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            className="items-between hover:[hsl(var(--muted-foreground))]/90 h-[40px] w-[120px] justify-between text-[hsl(var(--primary-foreground))]"
          >
            Excluir Conta
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Conta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Tem certeza que deseja apagar esta conta? Os dados relacionados ao time serão excluídos
            após a confirmação.
          </p>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              className="flex h-[40px] w-[80px] items-center justify-center gap-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))]/90"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="hover:[hsl(var(--muted-foreground))]/90 flex h-[40px] w-[100px] items-center justify-center gap-1 text-[hsl(var(--primary-foreground))]"
              onClick={handleDelete}
            >
              {loading ? 'Excluindo…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
