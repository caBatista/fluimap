import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const survey = await Survey.find({ id }).lean();
  if (!survey) {
    return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
  }
  return NextResponse.json({ survey }, { status: 200 });
}
