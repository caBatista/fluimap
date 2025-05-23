'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SelectUser } from '@/components/select-user';
import { Button } from '@/components/ui/button';

const mockUsers = [
  { name: 'João Paulo Pereira', role: 'Gerente', imageUrl: 'https://i.pravatar.cc/150?img=7' },
  { name: 'Maria Oliveira', role: 'Analista', imageUrl: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Carlos Souza', role: 'Coordenador', imageUrl: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Ana Lima', role: 'Estagiária', imageUrl: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Lucas Ferreira', role: 'Supervisor', imageUrl: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Jonas Ferreira', role: 'Estagiário', imageUrl: 'https://i.pravatar.cc/150?img=4' },
  { name: 'Emanuel Costa Pereira', role: 'Dono', imageUrl: 'https://i.pravatar.cc/150?img=6' },
];

export default function SelectUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  const handleSelect = (name: string, selected: boolean) => {
    setSelectedUsers((prev) => (selected ? [...prev, name] : prev.filter((n) => n !== name)));
  };

  const handleContinue = () => {
    const query = selectedUsers.map((name) => `users=${encodeURIComponent(name)}`).join('&');
    router.push(`/questionnaire/peerCommunication?${query}`);
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 bg-[hsl(var(--background))] px-4 pb-12">
      <h1 className="items-center p-6 text-4xl font-bold">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>
      <h1 className="mt-[-10px] text-center text-2xl text-[#6B7280]">
        Selecione colegas no qual você deseja avaliar.
      </h1>

      <div className="flex w-full items-center justify-center">
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4">
          {mockUsers.map((user, index) => (
            <SelectUser
              key={index}
              name={user.name}
              role={user.role}
              imageUrl={user.imageUrl}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex w-full justify-center px-2 sm:justify-end">
        <Button
          variant="default"
          className="h-auto w-full px-8 py-4 text-base sm:w-auto"
          onClick={handleContinue}
          disabled={selectedUsers.length === 0}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}
