'use client';

import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="flex max-h-screen min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-primary px-6 text-center text-white">
      <h1 className="mb-8 text-2xl font-semibold">
        Flu<span className="font-bold">iMap</span>
      </h1>
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-4xl font-bold">Parabéns!</h2>
        <p className="text-lg leading-relaxed">
          seu formulário foi
          <br />
          finalizado e enviado
          <br />
          com sucesso!!
        </p>
        <CheckCircle size={72} strokeWidth={1.5} />
      </div>
    </div>
  );
}
