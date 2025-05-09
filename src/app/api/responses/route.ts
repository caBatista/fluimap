import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import ResponseModel, { ResponseSchemaZod } from '@/models/response';

export async function POST(req: NextRequest) {
  await dbConnect();

  // 1) lê corretamente o JSON
  const raw: unknown = await req.json();

  // 2) valida com Zod
  const parse = ResponseSchemaZod.safeParse(raw);
  if (!parse.success) {
    // se falhar, devolve só os issues para o cliente
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }

  // 3) persiste e devolve o documento criado
  const created = await ResponseModel.create(parse.data);
  return NextResponse.json({ response: created.toObject() }, { status: 201 });
}

export async function GET(req: NextRequest) {
  await dbConnect();

  // pega surveyId da query string
  const surveyId = req.nextUrl.searchParams.get('surveyId');
  if (!surveyId) {
    return NextResponse.json({ error: 'Missing surveyId' }, { status: 400 });
  }

  // conta quantas respostas esse formulário já tem
  const count = await ResponseModel.countDocuments({ formId: surveyId });
  return NextResponse.json({ count }, { status: 200 });
}
