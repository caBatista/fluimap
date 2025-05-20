import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Questionnaire from '@/models/Questionnaire';

// Garante conexão com o Mongo
await dbConnect();

type QuestionnairePayload = Record<string, unknown>;

// GET: lista todos os questionários
export async function GET() {
  try {
    const all = await Questionnaire.find().lean();
    return NextResponse.json({ questionnaires: all }, { status: 200 });
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: recebe e processa as respostas enviadas
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuestionnairePayload;
    // TODO: persistir payload no banco ou outro processamento
    console.log('Received questionnaire answers:', payload);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error handling POST /api/questionnaires:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
