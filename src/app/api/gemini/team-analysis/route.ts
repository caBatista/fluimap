import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const ResponseSchemaZod = z.object({
  surveyId: z.string(),
  questionnaireId: z.string(),
  email: z.string().email(),
  answersByUser: z.array(
    z.object({
      name: z.string(),
      answers: z.record(z.string(), z.string()),
    })
  ),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});
type ResponseType = z.infer<typeof ResponseSchemaZod>;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

export async function POST(request: Request) {
  try {
    const bodyRaw: unknown = await request.json();
    const body =
      typeof bodyRaw === 'object' && bodyRaw !== null ? (bodyRaw as Record<string, unknown>) : {};
    const responsesRaw = Array.isArray(body.responses) ? body.responses : [];
    if (responsesRaw.length === 0) {
      return NextResponse.json({ error: 'Responses array is required' }, { status: 400 });
    }
    const responses: ResponseType[] = responsesRaw
      .map((r: unknown) => {
        const parsed = ResponseSchemaZod.safeParse(r);
        return parsed.success ? parsed.data : null;
      })
      .filter((r): r is ResponseType => r !== null);
    if (responses.length === 0) {
      return NextResponse.json({ error: 'No valid responses' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const answersSummary = responses
      .map((resp, idx) => {
        return (
          `Resposta #${idx + 1} (email: ${resp.email}):\n` +
          resp.answersByUser
            .map(
              (a: { name: string; answers: Record<string, string> }) =>
                `- ${a.name}: ${Object.entries(a.answers)
                  .map(([q, ans]) => `${q}: ${ans}`)
                  .join('; ')}`
            )
            .join('\n')
        );
      })
      .join('\n\n');

    const prompt = `
        Analise as respostas abaixo de um questionário de equipe.
        
        ${answersSummary}
        
        Por favor, forneça um resumo exatamente em  formato MD, mantendo uma estrutura clara e concisa, respondendo de forma resumida e destacando os principais pontos de engajamento da equipe. A resposta deve ser exatamente no seguinte formato, usando os simbolos de Markdown para formatação e alguns emojis nos titulos das sessões para destacar os pontos principais:
        
        ### um paragrafo resumindo o indice de engajamento da equipe
        ### um paragrafo resumindo a comunicação da equipe
        ### um paragrafo resumindo os pontos fortes da equipe 
        ### um paragrafo resumindo os pontos fracos da equipe
        
        Uma lista de pontos que precisam de atenção imediata, com base nas respostas.


        ### Um paragrafo contendo sugestões de melhorias que podem ser implementadas para aumentar o engajamento e a eficácia da equipe.
        `;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      analysis: text,
    });
  } catch (error) {
    console.error('Error in Team Analysis API:', error);
    return NextResponse.json({ error: 'Failed to process team analysis' }, { status: 500 });
  }
}
