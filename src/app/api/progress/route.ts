import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import UserTeam from '@/models/userTeam';
import Analytics from '@/models/analytics';
import { z } from 'zod';

const progressRequestSchema = z.object({
  formId: z.string(),
  teamId: z.string(),
});

type ProgressRequest = z.infer<typeof progressRequestSchema>;

export async function POST(request: Request) {
  try {
    await dbConnect();

    const raw: unknown = await request.json();
    const payload: ProgressRequest = progressRequestSchema.parse(raw);

    const totalPeople = await UserTeam.countDocuments({ teamId: payload.teamId });
    const analyticsData = await Analytics.findOne({ formId: payload.formId });
    const totalReplies = analyticsData?.totalReplies ?? 0;

    return NextResponse.json({ totalPeople, totalReplies }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error handling POST /api/progress:', err);
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
