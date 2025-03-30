"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tipagem para as propriedades da modal genérica
interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode; // conteúdo dinâmico
}

export function GenericModal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: GenericModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg bg-white text-black shadow-xl dark:bg-black dark:text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* O conteúdo da modal será passado por `children` */}
        <div className="mb-2 grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
