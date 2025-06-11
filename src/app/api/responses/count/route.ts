import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';
import ResponseModel from '@/models/response';

export async function GET() {
  await dbConnect();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const surveys = await Survey.find({ ownerId: userId }, '_id').lean();
  const surveyIds = surveys.map((s) => s._id);

  const responsesCount = await ResponseModel.countDocuments({ surveyId: { $in: surveyIds } });

  return NextResponse.json({ count: responsesCount });
}