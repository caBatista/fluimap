'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription } from './card';

interface SelectUserProps {
  name: string;
  role: string;
  imageUrl?: string;
  onSelect: (name: string, selected: boolean) => void;
}

export function SelectUser({ name, role, imageUrl, onSelect }: SelectUserProps) {
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    const newState = !selected;
    setSelected(newState);
    onSelect(name, newState);
  };

  return (
    <button onClick={handleClick}>
      <Card
        className={`h-[120px] w-[160px] border-[5px] bg-background transition-all duration-200 sm:h-[150px] sm:w-[200px] ${selected ? 'border-primary' : 'border-transparent'} flex items-center justify-center hover:border-primary`}
      >
        <CardHeader className="flex items-center gap-3 p-2 sm:p-4">
          <Avatar className="h-10 w-10 sm:h-[50px] sm:w-[50px]">
            {imageUrl ? (
              <AvatarImage src={imageUrl} />
            ) : (
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-sm sm:text-base">{name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{role}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </button>
  );
}
