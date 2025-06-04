import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const survey = await Survey.find({ id }).lean();
    if (!survey) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ survey }, { status: 200 });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
