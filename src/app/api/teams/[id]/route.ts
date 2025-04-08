import { type NextRequest, NextResponse } from 'next/server';
import Team, { TeamSchemaZod } from '@/models/Team';
import TeamRespondent from '@/models/teamRespondents';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/server/database/db';
import { revalidatePath } from 'next/cache';

// Helpers
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET: Retorna um time específico e seus membros
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const userId: string = await getUserIdOrThrow();

    const team = await Team.findById(id).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const members = await TeamRespondent.find({ teamId: id }).lean();

    return NextResponse.json({ team, members }, { status: 200 });
  } catch (err: unknown) {
    console.error('GET /api/teams/[id] error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
    const status = errorMessage === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

// PUT: Atualiza os dados de um time
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const userId: string = await getUserIdOrThrow();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rawBody: unknown = await request.json();
    const body = TeamSchemaZod.partial().parse(rawBody);

    const updatedTeam = await Team.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();

    revalidatePath('/dashboard');
    revalidatePath("/teamPage");

    return NextResponse.json({ team: updatedTeam }, { status: 200 });
  } catch (err: unknown) {
    console.error('PUT /api/teams/[id] error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
    const status = errorMessage === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

// DELETE: Remove um time e seus membros
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const userId: string = await getUserIdOrThrow();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Team.findByIdAndDelete(id);
    await TeamRespondent.deleteMany({ teamId: id });

    revalidatePath('/dashboard');
    revalidatePath("/teamPage");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('DELETE /api/teams/[id] error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
    const status = errorMessage === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
