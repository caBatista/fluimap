import { type NextRequest, NextResponse } from 'next/server';
import Survey, { SurveySchemaZod } from '@/models/Survey';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/server/database/db';

export async function GET() {
  try {
    await dbConnect();
    const surveys = await Survey.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ surveys }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    console.log('Body recebido:', body);

    const parseResult = SurveySchemaZod.safeParse(body);
    if (!parseResult.success) {
      console.error('Erro no Zod:', parseResult.error);
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const { dateClosing, ...rest } = parseResult.data;

    if (!dateClosing || isNaN(new Date(dateClosing).getTime())) {
      return NextResponse.json({ error: 'Data de fechamento inválida' }, { status: 400 });
    }

    const surveyData = {
      ...rest,
      dateClosing: new Date(dateClosing),
    };

    console.log('Dados para criação:', surveyData);

    const newSurvey = await Survey.create(surveyData);
    return NextResponse.json({ survey: newSurvey.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar survey:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}
