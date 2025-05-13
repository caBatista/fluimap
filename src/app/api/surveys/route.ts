import { type NextRequest, NextResponse } from 'next/server';
import Survey, { SurveySchemaZod, type SurveyType } from '@/models/Survey';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/server/database/db';
import Questionnaire from '@/models/Questionnaire';
import ResponseModel from '@/models/response';
import { z } from 'zod';

const InputSurveySchema = SurveySchemaZod.omit({ questionnaireIds: true }).extend({
  status: z.enum(['ativo', 'fechado']),
});

export async function GET() {
  await dbConnect();

const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const surveys = await Survey.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();
  const now = new Date();

  const detailed = await Promise.all(
    surveys.map(async (s) => {
      if (s.dateClosing && s.dateClosing < now && s.status !== 'fechado') {
        await Survey.updateOne({ _id: s._id }, { status: 'fechado' });
        s.status = 'fechado';
      }

      const responsesCount = await ResponseModel.countDocuments({ surveyId: s._id });

      const qs = await Questionnaire.find(
        {
          _id: { $in: s.questionnaireIds },
        },
        'questions'
      ).lean();
      const totalQuestions = qs.reduce((sum, q) => sum + q.questions.length, 0);
      const progress = totalQuestions ? Math.round((responsesCount / totalQuestions) * 100) : 0;

      return {
        ...s,
        responsesCount,
        progress,
      };
    })
  );

  return NextResponse.json({ surveys: detailed }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody: unknown = await request.json();

    const bodyWithOwner = {
      ...(rawBody as Record<string, unknown>),
      ownerId: userId,
    };

    const parseResult = InputSurveySchema.safeParse(bodyWithOwner);
    if (!parseResult.success) {
      console.error('Erro no Zod:', parseResult.error);
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const input = parseResult.data;

    const qs = await Questionnaire.find({
      section: { $in: ['communicationPeers', 'wellBeing', 'jobMeaning'] },
    })
      .sort({ section: 1 })
      .lean();
    if (qs.length !== 3) {
      return NextResponse.json(
        { error: 'Precisamos de exatamente 3 Questionnaires cadastrados' },
        { status: 500 }
      );
    }

    const questionnaireIds = qs.map((q) => String(q._id));

    const surveyData: SurveyType = {
      ...input,
      ownerId: userId,
      questionnaireIds,
      dateClosing: new Date(input.dateClosing),
    };

    SurveySchemaZod.parse(surveyData);

    const newSurvey = await Survey.create(surveyData);
    return NextResponse.json({ survey: newSurvey.toObject() }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar survey:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}
