import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Questionnaire from '@/models/Questionnaire';
import { z } from 'zod';

const questionnaireResponseSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;

// GET: lista todos os questionários
export async function GET() {
  try {
    await dbConnect();
    const all = await Questionnaire.find().lean();
    return NextResponse.json({ questionnaires: all }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error fetching questionnaires:', err);
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: recebe e processa as respostas enviadas
export async function POST(request: Request) {
  try {
    await dbConnect();
    const raw: unknown = await request.json();
    const payload: QuestionnaireResponse[] = questionnaireResponseSchema.array().parse(raw);
    // TODO: persistir payload no banco ou outro processamento
    console.log('Received questionnaire answers:', payload);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error handling POST /api/questionnaires:', err);
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
