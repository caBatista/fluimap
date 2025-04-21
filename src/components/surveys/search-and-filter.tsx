"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFilterProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function SearchAndFilter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: SearchAndFilterProps) {
  return (
    <div className="mt-[24px] flex h-[74px] w-[1151px] items-center gap-[17px] rounded-[8px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-[17px]">
      {/* Barra de pesquisa */}
      <div className="relative h-[40px] w-[873px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Pesquisar formulário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 text-sm"
        />
      </div>

      {/* Filtro de status usando Radix Select */}
      <div className="relative flex h-[40px] w-[231px] items-center">
        <Filter className="pointer-events-none absolute top-1/2 ml-[13px] h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-[40px] w-[231px] pl-[52px] text-sm">
            <SelectValue className="" placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent className="w-[231px] text-sm">
            <SelectItem className="pl-[52px]" value="todos">
              Todos os status
            </SelectItem>
            <SelectItem className="pl-[52px]" value="ativo">
              Ativo
            </SelectItem>
            <SelectItem className="pl-[52px]" value="fechado">
              Fechado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
