import Respondee from '@/models/Respondee';
import Team from '@/models/Team';
import User from '@/models/User';
import dbConnect from '@/server/database/db';
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Bem-vindo(a), {respondee.name}!</h1>
      <p className="mb-2">
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
