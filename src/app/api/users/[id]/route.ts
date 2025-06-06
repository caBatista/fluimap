import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/server/database/db';
import User from '@/models/User';

async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const doc = await User.findOne({ clerkId: id });
  if (!doc) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdOrThrow();
  if (userId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  type Body = { name: string; email?: string };
  const body = (await req.json()) as Body;

  await connectDB();
  const updated = await User.findOneAndUpdate(
    { clerkId: id },
    { $set: { name: body.name, ...(body.email && { email: body.email }) } },
    { new: true, runValidators: true }
  );
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await (
    await clerkClient()
  ).users.updateUser(id, {
    publicMetadata: { displayName: body.name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdOrThrow();
  if (userId !== id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();
  await User.deleteOne({ clerkId: id });
  await (await clerkClient()).users.deleteUser(userId);

  return NextResponse.json({ success: true });
}
