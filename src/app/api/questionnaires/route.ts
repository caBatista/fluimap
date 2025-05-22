import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Questionnaire from '@/models/Questionnaire';

// Garante conexão com o Mongo
await dbConnect();

// GET: lista todos os questionários
export async function GET() {
  try {
    const all = await Questionnaire.find().lean();
    return NextResponse.json({ questionnaires: all }, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Error fetching questionnaires:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: recebe e processa as respostas enviadas
export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    // TODO: persistir payload no banco ou outro processamento
    console.log('Received questionnaire answers:', payload);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Error handling POST /api/questionnaires:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
