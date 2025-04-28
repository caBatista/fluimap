import * as React from 'react';

import { Button } from '@/components/ui/button';
import { UserIcon, UserPlus } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface CardsProps {
  name: string;
  description?: string;
  onOpenModal?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function Cards({ name, description, onOpenModal, onDelete, onEdit }: CardsProps) {
  return (
    <Card className="w-35 flex h-[200px] flex-col rounded-lg border-2 border-white pt-4 shadow-lg dark:border-2 dark:border-white dark:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),_0_4px_6px_-2px_rgba(255,255,255,0.05)]">
      <CardHeader className="flex items-center justify-between p-0">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="pl-4 pt-2 text-left text-xl">{name}</CardTitle>

          <div className="flex gap-2 pr-2">
            <Button
              className={
                'hover:bg-accent dark:hover:bg-accent flex items-center gap-2 rounded-md border-none px-3 py-3 text-secondary shadow-none dark:border-0 dark:bg-transparent dark:text-foreground'
              }
              onClick={onEdit}
            >
              <PencilIcon className="h-5 w-5 text-secondary dark:text-foreground" />
            </Button>
            <Button
              className="hover:bg-accent dark:hover:bg-accent flex items-center gap-2 rounded-md border-none px-3 py-3 text-secondary shadow-none dark:border-0 dark:bg-transparent dark:text-foreground"
              onClick={onDelete}
            >
              <TrashIcon className="h-5 w-5 text-secondary dark:text-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-1 items-center justify-start pb-4 pl-6">
        <CardDescription>{description}</CardDescription>
      </div>

      <CardFooter className="flex flex-col justify-center gap-2 px-4 pb-6 sm:flex-row">
        <Button
          variant="outline"
          className="w-full min-w-[120px] max-w-[120px] flex-1 text-ellipsis whitespace-nowrap border border-black dark:border-white sm:w-auto"
        >
          <UserIcon className="h-4 w-4 shrink-0" />
          Ver Membros
        </Button>
        <Button
          variant="outline"
          className="w-full min-w-[160px] max-w-[160px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap border border-black dark:border-white sm:w-auto"
          onClick={onOpenModal}
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          Adicionar Membros
        </Button>
      </CardFooter>
    </Card>
  );
}
