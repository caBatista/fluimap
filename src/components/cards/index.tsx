import * as React from 'react';

import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface CardsProps {
  name: string;
  description?: string;
  button1?: string;
  icon1?: LucideIcon;
  button2?: string;
  icon2?: LucideIcon;
  onOpenModal?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
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
  onEdit,
}: CardsProps) {
  return (
    <Card className="flex h-auto max-h-[600px] min-h-[200px] w-full flex-col rounded-lg border-2 border-white shadow-lg dark:border-2 dark:border-white dark:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),_0_4px_6px_-2px_rgba(255,255,255,0.05)]">
      <CardHeader className="flex h-[60px] items-center justify-between p-0">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="pl-4 pt-2 text-left text-xl">{name}</CardTitle>

          <div className="flex gap-2 pr-2">
            <Button
              className="hover:bg-accent dark:hover:bg-accent flex items-center gap-2 rounded-md border-none bg-white px-3 py-3 text-black shadow-none dark:border-0 dark:bg-transparent dark:text-white"
              onClick={onEdit}
            >
              <PencilIcon className="h-5 w-5 text-gray-800 dark:text-white" />
            </Button>
            <Button
              className="hover:bg-accent dark:hover:bg-accent flex items-center gap-2 rounded-md border-none bg-white px-3 py-3 text-black shadow-none dark:border-0 dark:bg-transparent dark:text-white"
              onClick={onDelete}
            >
              <TrashIcon className="h-5 w-5 text-black dark:text-white" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-1 items-center justify-start pb-4 pl-6">
        <CardDescription>{description}</CardDescription>
      </div>

      <CardFooter className="mt-auto flex w-full flex-col gap-2 px-4 pb-2 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          className="w-full min-w-0 justify-center truncate text-ellipsis border border-black dark:border-white sm:w-auto"
        >
          {Icon1 && <Icon1 className="h-4 w-4 pr-2" />}
          {button1}
        </Button>
        <Button
          variant="outline"
          className="w-full min-w-0 justify-center truncate text-ellipsis border border-black dark:border-white sm:w-auto"
          onClick={onOpenModal}
        >
          {Icon2 && <Icon2 className="h-4 w-4 pr-2" />}
          {button2}
        </Button>
      </CardFooter>
    </Card>
  );
}
