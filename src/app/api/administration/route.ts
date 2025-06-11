import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';
import Team from '@/models/Team';

function normalizeId(id: unknown): string {
  return typeof id === 'string' ? id : (id?.toString?.() ?? '');
}

export async function GET() {
  try {
    await dbConnect();

    const surveys = await Survey.find({}).lean();
    const teams = await Team.find({}).lean();

    const dashboardData = await Promise.all(
      surveys.map(async (survey) => {
        const teamId = normalizeId(survey.teamId);

        const team = teams.find((t) => normalizeId(t._id) === teamId);

        return {
          surveyId: survey._id,
          surveyTitle: survey.title,
          teamName: team?.name ?? 'Time não encontrado',
          status: survey.status,
          dateClosing: survey.dateClosing,
        };
      })
    );

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Erro ao montar dashboard:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
