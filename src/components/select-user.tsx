"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";

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
        className={`w-[200px] h-[150px] border-[5px] transition-all duration-200 
        ${selected ? "border-primary" : "border-transparent"} 
        hover:border-primary flex items-center justify-center`}
      >
        <CardHeader className="flex items-center gap-3">
          <Avatar className="w-[50px] h-[50px]">
            {imageUrl ? (
              <AvatarImage src={imageUrl} />
            ) : (
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{role}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </button>
  );
}