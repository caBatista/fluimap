import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import ResponseModel, { ResponseSchemaZod } from '@/models/response';
import Survey from '@/models/Survey';
import Respondee from '@/models/Respondee';

export async function POST(req: NextRequest) {
  await dbConnect();

  // 1) lê corretamente o JSON
  const raw: unknown = await req.json();

  // 2) valida com Zod
  const parse = ResponseSchemaZod.safeParse(raw);
  if (!parse.success) {
    console.log('Zod Issues:', parse.error.issues);
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }

  // 3) persiste e devolve o documento criado
  const created = await ResponseModel.create(parse.data);

  // 4) Após salvar a resposta, verifica se todos os respondees já responderam
  const { surveyId } = parse.data;
  if (surveyId) {
    // Busca o survey
    const survey = await Survey.findById(surveyId).lean();
    if (survey) {
      // Busca todos os respondees do time do survey
      const respondees = await Respondee.find({ teamId: survey.teamId }).lean();
      // Busca todos os emails que já responderam para esse survey
      const responses = await ResponseModel.find({ surveyId }).lean();
      const answeredEmails = new Set(responses.map(r => r.email));
      const allAnswered = respondees.every(r => answeredEmails.has(r.email));
      if (allAnswered && survey.status === 'ativo') {
        // Fecha o survey
        await Survey.findByIdAndUpdate(surveyId, { status: 'fechado', dateClosing: new Date() });
      }
    }
  }

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
