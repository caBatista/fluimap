import * as React from "react";

import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";
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
  icon1?: LucideIcon;
  button2?: string;
  icon2?: LucideIcon;
  onOpenModal?: () => void;
  onDelete?: () => void;
}

export function Cards({
  name,
  description,
  button1,
  icon1: Icon1,
  button2,
  icon2: Icon2,
  onOpenModal,
  onDelete,
}: CardsProps) {
  return (
    <Card className="flex h-auto max-h-[600px] min-h-[200px] w-full flex-col rounded-lg border-2 border-white shadow-lg dark:border-2 dark:border-white dark:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),_0_4px_6px_-2px_rgba(255,255,255,0.05)]">
      <CardHeader className="flex h-[60px] items-center justify-between p-0">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="ml-4 mt-2 text-left text-xl">{name}</CardTitle>

          <div className="mr-2 flex gap-2">
            <button
              className={
                "flex items-center gap-2 rounded-md bg-white px-2 py-2 text-black dark:bg-gray-950 dark:text-white"
              }
              onClick={() => console.log("Editar", name)}
            >
              <PencilIcon className="h-5 w-5 text-gray-800 dark:text-white" />
            </button>
            <button
              className={
                "flex items-center gap-2 rounded-md bg-white px-2 py-2 text-black dark:bg-gray-950 dark:text-white"
              }
              onClick={onDelete}
            >
              <TrashIcon className="h-5 w-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      </CardHeader>

      <div className="mb-4 ml-6 flex flex-1 items-center justify-start">
        <CardDescription>{description}</CardDescription>
      </div>

      <CardFooter className="mb-2 mt-auto flex justify-center gap-x-2">
        <Button
          variant="outline"
          className="border border-black dark:border-white"
        >
          {Icon1 && <Icon1 className="h-4 w-4" />}
          {button1}
        </Button>
        <Button
          variant="outline"
          className="border border-black dark:border-white"
          onClick={onOpenModal}
        >
          {Icon2 && <Icon2 className="h-4 w-4" />}
          {button2}
        </Button>
      </CardFooter>
    </Card>
  );
}
