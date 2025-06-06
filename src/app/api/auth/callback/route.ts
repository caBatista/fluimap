import { NextResponse } from 'next/server';
import dbConnect from '../../../../server/database/db';
import User from '../../../../models/User';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  await dbConnect();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: 'No Clerk user found' }, { status: 401 });
  }

  let user = await User.findOne({ clerkId: userId });
  user ??= await User.create({
    clerkId: clerkUser.id,
    name: clerkUser.fullName,
    email: clerkUser.primaryEmailAddress?.emailAddress,
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/dashboard`;
  return NextResponse.redirect(dashboardUrl);
}
