import { NextResponse } from 'next/server';
import Questionnaire from '@/models/Questionnaire';
import dbConnect from '@/server/database/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const q = await Questionnaire.findById(id).lean();
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ questionnaire: q }, { status: 200 });
}
