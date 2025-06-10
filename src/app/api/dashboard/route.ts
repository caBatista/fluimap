import dbConnect from '@/server/database/db';
import { type NextRequest, NextResponse } from 'next/server';
import ResponseModel from '@/models/response';
import Respondee from '@/models/Respondee';
import Team from '@/models/Team';
import { type GrafoType } from '@/models/Grafo';

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

interface SurveyRequestBody {
  surveyId: string;
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

// mappings/ traduz os parametros da resposta para o modelo
const clarityMap: Record<string, number> = {
  'Nada clara': 1,
  'Pouco clara': 2,
  'Poderia ser mais clara': 3,
  'É clara o bastante': 4,
  'Muito clara': 5,
};

const objectivityMap: Record<string, number> = {
  'Nada direta': 1,
  'Pouco direta': 2,
  'Poderia ser mais direta': 3,
  'É direta o bastante': 4,
  'Muito direta': 5,
};

const effectivenessMap: Record<string, number> = {
  'Nada resolutiva': 1,
  'Pouco resolutiva': 2,
  'Poderia ser mais resolutiva': 3,
  'É resolutiva o bastante': 4,
  'Muito resolutiva': 5,
};

const frequencyMap: Record<string, string> = {
  'Todos os dias': '1x dia',
  '3/4x na semana': '4x sem',
  '1x por mês': '1x mês',
  '2x por mês': '2x mês',
  '3x por mês': '3x mês',
  '1x por semana': '1x sem',
  '2x por semana': '2x sem',
  '3x por semana': '3x sem',
  '4x por semana': '4x sem',
  '2x por dia': '2x dia',
  '3x por dia': '3x dia',
};

const directionMap: Record<string, string> = {
  'Eu recebo a informação': 'Vertical',
  'Eu passo a informação': 'Vertical',
  'Nós trocamos informações': 'Horizontal',
};

async function convertResponseToApplied(response: ResponseDBEntry): Promise<ResponseApplied> {
  const firstAnswer = response.answersByUser[0];
  if (!firstAnswer) return { nodes: [] };

  const { name, answers } = firstAnswer;
  const typedAnswers = answers as Partial<AnswerValues>;

  const respondee = await Respondee.findOne({ name: name });
  if (!respondee) {
    // console.warn(`Respondee não encontrado para: ${name}`); // DEBUG
    return { nodes: [] };
  }

  const team = await Team.findById(respondee.teamId);
  if (!team) {
    // console.warn(
    //   `Time não encontrado para respondee ${respondee.name} (teamId: ${respondee.teamId})`
    // ); // DEBUG
    return { nodes: [] };
  }

  const node: InputNode = {
    Pessoa: respondee.name,
    Papel: ['Líder', 'Membro', 'Coordenador'].includes(respondee.role) ? respondee.role : 'Membro',
    Equipe: team.name,
    Frequencia: frequencyMap[typedAnswers.q0 ?? ''] ?? '1x dia',
    Direcao: directionMap[typedAnswers.q1 ?? ''] ?? 'Vertical',
    Clareza: clarityMap[typedAnswers.q2 ?? ''] ?? 1,
    Objetividade: objectivityMap[typedAnswers.q3 ?? ''] ?? 1,
    Efetividade: effectivenessMap[typedAnswers.q4 ?? ''] ?? 1,
    Comunicacao: 'Assíncrona', // nao sei oq faço com esse campo
  };

  return { nodes: [node] };
}

// itera sob todas as responses do mesmo formulario para gerar o processamento do modelo
// modelo so processa multiplas respostas entao eh inviavel salvar os grafos no banco individualmente
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = (await req.json()) as SurveyRequestBody;
    const surveyId = body?.surveyId;

    if (!surveyId || typeof surveyId !== 'string') {
      return NextResponse.json(
        { error: 'O campo surveyId é obrigatório no corpo da requisição.' },
        { status: 400 }
      );
    }

    const responses: ResponseDBEntry[] = await ResponseModel.find({ surveyId }).lean();
    const adaptedResponses = await Promise.all(responses.map(convertResponseToApplied));
    const allNodes = adaptedResponses.flatMap((r) => r.nodes);

    if (allNodes.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const inputForR = { nodes: allNodes };

    const baseUrl = process.env.R_API_URL ?? 'http://localhost:8000';

    const response = await fetch(`${baseUrl}/gerar-grafo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputForR.nodes),
    });

    if (!response.ok) {
      console.error('Erro na requisição para o modelo R:', response.status, await response.text());
      return NextResponse.json({ error: 'Erro na requisição para o modelo R' }, { status: 500 });
    }

    const modelResults = (await response.json()) as GrafoType;

    return NextResponse.json({ nodes: allNodes, modelResults }, { status: 200 });
  } catch (err) {
    console.error('/dashboard/api', err);
    return NextResponse.json({ error: 'Erro ao processar as respostas' }, { status: 500 });
  }
}
