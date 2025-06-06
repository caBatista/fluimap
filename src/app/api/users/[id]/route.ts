import { NextResponse } from 'next/server';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/server/database/db';
import User from '@/models/User';

async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function ck() {
  return await (clerkClient as unknown as () => Promise<import('@clerk/backend').ClerkClient>)();
}

const fallbackFromEmail = (email: string) => email.split('@')[0];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  let doc = await User.findOne({ clerkId: id });
  if (doc) return NextResponse.json(doc);

  const userId = await getUserIdOrThrow();
  if (userId !== id) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const me = await (await ck()).users.getUser(id);
  const isGoogle = me.externalAccounts?.some((a) => a.provider === 'oauth_google');

  const defaultName =
    me.fullName?.trim() ??
    me.username ??
    fallbackFromEmail(me.primaryEmailAddress?.emailAddress ?? '');

  if (!isGoogle) {
    try {
      doc = await new User({
        name: defaultName,
        email: me.primaryEmailAddress?.emailAddress ?? '',
        clerkId: id,
      }).save();
    } catch (err: unknown) {
      if (err instanceof Error && (err as any).code === 11000) {
        doc = await User.findOne({ clerkId: id });
      } else throw err;
    }
    return NextResponse.json(doc);
  }

  return NextResponse.json({
    name: defaultName,
    email: me.primaryEmailAddress?.emailAddress ?? '',
    clerkId: id,
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdOrThrow();
  if (userId !== id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  await connectDB();

  const updated = await User.findOneAndUpdate({ clerkId: id }, body, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  const [first, ...rest] = body.name.trim().split(' ');
  await (
    await ck()
  ).users.updateUser(id, {
    publicMetadata: { displayName: body.name.trim() },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getUserIdOrThrow();
    if (userId !== id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await connectDB();
    await User.deleteOne({ clerkId: id });

    await (await clerkClient()).users.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('DELETE /api/users/[id] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
