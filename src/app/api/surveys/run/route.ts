import { type NextRequest, NextResponse } from 'next/server';
import Team from '@/models/Team';
import Respondee from '@/models/Respondee';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import dbConnect from '@/server/database/db';
import SurveyEmail from '@/components/email/email-template';
import { env } from '@/env';
import { Resend } from 'resend';

function generateSurveyId(): string {
  return crypto.randomBytes(5).toString('hex');
}

async function sendEmail({ name, email, link }: { name: string; email: string; link: string }) {
  const resend = new Resend(env.RESEND_API_KEY);
  console.log(`Sending email to ${email}:`);
  console.log(`Survey link: ${link}`);

  const { data, error } = await resend.emails.send({
    from: 'Fluimap <admin@southlikesoftware.com>',
    to: [email],
    subject: 'Your survey is waiting',
    react: SurveyEmail({
      username: name,
      link,
    }),
  });

  if (error) {
    console.error('Error sending email:', error);
  }

  console.log(`Email sent successfully to ${email}`);

  return data;
}

interface SurveyRunResponse {
  success: boolean;
  surveyId: string;
  respondeeCount: number;
  respondeeLinks: {
    id: string;
    name: string;
    email: string;
    link: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      teamId: string;
    };

    const { teamId } = body;

    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.ownerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const respondees = await Respondee.find({ teamId });

    if (respondees.length === 0) {
      return NextResponse.json({ error: 'No respondees found for this team' }, { status: 400 });
    }

    const surveyId = generateSurveyId();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const respondeeLinks = respondees.map((respondee) => {
      const uniqueLink = `${baseUrl}/questionnaire/${surveyId}/${String(respondee._id)}?teamId=${teamId}&email=${encodeURIComponent(respondee.email)}`;

      return {
        id: String(respondee._id),
        name: respondee.name,
        email: respondee.email,
        link: uniqueLink,
      };
    });

    await Promise.allSettled(
      respondeeLinks.map((respondee) =>
        sendEmail({ name: respondee.name, email: respondee.email, link: respondee.link })
      )
    );

    revalidatePath(`/surveys`);

    const response: SurveyRunResponse = {
      success: true,
      surveyId,
      respondeeCount: respondees.length,
      respondeeLinks,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error running survey:', error);
    return NextResponse.json({ error: 'Failed to run survey' }, { status: 500 });
  }
}
