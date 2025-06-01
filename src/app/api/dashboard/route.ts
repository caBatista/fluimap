import dbConnect from '@/server/database/db';
import { NextResponse } from 'next/server';
import ResponseModel from '@/models/response';

type AnswerMap = Record<string, string>;

interface AnswerByUser {
  name: string;
  answers: AnswerMap;
}

// cast dos entries do banco
interface ResponseDBEntry {
  answersByUser: AnswerByUser[];
}

// cast para o formato esperado pelo modelo
interface ResponseApplied {
  nodes: InputNode[];
}

interface InputNode {
  Pessoa: string;
  Papel: string;
  Equipe: string;
  Frequencia: string | number;
  Direcao?: string;
  Clareza?: number;
  Objetividade?: number;
  Efetividade?: number;
  Comunicacao?: string;
}

interface AnswerValues {
  q0: string; // frequencia
  q1: string; // direcao
  q2: string; // clareza
  q3: string; // objetividade
  q4: string; // efetividade
}

// mappings
const clarityMap: Record<string, number> = {
  'Nada clara': 1,
  'Pouco clara': 2,
  'Razoavelmente clara': 3,
  Clara: 4,
  'Muito clara': 5,
};

const objectivityMap: Record<string, number> = {
  'Nada direta': 1,
  'Pouco direta': 2,
  'Razoavelmente direta': 3,
  Direta: 4,
  'Muito direta': 5,
};

const effectivenessMap: Record<string, number> = {
  'Nada resolutiva': 1,
  'Pouco resolutiva': 2,
  'Razoavelmente resolutiva': 3,
  Resolutiva: 4,
  'Muito resolutiva': 5,
};

const frequencyMap: Record<string, string> = {
  '1x por mês': '1x mês',
  '2x por mês': '2x mês',
  '1x por semana': '1x sem',
  '2x por semana': '2x sem',
  '3x por semana': '3x sem',
  '4x por semana': '4x sem',
  'Todos os dias': '1x dia',
  '2x por dia': '2x dia',
  '3x por dia': '3x dia',
};

const directionMap: Record<string, string> = {
  'Eu recebo a informação': 'Vertical',
  'Eu passo a informação': 'Vertical',
  'Nós trocamos informações': 'Horizontal',
};

function convertResponseToApplied(response: ResponseDBEntry): ResponseApplied {
  const firstAnswer = response.answersByUser[0];
  if (!firstAnswer) return { nodes: [] };

  const { name, answers } = firstAnswer;

  const typedAnswers = answers as Partial<AnswerValues>;

  const node: InputNode = {
    Pessoa: name, // TO DO: atualmente esta passando o email
    Papel: 'Membro', // TO DO: incluir role no response model
    Equipe: 'Time A', // TO DO: incluir time no response model
    Frequencia: frequencyMap[typedAnswers.q0 ?? ''] ?? '1x dia',
    Direcao: directionMap[typedAnswers.q1 ?? ''] ?? 'Vertical',
    Clareza: clarityMap[typedAnswers.q2 ?? ''] ?? 3,
    Objetividade: objectivityMap[typedAnswers.q3 ?? ''] ?? 3,
    Efetividade: effectivenessMap[typedAnswers.q4 ?? ''] ?? 3,
    Comunicacao: 'Assíncrona',
  };

  return { nodes: [node] };
}

export async function GET() {
  try {
    await dbConnect();

    const responses: ResponseDBEntry[] = await ResponseModel.find().lean();
    const adaptedResponses = responses.map(convertResponseToApplied);
    const allNodes = adaptedResponses.flatMap((r) => r.nodes);

    const inputForR = { nodes: allNodes };

    console.log('Enviando para API R (input):', JSON.stringify(inputForR, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gerar-grafo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputForR.nodes),
    });

    if (!response.ok) {
      console.error('Erro na requisição para o modelo R:', response.status, await response.text());
      return NextResponse.json({ error: 'Erro na requisição para o modelo R' }, { status: 500 });
    }

    const modelResults = (await response.json()) as unknown;
    console.log('Resposta da API R (output):', JSON.stringify(modelResults, null, 2));

    return NextResponse.json({ nodes: allNodes, modelResults }, { status: 200 });
  } catch (err) {
    console.error('/dashboard/api', err);
    return NextResponse.json({ error: 'Erro ao processar as respostas' }, { status: 500 });
  }
}
