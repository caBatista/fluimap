import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

interface RModelData {
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

interface Trend {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

export async function POST(request: Request) {
  try {
    const { rModelData } = (await request.json()) as { rModelData: RModelData };

    if (!rModelData) {
      return NextResponse.json({ error: 'R model data is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analise os seguintes dados do modelo R sobre o engajamento da equipe e forneça um resumo conciso:
      
      Dados dos Nós (Pessoas):
      ${JSON.stringify(rModelData.nodes, null, 2)}
      
      Dados das Conexões:
      ${JSON.stringify(rModelData.edges, null, 2)}
      
      Por favor, forneça:
      1. Um resumo geral do estado atual da equipe, incluindo:
         - Níveis de comunicação
         - Clareza e objetividade nas interações
         - Efetividade das relações
      2. Principais pontos de atenção:
         - Relações que precisam de mais atenção
         - Padrões de comunicação que podem ser melhorados
      3. Sugestões de melhorias:
         - Como melhorar a comunicação
         - Como fortalecer as relações
         - Como aumentar a efetividade
      
      Mantenha o resumo conciso e direto ao ponto.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Transform the data into trends format
    const trends: Trend[] = [
      {
        title: 'Comunicação',
        description: `Nível de comunicação: ${calculateCommunicationScore(rModelData.nodes)}%`,
        type: 'info',
      },
      {
        title: 'Atenção Necessária',
        description: `${countLowScores(rModelData.nodes)} relações precisam de atenção`,
        type: 'warning',
      },
      {
        title: 'Efetividade',
        description: `Efetividade média: ${calculateEffectivenessScore(rModelData.nodes)}%`,
        type: 'success',
      },
    ];

    return NextResponse.json({
      analysis: text,
      trends,
    });
  } catch (error) {
    console.error('Error in Team Analysis API:', error);
    return NextResponse.json({ error: 'Failed to process team analysis' }, { status: 500 });
  }
}

function calculateCommunicationScore(nodes: RModelData['nodes']): number {
  const scores = nodes
    .filter((node) => node.Comunicacao !== undefined)
    .map((node) => {
      const score = Number(node.Comunicacao);
      return isNaN(score) ? 0 : score;
    });

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function countLowScores(nodes: RModelData['nodes']): number {
  return nodes.filter((node) => {
    const scores = [node.Clareza ?? 0, node.Objetividade ?? 0, node.Efetividade ?? 0];
    return scores.some((score) => score < 6);
  }).length;
}

function calculateEffectivenessScore(nodes: RModelData['nodes']): number {
  const scores = nodes
    .filter((node) => node.Efetividade !== undefined)
    .map((node) => node.Efetividade ?? 0);

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
