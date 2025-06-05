import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET() {
  try {
    await dbConnect();

    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ pricePerMonth: 1 });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
