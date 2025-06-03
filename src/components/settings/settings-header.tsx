'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="mt-[28px]">
        <h1 className="h-[32px] w-[141px] text-2xl font-bold">Configuração</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Gerencie as configurações e preferências da sua conta
        </p>
      </div>
    </div>
  );
}
