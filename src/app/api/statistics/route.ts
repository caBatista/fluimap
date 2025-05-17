import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';
import Team from '@/models/Team';
import Response from '@/models/response';
import TeamRespondent from '@/models/teamRespondents';
import { format } from 'date-fns';
import { Types } from 'mongoose';
import { auth } from '@clerk/nextjs/server';

interface CategoryCount {
  [key: string]: number;
}

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the current user ID from Clerk authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get teams owned by the current user
    const userTeams = await Team.find({ ownerId: userId });
    const userTeamIds = userTeams.map(team => (team._id as any).toString());
    
    if (userTeamIds.length === 0) {
      // Return empty data structure if user has no teams
      return NextResponse.json({
        totalSurveys: 0,
        completedSurveys: 0,
        totalRespondents: 0,
        responseRate: 0,
        surveyTypes: [],
        monthlyActivity: [],
        recentSurveys: [],
        teamStats: []
      });
    }
    
    // Get total surveys and count by status for user's teams
    const totalSurveys = await Survey.countDocuments({ teamId: { $in: userTeamIds } });
    const completedSurveys = await Survey.countDocuments({ 
      teamId: { $in: userTeamIds },
      status: 'fechado' 
    });
    
    // Get all surveys for user's teams
    const allSurveys = await Survey.find({ teamId: { $in: userTeamIds } });
    const surveyIds = allSurveys.map(survey => (survey._id as any).toString());
    
    // Get responses count for user's surveys
    const responses = await Response.find({ formId: { $in: surveyIds } });
    const totalRespondents = responses.length;
    
    // Calculate response rate (responses / total possible responses)
    let responseRate = 0;
    if (totalSurveys > 0 && responses.length > 0) {
      // This is an estimate - calculate based on team respondents
      const teamRespondents = await TeamRespondent.find({ teamId: { $in: userTeamIds } });
      const avgRespondentsPerTeam = teamRespondents.length / userTeamIds.length;
      const totalPossibleResponses = totalSurveys * avgRespondentsPerTeam;
      responseRate = Math.round((responses.length / (totalPossibleResponses || 1)) * 100);
    }
    
    const surveyCategories: CategoryCount = {};
    
    allSurveys.forEach(survey => {
      const title = survey.title.toLowerCase();
      if (title.includes('avaliação')) {
        surveyCategories['Avaliação'] = (surveyCategories['Avaliação'] || 0) + 1;
      } else if (title.includes('feedback')) {
        surveyCategories['Feedback'] = (surveyCategories['Feedback'] || 0) + 1;
      } else if (title.includes('satisfação')) {
        surveyCategories['Satisfação'] = (surveyCategories['Satisfação'] || 0) + 1;
      } else if (title.includes('nps')) {
        surveyCategories['NPS'] = (surveyCategories['NPS'] || 0) + 1;
      } else {
        surveyCategories['Outros'] = (surveyCategories['Outros'] || 0) + 1;
      }
    });
    
    // Convert to array format for chart
    const surveyTypes = Object.entries(surveyCategories).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Monthly activity - last 6 months
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5); // Get 6 months including current month
    
    const monthlyActivity = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthName = format(month, 'MMM');
      
      const surveysInMonth = await Survey.countDocuments({
        teamId: { $in: userTeamIds },
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      const responsesInMonth = await Response.countDocuments({
        formId: { $in: surveyIds },
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      monthlyActivity.push({
        month: monthName,
        surveys: surveysInMonth,
        responses: responsesInMonth
      });
    }
    
    
    const recentSurveys = await Survey.find({ teamId: { $in: userTeamIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    const recentSurveysWithStats = await Promise.all(
      recentSurveys.map(async (survey) => {
        const surveyId = survey._id.toString();
        const responsesForSurvey = await Response.countDocuments({ formId: surveyId });
        
        const respondentsInTeam = await TeamRespondent.countDocuments({ teamId: survey.teamId });
        const total = Math.max(respondentsInTeam, 1); // Avoid division by zero
        
        return {
          id: surveyId,
          title: survey.title,
          date: survey.createdAt || new Date(),
          responses: responsesForSurvey,
          total
        };
      })
    );
    
    // Team stats - only for teams owned by the current user
    const teamStats = await Promise.all(
      userTeams.map(async (team) => {
        const teamId = (team._id as any).toString();
        const members = await TeamRespondent.countDocuments({ teamId });
        const teamSurveys = await Survey.countDocuments({ teamId });
        
        // Get last activity date - either last survey created or last response for team's surveys
        const lastSurvey = await Survey.findOne({ teamId })
          .sort({ createdAt: -1 });
          
        const teamSurveyIds = await Survey.find({ teamId })
          .distinct('_id');
          
        const lastResponse = teamSurveyIds.length > 0 
          ? await Response.findOne({ formId: { $in: teamSurveyIds.map((id: any) => id.toString()) } })
              .sort({ createdAt: -1 })
          : null;
        
        // Fallback to current date if no activity dates are available
        const now = new Date();
        let lastActivity = team.updatedAt ?? now;
        
        if (lastSurvey && lastSurvey.createdAt && lastSurvey.createdAt > lastActivity) {
          lastActivity = lastSurvey.createdAt;
        }
        
        if (lastResponse && lastResponse.createdAt && lastResponse.createdAt > lastActivity) {
          lastActivity = lastResponse.createdAt;
        }
        
        return {
          id: teamId,
          name: team.name,
          members,
          surveys: teamSurveys,
          lastActivity: format(new Date(lastActivity), 'dd/MM/yyyy')
        };
      })
    );
    
    // Return the statistics
    return NextResponse.json({
      totalSurveys,
      completedSurveys,
      totalRespondents,
      responseRate,
      surveyTypes,
      monthlyActivity,
      recentSurveys: recentSurveysWithStats,
      teamStats
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
