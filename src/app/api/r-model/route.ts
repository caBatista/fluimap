import { NextResponse } from 'next/server';
import { grafoSchema } from 'src/models/Grafo';

interface InputFormat {
  nodes: Array<{
    Pessoa: string;
    Papel: string;
    Frequencia: string | number;
    Direcao?: string;
    Clareza?: number;
    Objetividade?: number;
    Efetividade?: number;
    Comunicacao?: string;
  }>;
  edges: Array<{
    Pessoa: string;
    Pessoa2: string;
    Equipe: string;
    weight: number;
  }>;
}

export async function POST(request: Request) {
  const input = (await request.json()) as InputFormat;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gerar-grafo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Erro na requisição para o modelo R' },
      { status: response.status }
    );
  }

  const json: unknown = await response.json();
  const parsed = grafoSchema.safeParse(json);

  if (!parsed.success) {
    console.error('Erro de validacao Zod:', parsed.error.format());
    return NextResponse.json(
      { error: 'Formato invalido na resposta do modelo R' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: parsed.data });
}
