import { NextResponse } from 'next/server';
import Grafo from 'src/models/Grafo';
import { GrafoSchemaZod } from 'src/models/Grafo';

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

  // requisicao POST pro modelo R
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
  const parsed = GrafoSchemaZod.safeParse(json);

  if (!parsed.success) {
    console.error('Erro de validação Zod:', parsed.error.format());
    return NextResponse.json(
      { error: 'Formato inválido na resposta do modelo R' },
      { status: 500 }
    );
  }

  // salva o grafo no banco
  try {
    const grafo = new Grafo(parsed.data);
    await grafo.save();

    return NextResponse.json({ success: true, data: grafo });
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar o grafo no banco de dados' },
      { status: 500 }
    );
  }
}
