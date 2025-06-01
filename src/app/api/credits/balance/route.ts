import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/server/database/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      credits: user.credits || 0,
      subscriptionTier: user.subscriptionTier || 'free',
      creditsExpirationDate: user.creditsExpirationDate,
      lastCreditsPurchase: user.lastCreditsPurchase,
      totalCreditsEverPurchased: user.totalCreditsEverPurchased || 0,
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
