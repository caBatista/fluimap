import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';
import Team from '@/models/Team';
import Response from '@/models/response';
import Respondee from '@/models/Respondee';
import { format } from 'date-fns';
import { auth } from '@clerk/nextjs/server';
import type { Document, Types } from 'mongoose';

type CategoryCount = Record<string, number>;

interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  ownerId: string;
  updatedAt: Date;
}

interface ISurvey extends Document {
  _id: Types.ObjectId;
  title: string;
  teamId: string;
  status: string;
  createdAt: Date;
}

type LeanSurvey = {
  _id: string;
  title: string;
  teamId: string;
  status: string;
  createdAt: Date;
  __v: number;
};

export async function GET() {
  try {
    await dbConnect();
    const { userId } = await auth();

    if (!userId) {
      console.log('[STATISTICS] Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTeams = (await Team.find({ ownerId: userId })) as unknown as ITeam[];

    const userTeamIds = userTeams.map((team) => team._id.toString());

    if (userTeamIds.length === 0) {
      console.log('[STATISTICS] No teams found for user');
      return NextResponse.json({
        totalSurveys: 0,
        completedSurveys: 0,
        totalRespondents: 0,
        responseRate: 0,
        surveyTypes: [],
        monthlyActivity: [],
        recentSurveys: [],
        teamStats: [],
      });
    }

    const totalSurveys = await Survey.countDocuments({ teamId: { $in: userTeamIds } });
    const completedSurveys = await Survey.countDocuments({
      teamId: { $in: userTeamIds },
      status: 'fechado',
    });

    const allSurveys = (await Survey.find({
      teamId: { $in: userTeamIds },
    })) as unknown as ISurvey[];

    const surveyIds = allSurveys.map((survey) => survey._id.toString());

    const totalRespondents = await Respondee.countDocuments({ teamId: { $in: userTeamIds } });

    let responseRate = 0;
    if (totalSurveys > 0 && totalRespondents > 0) {
      const teamRespondents = await Respondee.find({ teamId: { $in: userTeamIds } });
      console.log('[STATISTICS] teamRespondents:', teamRespondents);
      const avgRespondentsPerTeam = teamRespondents.length / userTeamIds.length;
      const totalPossibleResponses = totalSurveys * avgRespondentsPerTeam;
      responseRate = Math.round((totalRespondents / (totalPossibleResponses ?? 1)) * 100);
      console.log(
        '[STATISTICS] avgRespondentsPerTeam:',
        avgRespondentsPerTeam,
        'totalPossibleResponses:',
        totalPossibleResponses,
        'responseRate:',
        responseRate
      );
    }

    const surveyCategories: CategoryCount = {};

    allSurveys.forEach((survey) => {
      const title = survey.title.toLowerCase();
      if (title.includes('avaliação')) {
        surveyCategories.Avaliação = (surveyCategories.Avaliação ?? 0) + 1;
      } else if (title.includes('feedback')) {
        surveyCategories.Feedback = (surveyCategories.Feedback ?? 0) + 1;
      } else if (title.includes('satisfação')) {
        surveyCategories.Satisfação = (surveyCategories.Satisfação ?? 0) + 1;
      } else if (title.includes('nps')) {
        surveyCategories.NPS = (surveyCategories.NPS ?? 0) + 1;
      } else {
        surveyCategories.Outros = (surveyCategories.Outros ?? 0) + 1;
      }
    });

    const surveyTypes = Object.entries(surveyCategories).map(([name, value]) => ({
      name,
      value,
    }));

    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);

    const monthlyActivity = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);

      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthName = format(month, 'MMM');

      const surveysInMonth = await Survey.countDocuments({
        teamId: { $in: userTeamIds },
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      const responsesInMonth = await Response.countDocuments({
        formId: { $in: surveyIds },
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      monthlyActivity.push({
        month: monthName,
        surveys: surveysInMonth,
        responses: responsesInMonth,
      });
    }

    const recentSurveys = (await Survey.find({ teamId: { $in: userTeamIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()) as unknown as LeanSurvey[];

    const recentSurveysWithStats = await Promise.all(
      recentSurveys.map(async (survey) => {
        let count = 0;
        try {
          count = await Response.countDocuments({ surveyId: survey._id });
        } catch (e) {
          console.error('Erro ao contar respostas do survey', survey._id, e);
        }

        const respondentsInTeam = await Respondee.countDocuments({ teamId: survey.teamId });
        const total = Math.max(respondentsInTeam, 1);

        return {
          id: survey._id,
          title: survey.title,
          date: survey.createdAt ?? new Date(),
          responses: count,
          responsesCount: count,
          respondents: respondentsInTeam,
          total,
        };
      })
    );

    const teamStats = await Promise.all(
      userTeams.map(async (team) => {
        const teamId = team._id.toString();
        const members = await Respondee.countDocuments({ teamId });
        const teamSurveys = await Survey.countDocuments({ teamId });
        console.log(
          `[STATISTICS] Team ${team.name} (${teamId}) members:`,
          members,
          'teamSurveys:',
          teamSurveys
        );

        const lastSurvey = (await Survey.findOne({ teamId }).sort({
          createdAt: -1,
        })) as ISurvey | null;
        const teamSurveyIds = (await Survey.find({ teamId }).distinct('_id')) as Types.ObjectId[];

        const lastResponse =
          teamSurveyIds.length > 0
            ? await Response.findOne({
                formId: { $in: teamSurveyIds.map((id) => id.toString()) },
              }).sort({ createdAt: -1 })
            : null;

        const now = new Date();
        let lastActivity = team.updatedAt ?? now;

        if (lastSurvey?.createdAt && lastSurvey.createdAt > lastActivity) {
          lastActivity = lastSurvey.createdAt;
        }

        if (lastResponse?.createdAt && lastResponse.createdAt > lastActivity) {
          lastActivity = lastResponse.createdAt;
        }

        return {
          id: teamId,
          name: team.name,
          members,
          surveys: teamSurveys,
          lastActivity: format(new Date(lastActivity), 'dd/MM/yyyy'),
        };
      })
    );

    const result = {
      totalSurveys,
      completedSurveys,
      totalRespondents,
      responseRate,
      surveyTypes,
      monthlyActivity,
      recentSurveys: recentSurveysWithStats,
      teamStats,
    };
    console.log('[STATISTICS] FINAL RESULT:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
