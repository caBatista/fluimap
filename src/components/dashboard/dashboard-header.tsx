'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="h-[32px] w-[141px] text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Visualize insights e gerencie pesquisas para sua equipe
        </p>
      </div>

      <div className="mb-[32px] mt-[40px]">
        <Link href="/surveys/create">
          <Button className="flex h-[40px] w-[190px] items-center justify-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90">
            <PlusCircle className="h-4 w-4" />
            Criar nova Pesquisa
          </Button>
        </Link>
      </div>
    </div>
  );
}
