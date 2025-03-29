"use client";

import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white text-center px-6">
      <h1 className="text-2xl font-semibold mb-10 mt-[-60px]">Flu<span className="font-bold">iMap</span></h1>
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-4xl font-bold">Parabéns!</h2>
        <p className="text-lg leading-relaxed">
          seu formulário foi<br />
          finalizado e enviado<br />
          com sucesso!!
        </p>
        <CheckCircle size={72} strokeWidth={1.5} className="mt-[-20px] ml-[145px]" />
      </div>
    </div>
  );
}