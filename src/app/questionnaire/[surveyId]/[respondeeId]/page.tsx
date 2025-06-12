import Respondee from '@/models/Respondee';
import Team from '@/models/Team';
import User from '@/models/User';
import dbConnect from '@/server/database/db';
import Response from '@/models/response';
import { CheckCircle } from 'lucide-react';
import Survey from '@/models/Survey';
import { Suspense } from 'react';
import AgreeButtons from '@/components/AgreeButtons';

export default async function QuestionnairePage({
  params,
  searchParams,
}: {
  params: Promise<{ surveyId: string; respondeeId: string }>;
  searchParams: Promise<{ teamId?: string; email?: string }>;
}) {
  const { surveyId, respondeeId } = await params;
  const { teamId, email } = await searchParams;
  await dbConnect();

  // Fetch respondee
  const respondee = await Respondee.findById(respondeeId).lean();
  if (!respondee) {
    return <div>Respondee not found.</div>;
  }

  // Fetch team
  const team = await Team.findById(respondee.teamId).lean();
  if (!team) {
    return <div>Team not found.</div>;
  }

  // Fetch inviter (owner)
  const inviter = await User.findOne({ clerkId: team.ownerId }).lean();
  const inviterName = inviter?.name ?? 'o responsável pelo time';

  // Query the survey to check status
  const survey = await Survey.findById(surveyId).lean();
  if (survey && survey.status === 'fechado') {
    return (
      <div className="flex max-h-screen min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-primary px-6 text-center text-white">
        <h1 className="mb-8 text-3xl font-semibold">
          Flu<span className="font-bold">iMap</span>
        </h1>
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-5xl font-bold">Pesquisa encerrada</h2>
          <p className="text-2xl leading-relaxed">
            Esta pesquisa foi encerrada.
            <br />
            Obrigado pelo seu interesse!
          </p>
          <CheckCircle size={72} strokeWidth={1.5} />
        </div>
      </div>
    );
  }

  // Check if response already exists for this survey and email
  let alreadyAnswered = false;
  if (email) {
    const existingResponse = await Response.findOne({ surveyId, email }).lean();
    alreadyAnswered = !!existingResponse;
  }

  if (alreadyAnswered) {
    return (
      <div className="flex max-h-screen min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-primary px-6 text-center text-white">
        <h1 className="mb-8 text-3xl font-semibold">
          Flu<span className="font-bold">iMap</span>
        </h1>
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-5xl font-bold">Pesquisa já respondida</h2>
          <p className="text-2xl leading-relaxed">
            Você já respondeu a esta pesquisa.
            <br />
            Obrigado pela sua participação!
          </p>
          <CheckCircle size={72} strokeWidth={1.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Bem-vindo(a), {respondee.name}!</h1>
      <p className="mb-2 text-center">
        Você foi convidado(a) por <span className="font-semibold">{inviterName}</span> para
        participar de uma pesquisa.
      </p>
      <p className="mb-6">Deseja participar?</p>
      <Suspense fallback={<div>Carregando...</div>}>
        <AgreeButtons surveyId={surveyId} respondeeId={respondeeId} teamId={teamId} email={email} />
      </Suspense>
    </div>
  );
}
