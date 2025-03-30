import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";

interface CardsProps {
  name: string;
  description?: string;
  button1?: string;
  button2?: string;
  onOpenModal?: () => void;
}

export function Cards({
  name,
  description,
  button1,
  button2,
  onOpenModal,
}: CardsProps) {
  return (
    <Card className="flex h-[200px] w-[350px] flex-col rounded-lg border-0 shadow-lg">
      <CardHeader className="flex h-[60px] items-center justify-between p-0">
        {/* CardTitle à esquerda */}
        <div className="flex w-full items-center justify-between">
          {/* Título à esquerda */}
          <CardTitle className="ml-4 text-left text-xl">{name}</CardTitle>

          {/* Botões à direita */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-md bg-white px-2 py-2 text-black">
              <PencilIcon className="h-5 w-5 text-gray-800" />
            </button>
            <button className="flex items-center gap-2 rounded-md bg-white px-2 py-2 text-black">
              <TrashIcon className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>
      </CardHeader>

      {/* CardDescription - Ajuste de margem esquerda (pode ser ajustado conforme necessário) */}
      <div className="mb-4 ml-6 flex flex-1 items-center justify-start">
        <CardDescription>{description}</CardDescription>
      </div>

      {/* CardFooter - Aumentar o espaçamento inferior com margin */}
      <CardFooter className="mb-2 mt-auto flex justify-center gap-x-2">
        <Button className="rounded-md border border-black bg-white px-3 py-1 text-sm text-black">
          {button1}
        </Button>
        <Button
          className="rounded-md border border-black bg-white px-3 py-1 text-sm text-black"
          onClick={onOpenModal}
        >
          {button2}
        </Button>
      </CardFooter>
    </Card>
  );
}
