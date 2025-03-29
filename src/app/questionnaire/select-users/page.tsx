"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectUser } from "@/components/select-user";
import { Button } from "@/components/ui/button";

const mockUsers = [
  { name: "João Paulo Pereira", role: "Gerente", imageUrl: "https://github.com/shadcn.png" },
  { name: "Maria Oliveira", role: "Analista", imageUrl: "https://i.pravatar.cc/150?img=1" },
  { name: "Carlos Souza", role: "Coordenador", imageUrl: "https://i.pravatar.cc/150?img=2" },
  { name: "Ana Lima", role: "Estagiária", imageUrl: "https://i.pravatar.cc/150?img=3" },
  { name: "Lucas Ferreira", role: "Supervisor", imageUrl: "https://i.pravatar.cc/150?img=5" },
  { name: "Jonas Ferreira", role: "Estagiário", imageUrl: "https://i.pravatar.cc/150?img=4" },
  { name: "Emanuel Costa Pereira", role: "Dono", imageUrl: "https://i.pravatar.cc/150?img=6" },
];

export default function HomePage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  const handleSelect = (name: string, selected: boolean) => {
    setSelectedUsers((prev) =>
      selected ? [...prev, name] : prev.filter((n) => n !== name)
    );
  };

  const handleContinue = () => {
    const query = selectedUsers.map((name) => `users=${encodeURIComponent(name)}`).join("&");
    router.push(`/questionnaire/questions?${query}`);
  };

  return (
    <main className="flex items-center flex-col gap-6 w-full max-w-2xl mx-auto px-4 pb-12 bg-[hsl(var(--background))]">
      <h1 className="text-4xl font-bold mt-6">
        <span className="text-[hsl(var(--primary))]">FluiMap</span>
      </h1>
      <h1 className="mt-[-10px] text-2xl text-[#6B7280] text-center">
        Selecione colegas no qual você deseja avaliar.
      </h1>

      <div className="flex justify-center items-center w-full">
        <div className="flex flex-wrap justify-center gap-6 w-full">
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

      {/* Botão normal abaixo dos cards */}
      <div className="w-full flex justify-end mt-8">
        <Button
          variant="default"
          className="px-8 py-4 text-base h-auto"
          onClick={handleContinue}
          disabled={selectedUsers.length === 0}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}